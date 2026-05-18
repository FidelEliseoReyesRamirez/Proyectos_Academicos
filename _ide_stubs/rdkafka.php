<?php

/**
 * Stub local para que VS Code / Intelephense reconozca php-rdkafka.
 *
 * Este archivo NO se ejecuta en Laravel.
 * Solo sirve para quitar errores falsos del editor.
 */

namespace {
    if (! defined('RD_KAFKA_PARTITION_UA')) {
        define('RD_KAFKA_PARTITION_UA', -1);
    }

    if (! defined('RD_KAFKA_RESP_ERR_NO_ERROR')) {
        define('RD_KAFKA_RESP_ERR_NO_ERROR', 0);
    }

    if (! defined('RD_KAFKA_RESP_ERR__PARTITION_EOF')) {
        define('RD_KAFKA_RESP_ERR__PARTITION_EOF', -191);
    }

    if (! defined('RD_KAFKA_RESP_ERR__TIMED_OUT')) {
        define('RD_KAFKA_RESP_ERR__TIMED_OUT', -185);
    }
}

namespace RdKafka {
    class Conf
    {
        public function set(string $name, string $value): void
        {
        }
    }

    class Producer
    {
        public function __construct(?Conf $conf = null)
        {
        }

        public function newTopic(string $topicName): ProducerTopic
        {
            return new ProducerTopic();
        }

        public function flush(int $timeoutMs): int
        {
            return 0;
        }
    }

    class ProducerTopic
    {
        public function produce(
            int $partition,
            int $msgflags,
            ?string $payload = null,
            ?string $key = null
        ): void {
        }
    }

    class KafkaConsumer
    {
        public function __construct(Conf $conf)
        {
        }

        /**
         * @param array<int, string> $topics
         */
        public function subscribe(array $topics): void
        {
        }

        public function consume(int $timeoutMs): Message
        {
            return new Message();
        }
    }

    class Message
    {
        public int $err = 0;

        public ?string $payload = null;

        public ?string $topic_name = null;

        public int $partition = 0;

        public int $offset = 0;

        public ?string $key = null;

        public function errstr(): string
        {
            return '';
        }
    }
}