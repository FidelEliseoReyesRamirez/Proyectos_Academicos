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

        'proyecto_actualizado' => env(
            'KAFKA_TOPIC_PROYECTO_ACTUALIZADO',
            'proyectos.actualizados'
        ),

        'proyecto_eliminado' => env(
            'KAFKA_TOPIC_PROYECTO_ELIMINADO',
            'proyectos.eliminados'
        ),

        'proyecto_restaurado' => env(
            'KAFKA_TOPIC_PROYECTO_RESTAURADO',
            'proyectos.restaurados'
        ),

        'usuarios_eventos' => env(
            'KAFKA_TOPIC_USUARIOS_EVENTOS',
            'usuarios.eventos'
        ),

        'auth_eventos' => env(
            'KAFKA_TOPIC_AUTH_EVENTOS',
            'auth.eventos'
        ),
        'calendario_eventos' => env('KAFKA_TOPIC_CALENDARIO_EVENTOS', 'calendario.eventos'),
    ],
];
