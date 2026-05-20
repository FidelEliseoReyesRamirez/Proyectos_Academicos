<?php

use RdKafka\Conf;
use RdKafka\KafkaConsumer;

$brokers = getenv('KAFKA_BROKERS') ?: 'sudosquad_kafka:19092';
$clientId = getenv('KAFKA_CLIENT_ID') ?: 'sudosquad-auditoria';
$groupId = getenv('KAFKA_GROUP_ID') ?: 'sudosquad-auditoria-service';

$topicProyectoActualizado = getenv('KAFKA_TOPIC_PROYECTO_ACTUALIZADO') ?: 'proyectos.actualizados';
$topicProyectoEliminado = getenv('KAFKA_TOPIC_PROYECTO_ELIMINADO') ?: 'proyectos.eliminados';
$topicProyectoRestaurado = getenv('KAFKA_TOPIC_PROYECTO_RESTAURADO') ?: 'proyectos.restaurados';
$topicUsuariosEventos = getenv('KAFKA_TOPIC_USUARIOS_EVENTOS') ?: 'usuarios.eventos';
$topicAuthEventos = getenv('KAFKA_TOPIC_AUTH_EVENTOS') ?: 'auth.eventos';

$auditDbHost = getenv('AUDIT_DB_HOST') ?: 'sudosquad_auditoria_db';
$auditDbPort = getenv('AUDIT_DB_PORT') ?: '5432';
$auditDbDatabase = getenv('AUDIT_DB_DATABASE') ?: 'sudosquad_auditoria_db';
$auditDbUsername = getenv('AUDIT_DB_USERNAME') ?: 'sudosquad_auditoria_user';
$auditDbPassword = getenv('AUDIT_DB_PASSWORD') ?: 'sudosquad_auditoria_secret_2026';

$topics = [
    $topicProyectoActualizado,
    $topicProyectoEliminado,
    $topicProyectoRestaurado,
    $topicUsuariosEventos,
    $topicAuthEventos,
];

echo "Microservicio de auditoria iniciado.\n";
echo "Broker Kafka: {$brokers}\n";
echo "Topics: " . implode(', ', $topics) . "\n";
echo "Group ID: {$groupId}\n";
echo "Base auditoria: {$auditDbHost}:{$auditDbPort}/{$auditDbDatabase}\n\n";

$conf = new Conf();
$conf->set('bootstrap.servers', $brokers);
$conf->set('client.id', $clientId);
$conf->set('group.id', $groupId);
$conf->set('auto.offset.reset', 'earliest');
$conf->set('enable.auto.commit', 'true');

$consumer = new KafkaConsumer($conf);
$consumer->subscribe($topics);

while (true) {
    $message = $consumer->consume(120000);

    switch ($message->err) {
        case RD_KAFKA_RESP_ERR_NO_ERROR:
            procesarMensaje($message->payload);
            break;

        case RD_KAFKA_RESP_ERR__PARTITION_EOF:
            break;

        case RD_KAFKA_RESP_ERR__TIMED_OUT:
            echo "Esperando eventos de auditoria...\n";
            break;

        default:
            echo "Error Kafka: {$message->errstr()}\n";
            break;
    }
}

function procesarMensaje(?string $rawPayload): void
{
    if (!$rawPayload) {
        echo "Evento vacío ignorado.\n";
        return;
    }

    $payload = json_decode($rawPayload, true);

    if (!is_array($payload)) {
        echo "Evento inválido ignorado.\n";
        return;
    }

    $event = $payload['event'] ?? null;

    if (! guardarEventoAuditoria($payload, $rawPayload)) {
        return;
    }

    match ($event) {
        'proyecto.actualizado' => procesarProyectoActualizado($payload),
        'proyecto.eliminado' => procesarProyectoEliminado($payload),
        'proyecto.restaurado' => procesarProyectoRestaurado($payload),

        'usuario.creado',
        'usuario.actualizado',
        'usuario.desactivado',
        'usuario.restaurado',
        'usuario.password_actualizada' => procesarEventoUsuario($payload),

        'auth.login_exitoso',
        'auth.login_fallido',
        'auth.cuenta_bloqueada',
        'auth.logout' => procesarEventoAuth($payload),

        default => print "Evento ignorado por auditoria: {$event}\n",
    };
}

