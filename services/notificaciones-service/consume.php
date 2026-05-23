<?php

use RdKafka\Conf;
use RdKafka\KafkaConsumer;

$brokers = getenv('KAFKA_BROKERS') ?: 'sudosquad_kafka:19092';
$clientId = getenv('KAFKA_CLIENT_ID') ?: 'sudosquad-notificaciones';
$groupId = getenv('KAFKA_GROUP_ID') ?: 'sudosquad-notificaciones-service';

$topicProyectoRegistrado = getenv('KAFKA_TOPIC_PROYECTO_REGISTRADO') ?: 'proyectos.registrados';
$topicProyectoEstadoActualizado = getenv('KAFKA_TOPIC_PROYECTO_ESTADO_ACTUALIZADO') ?: 'proyectos.estado_actualizado';
$topicProyectoEntregas = getenv('KAFKA_TOPIC_PROYECTO_ENTREGAS') ?: 'proyectos.entregas';

$topics = [
    $topicProyectoRegistrado,
    $topicProyectoEstadoActualizado,
    $topicProyectoEntregas,
];

echo "Microservicio de notificaciones iniciado.\n";
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
            echo "Esperando eventos...\n";
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

    switch ($event) {
        case 'proyecto.registrado':
            procesarProyectoRegistrado($payload);
            break;

        case 'proyecto.estado_actualizado':
            procesarProyectoEstadoActualizado($payload);
            break;

        case 'proyecto.entrega_subida':
            procesarProyectoEntregaSubida($payload);
            break;

        case 'proyecto.correcciones_solicitadas':
            procesarProyectoCorreccionesSolicitadas($payload);
            break;

        case 'proyecto.derivado_revision':
            procesarProyectoDerivadoRevision($payload);
            break;

        case 'proyecto.archivo_revision_subido':
        case 'proyecto.revision_devuelta':
        case 'proyecto.revision_registrada':
            procesarProyectoRevisionDevuelta($payload);
            break;

        case 'proyecto.documento_trabajo_actualizado':
            procesarDocumentoTrabajoActualizado($payload);
            break;

        case 'proyecto.archivo_reemplazado':
            procesarArchivoReemplazado($payload);
            break;

        case 'proyecto.reunion_tutoria_registrada':
            procesarReunionTutoriaRegistrada($payload);
            break;

        default:
            print "Evento ignorado: {$event}\n";
            break;
    }
}

function procesarProyectoRegistrado(array $payload): void
{
    $data = $payload['data'] ?? [];

    $codigo = $data['codigo'] ?? 'SIN-CODIGO';
    $titulo = $data['titulo'] ?? 'Sin título';
    $estudianteNombre = $data['estudiante']['nombre'] ?? 'Estudiante no definido';
    $estudianteEmail = $data['estudiante']['email'] ?? null;

    echo "\n========================================\n";
    echo "Evento recibido: proyecto.registrado\n";
    echo "Proyecto: {$codigo} - {$titulo}\n";
    echo "Estudiante: {$estudianteNombre}\n";
    echo "Correo estudiante: " . ($estudianteEmail ?: 'sin correo') . "\n";
    echo "========================================\n\n";
}

function procesarProyectoEstadoActualizado(array $payload): void
{
    $data = $payload['data'] ?? [];

    $codigo = $data['codigo'] ?? 'SIN-CODIGO';
    $titulo = $data['titulo'] ?? 'Sin título';
    $estadoAnterior = $data['estado_anterior'] ?? 'sin_estado_anterior';
    $estadoNuevo = $data['estado_nuevo'] ?? ($data['estado'] ?? 'sin_estado_nuevo');
    $estudianteEmail = $data['estudiante']['email'] ?? null;

    echo "\n========================================\n";
    echo "Evento recibido: proyecto.estado_actualizado\n";
    echo "Proyecto: {$codigo} - {$titulo}\n";
    echo "Cambio de estado: {$estadoAnterior} -> {$estadoNuevo}\n";
    echo "Correo estudiante: " . ($estudianteEmail ?: 'sin correo') . "\n";
    echo "========================================\n\n";
}

