<?php

namespace App\Services;

use RdKafka\Conf;
use RdKafka\Producer;
use RuntimeException;

class KafkaProducerService
{
    private Producer $producer;

    public function __construct()
    {
        $brokers = env('KAFKA_BROKERS', 'sudosquad_kafka:9092');

        $conf = new Conf();
        $conf->set('metadata.broker.list', $brokers);
        $conf->set('socket.timeout.ms', '10000');
        $conf->set('message.timeout.ms', '10000');

        $this->producer = new Producer($conf);
        $this->producer->addBrokers($brokers);
    }

    public function publish(string $topicName, array $payload, ?string $key = null): void
    {
        $topic = $this->producer->newTopic($topicName);

        $message = json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
        );

        if ($message === false) {
            throw new RuntimeException('No se pudo convertir el evento Kafka a JSON.');
        }

        $topic->produce(
            \RD_KAFKA_PARTITION_UA,
            0,
            $message,
            $key,
        );

        $this->producer->poll(0);

        $result = $this->producer->flush(10000);

        if ($result !== \RD_KAFKA_RESP_ERR_NO_ERROR) {
            throw new RuntimeException('No se pudo publicar el evento en Kafka.');
        }
    }
}