function datosBase(array $payload): array
{
    $data = $payload['data'] ?? [];

    return [
        'codigo' => $data['codigo'] ?? 'SIN-CODIGO',
        'titulo' => $data['titulo'] ?? 'Sin título',
        'usuario' => $data['usuario']['nombre'] ?? 'Usuario no definido',
        'rol' => $data['usuario']['rol'] ?? 'rol_no_definido',
        'occurred_at' => $payload['occurred_at'] ?? 'fecha_no_definida',
    ];
}

function procesarProyectoActualizado(array $payload): void
{
    $base = datosBase($payload);
    $cambios = $payload['data']['cambios'] ?? [];

    echo "\n========================================\n";
    echo "Evento recibido: proyecto.actualizado\n";
    echo "Proyecto: {$base['codigo']} - {$base['titulo']}\n";
    echo "Usuario: {$base['usuario']} ({$base['rol']})\n";
    echo "Fecha evento: {$base['occurred_at']}\n";
    echo "Cambios detectados:\n";

    if (empty($cambios)) {
        echo "- Sin cambios detallados.\n";
    } else {
        foreach ($cambios as $campo => $valores) {
            $antes = normalizarValor($valores['antes'] ?? null);
            $despues = normalizarValor($valores['despues'] ?? null);

            echo "- {$campo}: {$antes} -> {$despues}\n";
        }
    }

    echo "Auditoria registrada en logs.\n";
    echo "========================================\n\n";
}

function procesarProyectoEliminado(array $payload): void
{
    $base = datosBase($payload);
    $deletedAt = $payload['data']['deleted_at'] ?? 'fecha_no_definida';

    echo "\n========================================\n";
    echo "Evento recibido: proyecto.eliminado\n";
    echo "Proyecto: {$base['codigo']} - {$base['titulo']}\n";
    echo "Eliminado por: {$base['usuario']} ({$base['rol']})\n";
    echo "Fecha eliminación: {$deletedAt}\n";
    echo "Auditoria registrada en logs.\n";
    echo "========================================\n\n";
}

function procesarProyectoRestaurado(array $payload): void
{
    $base = datosBase($payload);
    $restoredAt = $payload['data']['restored_at'] ?? 'fecha_no_definida';

    echo "\n========================================\n";
    echo "Evento recibido: proyecto.restaurado\n";
    echo "Proyecto: {$base['codigo']} - {$base['titulo']}\n";
    echo "Restaurado por: {$base['usuario']} ({$base['rol']})\n";
    echo "Fecha restauración: {$restoredAt}\n";
    echo "Auditoria registrada en logs.\n";
    echo "========================================\n\n";
}

function procesarEventoUsuario(array $payload): void
{
    $event = $payload['event'] ?? 'usuario.evento_desconocido';
    $data = $payload['data'] ?? [];

    $nombre = $data['nombre'] ?? 'Usuario no definido';
    $email = $data['email'] ?? 'email_no_definido';
    $rol = $data['rol'] ?? 'rol_no_definido';
    $activo = array_key_exists('activo', $data) ? normalizarValor((bool) $data['activo']) : 'estado_no_definido';
    $usuarioAccion = $data['usuario_accion']['nombre'] ?? 'Sistema / registro público';
    $rolAccion = $data['usuario_accion']['rol'] ?? 'sin_rol';
    $occurredAt = $payload['occurred_at'] ?? 'fecha_no_definida';

    echo "\n========================================\n";
    echo "Evento recibido: {$event}\n";
    echo "Usuario afectado: {$nombre} <{$email}>\n";
    echo "Rol: {$rol}\n";
    echo "Activo: {$activo}\n";
    echo "Ejecutado por: {$usuarioAccion} ({$rolAccion})\n";
    echo "Fecha evento: {$occurredAt}\n";

    if (isset($data['cambios']) && is_array($data['cambios'])) {
        echo "Cambios detectados:\n";

        foreach ($data['cambios'] as $campo => $valores) {
            $anterior = normalizarValor($valores['anterior'] ?? null);
            $nuevo = normalizarValor($valores['nuevo'] ?? null);

            echo "- {$campo}: {$anterior} -> {$nuevo}\n";
        }
    }

    if (array_key_exists('estado_anterior', $data) || array_key_exists('estado_nuevo', $data)) {
        echo "Estado anterior: " . normalizarValor($data['estado_anterior'] ?? null) . "\n";
        echo "Estado nuevo: " . normalizarValor($data['estado_nuevo'] ?? null) . "\n";
    }

    echo "Auditoria de usuario registrada en logs.\n";
    echo "========================================\n\n";
}

