<?php

use RdKafka\Conf;
use RdKafka\KafkaConsumer;

$brokers = getenv('KAFKA_BROKERS') ?: 'sudosquad_kafka:19092';
$clientId = getenv('KAFKA_CLIENT_ID') ?: 'sudosquad-notificaciones';
$groupId = getenv('KAFKA_GROUP_ID') ?: 'sudosquad-notificaciones-service';
$topic = getenv('KAFKA_TOPIC_PROYECTO_REGISTRADO') ?: 'proyectos.registrados';

echo "Microservicio de notificaciones iniciado.\n";
echo "Broker Kafka: {$brokers}\n";
echo "Topic: {$topic}\n";
echo "Group ID: {$groupId}\n\n";

$conf = new Conf();
$conf->set('bootstrap.servers', $brokers);
$conf->set('client.id', $clientId);
$conf->set('group.id', $groupId);
$conf->set('auto.offset.reset', 'earliest');
$conf->set('enable.auto.commit', 'true');

$consumer = new KafkaConsumer($conf);
$consumer->subscribe([$topic]);

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

    if ($event !== 'proyecto.registrado') {
        echo "Evento ignorado: {$event}\n";
        return;
    }

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
        echo "Notificación simulada enviada a {$estudianteEmail}\n";
    } else {
        echo "No se pudo notificar: estudiante sin correo.\n";
    }

    echo "========================================\n\n";
}
