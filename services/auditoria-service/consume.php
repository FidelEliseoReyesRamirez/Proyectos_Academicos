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
echo "Group ID: {$groupId}\n\n";

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