function procesarProyectoEntregaSubida(array $payload): void
{
    $data = $payload['data'] ?? [];

    $proyecto = $data['proyecto'] ?? [];
    $entrega = $data['entrega'] ?? [];
    $archivo = $data['archivo'] ?? [];
    $estudiante = $data['estudiante'] ?? [];
    $tutor = $data['tutor'] ?? null;
    $revisores = is_array($data['revisores'] ?? null) ? $data['revisores'] : [];

    $codigo = $proyecto['codigo'] ?? 'SIN-CODIGO';
    $tituloProyecto = $proyecto['titulo'] ?? 'Sin título';
    $tituloEntrega = $entrega['titulo'] ?? 'Sin título de entrega';
    $version = $entrega['numero_version'] ?? 'N/D';
    $estudianteNombre = $estudiante['nombre'] ?? 'Estudiante no definido';
    $archivoNombre = $archivo['nombre_original'] ?? 'archivo no definido';

    $destinatarios = [];

    agregarDestinatario($destinatarios, $estudiante, 'Estudiante');
    agregarDestinatario($destinatarios, $tutor, 'Tutor');


    foreach ($revisores as $revisor) {
        if (is_array($revisor) && !empty($revisor['email'])) {
            $destinatarios[$revisor['email']] = $revisor['nombre'] ?? 'Revisor';
        }
    }

    echo "\n========================================\n";
    echo "Evento recibido: proyecto.entrega_subida\n";
    echo "Proyecto: {$codigo} - {$tituloProyecto}\n";
    echo "Entrega: versión {$version} - {$tituloEntrega}\n";
    echo "Estudiante: {$estudianteNombre}\n";
    echo "Archivo: {$archivoNombre}\n";
    echo "Destinatarios: " . (count($destinatarios) ? implode(', ', array_keys($destinatarios)) : 'sin destinatarios') . "\n";

    if (count($destinatarios) === 0) {
        echo "No se envió correo: no hay tutor ni revisores con email.\n";
        echo "========================================\n\n";
        return;
    }

    $subject = "[Seguimiento] Nueva entrega subida - {$codigo}";
    $body = crearCuerpoEntregaSubida(
        $codigo,
        $tituloProyecto,
        $tituloEntrega,
        (string) $version,
        $estudianteNombre,
        $archivoNombre
    );

    foreach ($destinatarios as $email => $nombre) {
        try {
            enviarCorreoSmtp($email, $nombre, $subject, $body);
            echo "Correo enviado a {$email}\n";
        } catch (Throwable $exception) {
            echo "Error enviando correo a {$email}: {$exception->getMessage()}\n";
        }
    }

    echo "========================================\n\n";
}

function crearCuerpoEntregaSubida(
    string $codigo,
    string $tituloProyecto,
    string $tituloEntrega,
    string $version,
    string $estudianteNombre,
    string $archivoNombre
): string {
    return "
        <h2>Nueva entrega registrada</h2>
        <p>Se registró una nueva entrega en el sistema de seguimiento académico.</p>

        <table cellpadding=\"6\" cellspacing=\"0\" border=\"0\">
            <tr><td><strong>Proyecto:</strong></td><td>{$codigo} - {$tituloProyecto}</td></tr>
            <tr><td><strong>Entrega:</strong></td><td>Versión {$version} - {$tituloEntrega}</td></tr>
            <tr><td><strong>Estudiante:</strong></td><td>{$estudianteNombre}</td></tr>
            <tr><td><strong>Archivo:</strong></td><td>{$archivoNombre}</td></tr>
        </table>

        <p>Ingrese al sistema para revisar el documento y registrar observaciones o devolver el archivo revisado.</p>
    ";
}