function procesarEventoAuth(array $payload): void
{
    $event = $payload['event'] ?? 'auth.evento_desconocido';
    $data = $payload['data'] ?? [];
    $usuario = $data['usuario'] ?? null;

    $nombre = is_array($usuario) ? ($usuario['nombre'] ?? 'Usuario no definido') : 'Usuario no definido';
    $email = is_array($usuario) ? ($usuario['email'] ?? ($data['email'] ?? 'email_no_definido')) : ($data['email'] ?? 'email_no_definido');
    $rol = is_array($usuario) ? ($usuario['rol'] ?? 'rol_no_definido') : 'rol_no_definido';

    echo "\n========================================\n";
    echo "Evento recibido: {$event}\n";
    echo "Usuario: {$nombre} <{$email}>\n";
    echo "Rol: {$rol}\n";
    echo "IP: " . ($data['ip_address'] ?? 'ip_no_definida') . "\n";
    echo "Descripción: " . ($data['descripcion'] ?? 'Sin descripción') . "\n";
    echo "Fecha evento: " . ($payload['occurred_at'] ?? 'fecha_no_definida') . "\n";

    if (is_array($usuario) && array_key_exists('intentos_fallidos', $usuario)) {
        echo "Intentos fallidos: " . normalizarValor($usuario['intentos_fallidos']) . "\n";
    }

    if (is_array($usuario) && array_key_exists('bloqueado_hasta', $usuario)) {
        echo "Bloqueado hasta: " . normalizarValor($usuario['bloqueado_hasta']) . "\n";
    }

    echo "Auditoria de autenticación registrada en logs.\n";
    echo "========================================\n\n";
}

