<?php

return [
    'brokers' => env('KAFKA_BROKERS', 'sudosquad_kafka:19092'),

    'client_id' => env('KAFKA_CLIENT_ID', 'sudosquad-laravel'),

    'group_id' => env('KAFKA_GROUP_ID', 'sudosquad-notifications'),

    'topics' => [
        'proyecto_registrado' => env(
            'KAFKA_TOPIC_PROYECTO_REGISTRADO',
            'proyectos.registrados'
        ),

        'proyecto_estado_actualizado' => env(
            'KAFKA_TOPIC_PROYECTO_ESTADO_ACTUALIZADO',
            'proyectos.estado_actualizado'
        ),
    ],
];