function procesarProyectoCorreccionesSolicitadas(array $payload): void
{
    $data = $payload['data'] ?? [];

    $proyecto = $data['proyecto'] ?? [];
    $entrega = $data['entrega'] ?? [];
    $estudiante = $data['estudiante'] ?? [];
    $tutor = $data['tutor'] ?? [];
    $revisores = is_array($data['revisores'] ?? null) ? $data['revisores'] : [];
    $comentario = $data['comentario'] ?? 'Sin comentario registrado.';

    $codigo = $proyecto['codigo'] ?? 'SIN-CODIGO';
    $tituloProyecto = $proyecto['titulo'] ?? 'Sin título';
    $tituloEntrega = $entrega['titulo'] ?? 'Entrega no especificada';
    $version = $entrega['numero_version'] ?? 'N/D';

    $destinatarios = destinatariosAcademicos($estudiante, $tutor, $revisores);

    $subject = "[Seguimiento] Correcciones solicitadas - {$codigo}";
    $body = crearCuerpoEventoAcademico(
        'Correcciones solicitadas por el tutor',
        'El tutor solicitó correcciones sobre una entrega del proyecto.',
        [
            'Proyecto' => "{$codigo} - {$tituloProyecto}",
            'Entrega' => "Versión {$version} - {$tituloEntrega}",
            'Comentario' => $comentario,
        ],
        'Ingrese al sistema para revisar las observaciones y continuar el flujo académico.'
    );

    enviarNotificacionMultiple('proyecto.correcciones_solicitadas', $destinatarios, $subject, $body);
}

function procesarProyectoDerivadoRevision(array $payload): void
{
    $data = $payload['data'] ?? [];

    $proyecto = $data['proyecto'] ?? [];
    $entrega = $data['entrega'] ?? [];
    $estudiante = $data['estudiante'] ?? [];
    $tutor = $data['tutor'] ?? [];
    $revisores = is_array($data['revisores'] ?? null) ? $data['revisores'] : [];
    $comentario = $data['comentario'] ?? 'Sin comentario registrado.';

    $codigo = $proyecto['codigo'] ?? 'SIN-CODIGO';
    $tituloProyecto = $proyecto['titulo'] ?? 'Sin título';
    $tituloEntrega = $entrega['titulo'] ?? 'Entrega no especificada';
    $version = $entrega['numero_version'] ?? 'N/D';

    $destinatarios = destinatariosAcademicos($estudiante, $tutor, $revisores);

    $subject = "[Seguimiento] Proyecto derivado a revisores - {$codigo}";
    $body = crearCuerpoEventoAcademico(
        'Proyecto derivado a revisión',
        'El tutor derivó una entrega para revisión por revisores asignados.',
        [
            'Proyecto' => "{$codigo} - {$tituloProyecto}",
            'Entrega' => "Versión {$version} - {$tituloEntrega}",
            'Comentario del tutor' => $comentario,
        ],
        'Ingrese al sistema para revisar el avance, devolver observaciones o subir el documento revisado.'
    );

    enviarNotificacionMultiple('proyecto.derivado_revision', $destinatarios, $subject, $body);
}

function procesarProyectoRevisionDevuelta(array $payload): void
{
    $data = $payload['data'] ?? [];

    $proyecto = $data['proyecto'] ?? [];
    $entrega = $data['entrega'] ?? [];
    $archivo = $data['archivo'] ?? [];
    $estudiante = $data['estudiante'] ?? [];
    $tutor = $data['tutor'] ?? [];
    $revisores = is_array($data['revisores'] ?? null) ? $data['revisores'] : [];
    $revision = $data['revision'] ?? [];

    $codigo = $proyecto['codigo'] ?? 'SIN-CODIGO';
    $tituloProyecto = $proyecto['titulo'] ?? 'Sin título';
    $tituloEntrega = $entrega['titulo'] ?? 'Entrega no especificada';
    $version = $entrega['numero_version'] ?? 'N/D';
    $resultado = $revision['resultado'] ?? ($data['resultado'] ?? 'sin_resultado');
    $comentario = $revision['comentario'] ?? ($data['comentario'] ?? 'Sin comentario registrado.');
    $archivoNombre = $archivo['nombre_original'] ?? 'archivo revisado no definido';

    $destinatarios = destinatariosAcademicos($estudiante, $tutor, $revisores);

    $subject = "[Seguimiento] Revisión devuelta - {$codigo}";
    $body = crearCuerpoEventoAcademico(
        'Revisión devuelta por revisor',
        'Un revisor devolvió el documento revisado dentro del sistema.',
        [
            'Proyecto' => "{$codigo} - {$tituloProyecto}",
            'Entrega' => "Versión {$version} - {$tituloEntrega}",
            'Resultado' => labelHumano($resultado),
            'Archivo revisado' => $archivoNombre,
            'Comentario' => $comentario,
        ],
        'Ingrese al sistema para consultar el documento revisado y continuar el flujo académico.'
    );

    enviarNotificacionMultiple('proyecto.revision_devuelta', $destinatarios, $subject, $body);
}

