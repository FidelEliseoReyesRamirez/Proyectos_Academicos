<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DemoSeguimientoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $password = Hash::make('12345678');

            /*
            |--------------------------------------------------------------------------
            | 1. Estudiantes demo
            |--------------------------------------------------------------------------
            */
            $estudiantes = [
                ['name' => 'Ana Valeria Choque Mamani',       'email' => 'estudiante.demo01@sudosquad.test'],
                ['name' => 'Bruno Alejandro Flores Rojas',    'email' => 'estudiante.demo02@sudosquad.test'],
                ['name' => 'Camila Fernanda Quispe López',    'email' => 'estudiante.demo03@sudosquad.test'],
                ['name' => 'Diego Andrés Vargas Nina',        'email' => 'estudiante.demo04@sudosquad.test'],
                ['name' => 'Elena Gabriela Mamani Condori',   'email' => 'estudiante.demo05@sudosquad.test'],
                ['name' => 'Fernando Isaac Rojas Paredes',    'email' => 'estudiante.demo06@sudosquad.test'],
                ['name' => 'Gabriela Sofía Salazar Flores',   'email' => 'estudiante.demo07@sudosquad.test'],
                ['name' => 'Hugo Marcelo Arce Gutiérrez',     'email' => 'estudiante.demo08@sudosquad.test'],
                ['name' => 'Isabel Daniela Mercado Luna',     'email' => 'estudiante.demo09@sudosquad.test'],
                ['name' => 'Javier Nicolás Poma Aguilar',     'email' => 'estudiante.demo10@sudosquad.test'],
            ];

            foreach ($estudiantes as $estudiante) {
                User::updateOrCreate(
                    ['email' => $estudiante['email']],
                    [
                        'name' => $estudiante['name'],
                        'password' => $password,
                        'rol' => 'estudiante',
                        'activo' => true,
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | 2. Docentes demo
            |--------------------------------------------------------------------------
            */
            $docentes = [
                ['name' => 'Docente Tutor Demo 01',    'email' => 'docente.tutor01@sudosquad.test'],
                ['name' => 'Docente Tutor Demo 02',    'email' => 'docente.tutor02@sudosquad.test'],
                ['name' => 'Docente Tutor Demo 03',    'email' => 'docente.tutor03@sudosquad.test'],
                ['name' => 'Docente Tutor Demo 04',    'email' => 'docente.tutor04@sudosquad.test'],
                ['name' => 'Docente Tutor Demo 05',    'email' => 'docente.tutor05@sudosquad.test'],
                ['name' => 'Docente Revisor Demo 01',  'email' => 'docente.revisor01@sudosquad.test'],
                ['name' => 'Docente Revisor Demo 02',  'email' => 'docente.revisor02@sudosquad.test'],
                ['name' => 'Docente Revisor Demo 03',  'email' => 'docente.revisor03@sudosquad.test'],
                ['name' => 'Docente Revisor Demo 04',  'email' => 'docente.revisor04@sudosquad.test'],
                ['name' => 'Docente Mixto Demo 01',    'email' => 'docente.mixto01@sudosquad.test'],
            ];

            foreach ($docentes as $docente) {
                User::updateOrCreate(
                    ['email' => $docente['email']],
                    [
                        'name' => $docente['name'],
                        'password' => $password,
                        'rol' => 'docente',
                        'activo' => true,
                    ]
                );
            }

            $students = User::whereIn('email', array_column($estudiantes, 'email'))->orderBy('email')->get()->values();
            $teachers = User::whereIn('email', array_column($docentes, 'email'))->orderBy('email')->get()->keyBy('email');

            /*
            |--------------------------------------------------------------------------
            | 3. Periodo académico
            |--------------------------------------------------------------------------
            */
            $periodoId = DB::table('periodos_academicos')->orderByDesc('id')->value('id');

            if (! $periodoId) {
                $periodoData = [];

                if (Schema::hasColumn('periodos_academicos', 'nombre')) {
                    $periodoData['nombre'] = 'Gestión Demo 2026';
                }

                if (Schema::hasColumn('periodos_academicos', 'gestion')) {
                    $periodoData['gestion'] = 2026;
                }

                if (Schema::hasColumn('periodos_academicos', 'semestre')) {
                    $periodoData['semestre'] = 1;
                }

                if (Schema::hasColumn('periodos_academicos', 'fecha_inicio')) {
                    $periodoData['fecha_inicio'] = '2026-02-01';
                }

                if (Schema::hasColumn('periodos_academicos', 'fecha_fin')) {
                    $periodoData['fecha_fin'] = '2026-07-31';
                }

                if (Schema::hasColumn('periodos_academicos', 'activo')) {
                    $periodoData['activo'] = true;
                }

                if (Schema::hasColumn('periodos_academicos', 'created_at')) {
                    $periodoData['created_at'] = now();
                }

                if (Schema::hasColumn('periodos_academicos', 'updated_at')) {
                    $periodoData['updated_at'] = now();
                }

                $periodoId = DB::table('periodos_academicos')->insertGetId($periodoData);
            }

            /*
            |--------------------------------------------------------------------------
            | 4. Proyectos demo
            |--------------------------------------------------------------------------
            | Casos:
            | - docentes que solo son tutores
            | - docentes que solo son revisores
            | - un docente mixto que tiene tutorías y revisiones
            |--------------------------------------------------------------------------
            */
            $asignaciones = [
                [
                    'codigo' => 'DEMO-SEG-001',
                    'titulo' => 'Sistema de seguimiento académico con entregas digitales',
                    'estado' => 'en_desarrollo',
                    'modalidad' => 'proyecto_grado',
                    'estudiante' => 'estudiante.demo01@sudosquad.test',
                    'tutor' => 'docente.tutor01@sudosquad.test',
                    'revisores' => ['docente.revisor01@sudosquad.test', 'docente.mixto01@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-002',
                    'titulo' => 'Sistema de reservas hoteleras con predicción de ocupación',
                    'estado' => 'en_revision',
                    'modalidad' => 'tesis',
                    'estudiante' => 'estudiante.demo02@sudosquad.test',
                    'tutor' => 'docente.tutor02@sudosquad.test',
                    'revisores' => ['docente.revisor02@sudosquad.test', 'docente.revisor03@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-003',
                    'titulo' => 'Plataforma de gestión de voluntariado universitario',
                    'estado' => 'observado',
                    'modalidad' => 'proyecto_grado',
                    'estudiante' => 'estudiante.demo03@sudosquad.test',
                    'tutor' => 'docente.tutor03@sudosquad.test',
                    'revisores' => ['docente.revisor01@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-004',
                    'titulo' => 'Sistema de auditoría de eventos para microservicios',
                    'estado' => 'en_revision',
                    'modalidad' => 'trabajo_dirigido',
                    'estudiante' => 'estudiante.demo04@sudosquad.test',
                    'tutor' => 'docente.mixto01@sudosquad.test',
                    'revisores' => ['docente.revisor04@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-005',
                    'titulo' => 'Aplicación web para control de avance de proyectos de grado',
                    'estado' => 'aprobado',
                    'modalidad' => 'excelencia',
                    'estudiante' => 'estudiante.demo05@sudosquad.test',
                    'tutor' => 'docente.tutor04@sudosquad.test',
                    'revisores' => ['docente.revisor02@sudosquad.test', 'docente.revisor04@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-006',
                    'titulo' => 'Sistema de mensajería académica con base de datos NoSQL',
                    'estado' => 'en_desarrollo',
                    'modalidad' => 'proyecto_grado',
                    'estudiante' => 'estudiante.demo06@sudosquad.test',
                    'tutor' => 'docente.tutor05@sudosquad.test',
                    'revisores' => ['docente.mixto01@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-007',
                    'titulo' => 'Módulo de calendario académico para planificación de entregas',
                    'estado' => 'en_revision',
                    'modalidad' => 'tesis',
                    'estudiante' => 'estudiante.demo07@sudosquad.test',
                    'tutor' => 'docente.tutor01@sudosquad.test',
                    'revisores' => ['docente.revisor03@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-008',
                    'titulo' => 'Servicio de notificaciones académicas usando Kafka',
                    'estado' => 'observado',
                    'modalidad' => 'trabajo_dirigido',
                    'estudiante' => 'estudiante.demo08@sudosquad.test',
                    'tutor' => 'docente.tutor02@sudosquad.test',
                    'revisores' => ['docente.revisor04@sudosquad.test', 'docente.mixto01@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-009',
                    'titulo' => 'Dashboard de trazabilidad para revisión de proyectos',
                    'estado' => 'en_desarrollo',
                    'modalidad' => 'proyecto_grado',
                    'estudiante' => 'estudiante.demo09@sudosquad.test',
                    'tutor' => 'docente.tutor03@sudosquad.test',
                    'revisores' => ['docente.revisor01@sudosquad.test'],
                ],
                [
                    'codigo' => 'DEMO-SEG-010',
                    'titulo' => 'Modelo de arquitectura C4 aplicado a sistemas distribuidos',
                    'estado' => 'concluido',
                    'modalidad' => 'excelencia',
                    'estudiante' => 'estudiante.demo10@sudosquad.test',
                    'tutor' => 'docente.mixto01@sudosquad.test',
                    'revisores' => ['docente.revisor02@sudosquad.test', 'docente.revisor03@sudosquad.test'],
                ],
            ];

            foreach ($asignaciones as $index => $item) {
                $estudiante = User::where('email', $item['estudiante'])->firstOrFail();
                $tutor = User::where('email', $item['tutor'])->firstOrFail();

                $proyectoData = [
                    'titulo' => $item['titulo'],
                    'descripcion' => 'Proyecto demo precargado para exposición del módulo de seguimiento académico.',
                    'modalidad' => $item['modalidad'],
                    'area_tematica' => 'Sistemas de información',
                    'estado' => $item['estado'],
                    'estudiante_id' => $estudiante->id,
                    'tutor_id' => $tutor->id,
                    'periodo_id' => $periodoId,
                    'updated_at' => now(),
                ];

                if (Schema::hasColumn('proyectos', 'documento_trabajo_titulo')) {
                    $proyectoData['documento_trabajo_titulo'] = 'Documento principal del proyecto';
                }

                if (Schema::hasColumn('proyectos', 'documento_trabajo_url')) {
                    $proyectoData['documento_trabajo_url'] = 'https://example.com/documento-demo-' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
                }

                if (Schema::hasColumn('proyectos', 'documento_trabajo_actualizado_at')) {
                    $proyectoData['documento_trabajo_actualizado_at'] = now();
                }

                if (Schema::hasColumn('proyectos', 'documento_trabajo_actualizado_por_id')) {
                    $proyectoData['documento_trabajo_actualizado_por_id'] = $tutor->id;
                }

                $proyectoExiste = DB::table('proyectos')->where('codigo', $item['codigo'])->first();

                if ($proyectoExiste) {
                    DB::table('proyectos')->where('id', $proyectoExiste->id)->update($proyectoData);
                    $proyectoId = $proyectoExiste->id;
                } else {
                    $proyectoData['codigo'] = $item['codigo'];
                    $proyectoData['created_at'] = now();
                    $proyectoId = DB::table('proyectos')->insertGetId($proyectoData);
                }

                foreach ($item['revisores'] as $revisorEmail) {
                    $revisor = User::where('email', $revisorEmail)->firstOrFail();

                    if ((int) $revisor->id === (int) $tutor->id) {
                        continue;
                    }

                    DB::table('proyecto_revisores')->updateOrInsert(
                        [
                            'proyecto_id' => $proyectoId,
                            'revisor_id' => $revisor->id,
                        ],
                        [
                            'asignado_en' => now()->subDays(10 - $index),
                            'plazo_revision' => Carbon::now()->addDays(7 + $index)->toDateString(),
                        ]
                    );
                }

                DB::table('proyecto_eventos')->updateOrInsert(
                    [
                        'proyecto_id' => $proyectoId,
                        'tipo_evento' => 'demo_proyecto_precargado',
                    ],
                    [
                        'actor_id' => $tutor->id,
                        'descripcion' => 'Proyecto demo precargado para exposición.',
                        'metadata' => json_encode([
                            'codigo' => $item['codigo'],
                            'tutor' => $tutor->email,
                            'revisores' => $item['revisores'],
                        ]),
                        'created_at' => now()->subDays(9 - $index),
                        'updated_at' => now(),
                    ]
                );

                /*
                |--------------------------------------------------------------------------
                | 5. Reuniones de tutoría demo, si la tabla ya existe
                |--------------------------------------------------------------------------
                */
                if (Schema::hasTable('proyecto_reuniones_tutoria')) {
                    DB::table('proyecto_reuniones_tutoria')->updateOrInsert(
                        [
                            'proyecto_id' => $proyectoId,
                            'tutor_id' => $tutor->id,
                            'fecha_reunion' => Carbon::now()->subDays(6 - min($index, 5))->setTime(18, 30, 0),
                        ],
                        [
                            'modalidad' => $index % 2 === 0 ? 'presencial' : 'virtual',
                            'temas_tratados' => 'Revisión del avance del proyecto, estado de entregas, observaciones pendientes y planificación de la siguiente versión.',
                            'acuerdos' => 'El estudiante actualizará el documento según las observaciones. El tutor revisará la nueva versión y definirá si corresponde derivar a revisores.',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            }

            echo PHP_EOL;
            echo "Seeder demo ejecutado correctamente." . PHP_EOL;
            echo "Contraseña para todos los usuarios demo: 12345678" . PHP_EOL;
            echo PHP_EOL;
            echo "Docente con tutorías y revisiones: docente.mixto01@sudosquad.test" . PHP_EOL;
            echo "Tutor ejemplo: docente.tutor01@sudosquad.test" . PHP_EOL;
            echo "Revisor ejemplo: docente.revisor01@sudosquad.test" . PHP_EOL;
            echo "Estudiante ejemplo: estudiante.demo01@sudosquad.test" . PHP_EOL;
            echo PHP_EOL;
        });
    }
}