function conexionAuditoria(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('AUDIT_DB_HOST') ?: 'sudosquad_auditoria_db';
    $port = getenv('AUDIT_DB_PORT') ?: '5432';
    $database = getenv('AUDIT_DB_DATABASE') ?: 'sudosquad_auditoria_db';
    $username = getenv('AUDIT_DB_USERNAME') ?: 'sudosquad_auditoria_user';
    $password = getenv('AUDIT_DB_PASSWORD') ?: 'sudosquad_auditoria_secret_2026';

    $dsn = "pgsql:host={$host};port={$port};dbname={$database}";

    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function guardarEventoAuditoria(array $payload, string $rawPayload): bool
{
    try {
        $event = $payload['event'] ?? 'evento.desconocido';
        $eventId = $payload['event_id'] ?? hash('sha256', $rawPayload);
        $data = $payload['data'] ?? [];
        $producer = $payload['producer'] ?? [];

        $tipo = tipoAgregado($event);
        $actor = actorEvento($event, $data);
        $target = targetEvento($event, $data);
        $aggregateId = aggregateIdEvento($event, $data);
        $descripcion = descripcionEvento($event, $data);

        $stmt = conexionAuditoria()->prepare(
            'INSERT INTO audit_events (
                event_id,
                event,
                module,
                aggregate_type,
                aggregate_id,
                actor_id,
                actor_name,
                actor_email,
                actor_role,
                target_name,
                target_email,
                description,
                ip_address,
                user_agent,
                payload,
                occurred_at
            ) VALUES (
                :event_id,
                :event,
                :module,
                :aggregate_type,
                :aggregate_id,
                :actor_id,
                :actor_name,
                :actor_email,
                :actor_role,
                :target_name,
                :target_email,
                :description,
                :ip_address,
                :user_agent,
                :payload,
                :occurred_at
            )
            ON CONFLICT (event_id) DO NOTHING'
        );

        $stmt->execute([
            'event_id' => $eventId,
            'event' => $event,
            'module' => $producer['module'] ?? null,
            'aggregate_type' => $tipo,
            'aggregate_id' => $aggregateId,
            'actor_id' => $actor['id'] ?? null,
            'actor_name' => $actor['nombre'] ?? null,
            'actor_email' => $actor['email'] ?? null,
            'actor_role' => $actor['rol'] ?? null,
            'target_name' => $target['nombre'] ?? null,
            'target_email' => $target['email'] ?? null,
            'description' => $descripcion,
            'ip_address' => $data['ip_address'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
            'payload' => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            'occurred_at' => $payload['occurred_at'] ?? null,
        ]);

        if ($stmt->rowCount() === 0) {
            echo "Evento duplicado ignorado en audit_events: {$event}\n";
            return false;
        }

        echo "Evento persistido en audit_events: {$event}\n";

        return true;
    } catch (Throwable $e) {
        echo "Error guardando auditoria en BD: {$e->getMessage()}\n";

        return false;
    }
}

function tipoAgregado(?string $event): ?string
{
    if (!$event) {
        return null;
    }

    return match (true) {
        str_starts_with($event, 'proyecto.') => 'proyecto',
        str_starts_with($event, 'usuario.') => 'usuario',
        str_starts_with($event, 'auth.') => 'auth',
        default => 'desconocido',
    };
}

function aggregateIdEvento(?string $event, array $data): ?string
{
    if (!$event) {
        return null;
    }

    if (str_starts_with($event, 'auth.')) {
        $usuario = $data['usuario'] ?? null;

        if (is_array($usuario) && isset($usuario['id'])) {
            return (string) $usuario['id'];
        }

        return isset($data['email']) ? (string) $data['email'] : null;
    }

    return isset($data['id']) ? (string) $data['id'] : null;
}

function actorEvento(?string $event, array $data): array
{
    if ($event && str_starts_with($event, 'usuario.')) {
        $actor = $data['usuario_accion'] ?? null;

        return is_array($actor) ? $actor : [];
    }

    if ($event && str_starts_with($event, 'auth.')) {
        $actor = $data['usuario'] ?? null;

        return is_array($actor) ? $actor : [];
    }

    $actor = $data['usuario'] ?? null;

    return is_array($actor) ? $actor : [];
}

function targetEvento(?string $event, array $data): array
{
    if ($event && str_starts_with($event, 'proyecto.')) {
        return [
            'nombre' => $data['titulo'] ?? null,
            'email' => null,
        ];
    }

    if ($event && str_starts_with($event, 'usuario.')) {
        return [
            'nombre' => $data['nombre'] ?? null,
            'email' => $data['email'] ?? null,
        ];
    }

    if ($event && str_starts_with($event, 'auth.')) {
        $usuario = $data['usuario'] ?? null;

        return [
            'nombre' => is_array($usuario) ? ($usuario['nombre'] ?? null) : null,
            'email' => is_array($usuario) ? ($usuario['email'] ?? ($data['email'] ?? null)) : ($data['email'] ?? null),
        ];
    }

    return [];
}

function descripcionEvento(?string $event, array $data): string
{
    if (isset($data['descripcion'])) {
        return (string) $data['descripcion'];
    }

    return match ($event) {
        'usuario.creado' => 'Usuario creado.',
        'usuario.actualizado' => 'Usuario actualizado.',
        'usuario.desactivado' => 'Usuario desactivado.',
        'usuario.restaurado' => 'Usuario restaurado.',
        'usuario.password_actualizada' => 'Contraseña de usuario actualizada.',
        'auth.login_exitoso' => 'Inicio de sesión exitoso.',
        'auth.login_fallido' => 'Intento fallido de inicio de sesión.',
        'auth.cuenta_bloqueada' => 'Cuenta bloqueada por intentos fallidos.',
        'auth.logout' => 'Cierre de sesión.',
        default => 'Evento de auditoria consumido desde Kafka.',
    };
}

function normalizarValor(mixed $valor): string
{
    if ($valor === null) {
        return 'null';
    }

    if (is_bool($valor)) {
        return $valor ? 'true' : 'false';
    }

    if (is_array($valor)) {
        return json_encode($valor, JSON_UNESCAPED_UNICODE);
    }

    return (string) $valor;
}