function procesarDocumentoTrabajoActualizado(array $payload): void
{
    $data = $payload['data'] ?? [];

    $proyecto = $data['proyecto'] ?? [];
    $documento = $data['documento_trabajo'] ?? [];
    $estudiante = $data['estudiante'] ?? [];
    $tutor = $data['tutor'] ?? [];
    $revisores = is_array($data['revisores'] ?? null) ? $data['revisores'] : [];

    $codigo = $proyecto['codigo'] ?? 'SIN-CODIGO';
    $tituloProyecto = $proyecto['titulo'] ?? 'Sin título';
    $tituloDocumento = $documento['titulo'] ?? 'Documento de trabajo';

    $destinatarios = destinatariosAcademicos($estudiante, $tutor, $revisores);

    $subject = "[Seguimiento] Documento de trabajo actualizado - {$codigo}";
    $body = crearCuerpoEventoAcademico(
        'Documento de trabajo actualizado',
        'Se actualizó el documento principal de trabajo del proyecto.',
        [
            'Proyecto' => "{$codigo} - {$tituloProyecto}",
            'Documento' => $tituloDocumento,
        ],
        'Ingrese al sistema para consultar el enlace vigente del documento de trabajo.'
    );

    enviarNotificacionMultiple('proyecto.documento_trabajo_actualizado', $destinatarios, $subject, $body);
}

function procesarArchivoReemplazado(array $payload): void
{
    $data = $payload['data'] ?? [];

    $proyecto = $data['proyecto'] ?? [];
    $archivoAnterior = $data['archivo_anterior'] ?? [];
    $archivoNuevo = $data['archivo_nuevo'] ?? [];
    $estudiante = $data['estudiante'] ?? [];
    $tutor = $data['tutor'] ?? [];
    $revisores = is_array($data['revisores'] ?? null) ? $data['revisores'] : [];
    $motivo = $data['motivo'] ?? 'Sin motivo registrado.';

    $codigo = $proyecto['codigo'] ?? 'SIN-CODIGO';
    $tituloProyecto = $proyecto['titulo'] ?? 'Sin título';
    $nombreAnterior = $archivoAnterior['nombre_original'] ?? 'archivo anterior';
    $nombreNuevo = $archivoNuevo['nombre_original'] ?? 'archivo nuevo';

    $destinatarios = destinatariosAcademicos($estudiante, $tutor, $revisores);

    $subject = "[Seguimiento] Archivo reemplazado - {$codigo}";
    $body = crearCuerpoEventoAcademico(
        'Archivo reemplazado',
        'Se reemplazó un archivo dentro del flujo de seguimiento académico.',
        [
            'Proyecto' => "{$codigo} - {$tituloProyecto}",
            'Archivo anterior' => $nombreAnterior,
            'Archivo nuevo' => $nombreNuevo,
            'Motivo' => $motivo,
        ],
        'El archivo anterior queda registrado como reemplazado para mantener trazabilidad.'
    );

    enviarNotificacionMultiple('proyecto.archivo_reemplazado', $destinatarios, $subject, $body);
}

