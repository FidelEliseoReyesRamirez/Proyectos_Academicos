<?php

namespace App\Services;

use RuntimeException;
use RdKafka\Conf;
use RdKafka\Producer;

class KafkaProducerService
{
    public function publish(string $topic, array $payload, ?string $key = null): void
    {
        $conf = new Conf();

        $conf->set('bootstrap.servers', config('kafka.brokers'));
        $conf->set('client.id', config('kafka.client_id'));

        $producer = new Producer($conf);

        $message = json_encode($payload, JSON_THROW_ON_ERROR);

        $producerTopic = $producer->newTopic($topic);

        $producerTopic->produce(
            \RD_KAFKA_PARTITION_UA,
            0,
            $message,
            $key
        );

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $result = $producer->flush(1000);

            if ($result === \RD_KAFKA_RESP_ERR_NO_ERROR) {
                return;
            }
        }

        throw new RuntimeException('No se pudo publicar el evento en Kafka.');
    }
}