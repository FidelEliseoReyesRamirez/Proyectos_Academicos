<?php

use RdKafka\Conf;
use RdKafka\KafkaConsumer;

$brokers = getenv('KAFKA_BROKERS') ?: 'sudosquad_kafka:19092';
$clientId = getenv('KAFKA_CLIENT_ID') ?: 'sudosquad-notificaciones';
$groupId = getenv('KAFKA_GROUP_ID') ?: 'sudosquad-notificaciones-service';

$topicProyectoRegistrado = getenv('KAFKA_TOPIC_PROYECTO_REGISTRADO') ?: 'proyectos.registrados';
$topicProyectoEstadoActualizado = getenv('KAFKA_TOPIC_PROYECTO_ESTADO_ACTUALIZADO') ?: 'proyectos.estado_actualizado';

$topics = [
    $topicProyectoRegistrado,
    $topicProyectoEstadoActualizado,
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

    match ($event) {
        'proyecto.registrado' => procesarProyectoRegistrado($payload),
        'proyecto.estado_actualizado' => procesarProyectoEstadoActualizado($payload),
        default => print "Evento ignorado: {$event}\n",
    };
}

function procesarProyectoRegistrado(array $payload): void
{
    $data = $payload['data'] ?? [];

    $codigo = $data['codigo'] ?? 'SIN-CODIGO';
    $titulo = $data['titulo'] ?? 'Sin título';

    $estudianteNombre = $data['estudiante']['nombre'] ?? 'Estudiante no definido';
    $estudianteEmail = $data['estudiante']['email'] ?? null;

    $tutorNombre = $data['tutor']['nombre'] ?? 'Tutor no definido';
    $periodoNombre = $data['periodo']['nombre'] ?? 'Periodo no definido';

    echo "\n========================================\n";
    echo "Evento recibido: proyecto.registrado\n";
    echo "Proyecto: {$codigo} - {$titulo}\n";
    echo "Estudiante: {$estudianteNombre}\n";
    echo "Correo estudiante: " . ($estudianteEmail ?: 'sin correo') . "\n";
    echo "Tutor: {$tutorNombre}\n";
    echo "Periodo: {$periodoNombre}\n";

    if ($estudianteEmail) {
        echo "Notificación simulada: registro de proyecto enviado a {$estudianteEmail}\n";
    } else {
        echo "No se pudo notificar: estudiante sin correo.\n";
    }

    echo "========================================\n\n";
}

function procesarProyectoEstadoActualizado(array $payload): void
{
    $data = $payload['data'] ?? [];

    $codigo = $data['codigo'] ?? 'SIN-CODIGO';
    $titulo = $data['titulo'] ?? 'Sin título';

    $estadoAnterior = $data['estado_anterior'] ?? 'sin_estado_anterior';
    $estadoNuevo = $data['estado_nuevo'] ?? ($data['estado'] ?? 'sin_estado_nuevo');

    $estudianteNombre = $data['estudiante']['nombre'] ?? 'Estudiante no definido';
    $estudianteEmail = $data['estudiante']['email'] ?? null;

    $actualizadoPor = $data['actualizado_por']['nombre'] ?? 'Usuario no definido';

    echo "\n========================================\n";
    echo "Evento recibido: proyecto.estado_actualizado\n";
    echo "Proyecto: {$codigo} - {$titulo}\n";
    echo "Cambio de estado: {$estadoAnterior} -> {$estadoNuevo}\n";
    echo "Estudiante: {$estudianteNombre}\n";
    echo "Correo estudiante: " . ($estudianteEmail ?: 'sin correo') . "\n";
    echo "Actualizado por: {$actualizadoPor}\n";

    if ($estudianteEmail) {
        echo "Notificación simulada: cambio de estado enviado a {$estudianteEmail}\n";
    } else {
        echo "No se pudo notificar: estudiante sin correo.\n";
    }

    echo "========================================\n\n";
}