function procesarReunionTutoriaRegistrada(array $payload): void
{
    $data = $payload['data'] ?? [];

    $proyecto = $data['proyecto'] ?? [];
    $reunion = $data['reunion'] ?? [];
    $estudiante = $data['estudiante'] ?? [];
    $tutor = $data['tutor'] ?? [];
    $revisores = is_array($data['revisores'] ?? null) ? $data['revisores'] : [];

    $codigo = $proyecto['codigo'] ?? 'SIN-CODIGO';
    $tituloProyecto = $proyecto['titulo'] ?? 'Sin título';
    $fecha = $reunion['fecha_reunion'] ?? 'Sin fecha';
    $modalidad = $reunion['modalidad'] ?? 'Sin modalidad';
    $temas = $reunion['temas_tratados'] ?? 'Sin temas registrados';
    $acuerdos = $reunion['acuerdos'] ?? 'Sin acuerdos registrados';

    $destinatarios = destinatariosAcademicos($estudiante, $tutor, $revisores);

    $subject = "[Seguimiento] Reunión de tutoría registrada - {$codigo}";
    $body = crearCuerpoEventoAcademico(
        'Reunión de tutoría registrada',
        'Se registró una reunión de seguimiento entre tutor y estudiante.',
        [
            'Proyecto' => "{$codigo} - {$tituloProyecto}",
            'Fecha' => $fecha,
            'Modalidad' => labelHumano($modalidad),
            'Temas tratados' => $temas,
            'Acuerdos' => $acuerdos,
        ],
        'Ingrese al sistema para consultar la constancia de la reunión y los compromisos establecidos.'
    );

    enviarNotificacionMultiple('proyecto.reunion_tutoria_registrada', $destinatarios, $subject, $body);
}


function destinatariosAcademicos(?array $estudiante, ?array $tutor, array $revisores): array
{
    $destinatarios = [];

    agregarDestinatario($destinatarios, $estudiante, 'Estudiante');
    agregarDestinatario($destinatarios, $tutor, 'Tutor');

    foreach ($revisores as $revisor) {
        agregarDestinatario($destinatarios, is_array($revisor) ? $revisor : null, 'Revisor');
    }

    return $destinatarios;
}

function agregarDestinatario(array &$destinatarios, ?array $usuario, string $fallbackName): void
{
    if (!is_array($usuario)) {
        return;
    }

    $email = trim((string) ($usuario['email'] ?? ''));

    if ($email === '') {
        return;
    }

    if (str_ends_with($email, '.test') || str_ends_with($email, '@example.com') || str_ends_with($email, '@example.test')) {
        echo "Destinatario omitido por correo de prueba: {$email}\n";
        return;
    }

    $destinatarios[$email] = $usuario['nombre'] ?? $usuario['name'] ?? $fallbackName;
}

function enviarNotificacionMultiple(string $event, array $destinatarios, string $subject, string $body): void
{
    echo "\n========================================\n";
    echo "Evento recibido: {$event}\n";
    echo "Destinatarios: " . (count($destinatarios) ? implode(', ', array_keys($destinatarios)) : 'sin destinatarios') . "\n";

    if (count($destinatarios) === 0) {
        echo "No se envió correo: no hay destinatarios con email.\n";
        echo "========================================\n\n";
        return;
    }

    foreach ($destinatarios as $email => $nombre) {
        try {
            enviarCorreoSmtp($email, $nombre, $subject, $body);
            echo "Correo enviado a {$email}\n";
        } catch (Throwable $exception) {
            echo "Error enviando correo a {$email}: {$exception->getMessage()}\n";
        }
    }

    echo "========================================\n\n";
}

function crearCuerpoEventoAcademico(string $titulo, string $descripcion, array $datos, string $cierre): string
{
    $rows = '';

    foreach ($datos as $label => $value) {
        $rows .= '<tr><td><strong>' . eHtml((string) $label) . ':</strong></td><td>' . eHtml((string) $value) . '</td></tr>';
    }

    return '
        <h2>' . eHtml($titulo) . '</h2>
        <p>' . eHtml($descripcion) . '</p>

        <table cellpadding="6" cellspacing="0" border="0">
            ' . $rows . '
        </table>

        <p>' . eHtml($cierre) . '</p>
    ';
}

function labelHumano(string $value): string
{
    return ucfirst(str_replace('_', ' ', $value));
}

function eHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}


function enviarCorreoSmtp(string $toEmail, string $toName, string $subject, string $htmlBody): void
{
    $host = getenv('MAIL_HOST') ?: 'smtp.gmail.com';
    $port = (int) (getenv('MAIL_PORT') ?: 587);
    $username = getenv('MAIL_USERNAME') ?: '';
    $password = getenv('MAIL_PASSWORD') ?: '';
    $encryption = strtolower((string) (getenv('MAIL_ENCRYPTION') ?: 'tls'));
    $fromEmail = getenv('MAIL_FROM_ADDRESS') ?: $username;
    $fromName = getenv('MAIL_FROM_NAME') ?: 'Seguimiento de Proyectos Académicos';

    if ($username === '' || $password === '' || $fromEmail === '') {
        throw new RuntimeException('SMTP no configurado: faltan MAIL_USERNAME, MAIL_PASSWORD o MAIL_FROM_ADDRESS.');
    }

    $transportHost = $encryption === 'ssl' ? "ssl://{$host}" : $host;

    $socket = stream_socket_client(
        "{$transportHost}:{$port}",
        $errno,
        $errstr,
        30,
        STREAM_CLIENT_CONNECT
    );

    if (!$socket) {
        throw new RuntimeException("No se pudo conectar al SMTP: {$errstr} ({$errno})");
    }

    smtpExpect($socket, [220]);
    smtpCommand($socket, "EHLO sudosquad_notificaciones", [250]);

    if ($encryption === 'tls') {
        smtpCommand($socket, "STARTTLS", [220]);

        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('No se pudo activar TLS con el servidor SMTP.');
        }

        smtpCommand($socket, "EHLO sudosquad_notificaciones", [250]);
    }

    smtpCommand($socket, "AUTH LOGIN", [334]);
    smtpCommand($socket, base64_encode($username), [334]);
    smtpCommand($socket, base64_encode($password), [235]);

    smtpCommand($socket, "MAIL FROM:<{$fromEmail}>", [250]);
    smtpCommand($socket, "RCPT TO:<{$toEmail}>", [250, 251]);
    smtpCommand($socket, "DATA", [354]);

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $message = '';
    $message .= "From: " . encodeHeaderName($fromName) . " <{$fromEmail}>\r\n";
    $message .= "To: " . encodeHeaderName($toName) . " <{$toEmail}>\r\n";
    $message .= "Subject: {$encodedSubject}\r\n";
    $message .= "MIME-Version: 1.0\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 8bit\r\n";
    $message .= "\r\n";
    $message .= $htmlBody . "\r\n";
    $message .= ".\r\n";

    fwrite($socket, $message);
    smtpExpect($socket, [250]);

    smtpCommand($socket, "QUIT", [221]);
    fclose($socket);
}

function smtpCommand($socket, string $command, array $expectedCodes): string
{
    fwrite($socket, $command . "\r\n");

    return smtpExpect($socket, $expectedCodes);
}

function smtpExpect($socket, array $expectedCodes): string
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;

        if (preg_match('/^(\d{3})\s/', $line, $matches)) {
            $code = (int) $matches[1];

            if (!in_array($code, $expectedCodes, true)) {
                throw new RuntimeException("Respuesta SMTP inesperada: {$response}");
            }

            return $response;
        }
    }

    throw new RuntimeException('Respuesta SMTP vacía o incompleta.');
}

function encodeHeaderName(string $name): string
{
    return '=?UTF-8?B?' . base64_encode($name) . '?=';
}
