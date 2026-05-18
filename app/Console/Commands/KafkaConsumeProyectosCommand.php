<?php

namespace App\Console\Commands;

use App\Mail\ProyectoRegistrado;
use App\Models\Proyecto;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use RdKafka\Conf;
use RdKafka\KafkaConsumer;
use Throwable;

class KafkaConsumeProyectosCommand extends Command
{
    protected $signature = 'kafka:consume-proyectos {--once : Consume solo un mensaje y termina}';

    protected $description = 'Consume eventos de proyectos registrados desde Kafka';

    public function handle(): int
    {
        $conf = new Conf();

        $conf->set('bootstrap.servers', config('kafka.brokers'));
        $conf->set('group.id', config('kafka.group_id'));
        $conf->set('client.id', config('kafka.client_id'));
        $conf->set('auto.offset.reset', 'earliest');
        $conf->set('enable.auto.commit', 'true');

        $consumer = new KafkaConsumer($conf);

        $topic = config('kafka.topics.proyecto_registrado');

        $consumer->subscribe([$topic]);

        $this->info("Microservicio consumidor escuchando topic: {$topic}");

        while (true) {
            $message = $consumer->consume(120000);

            switch ($message->err) {
                case \RD_KAFKA_RESP_ERR_NO_ERROR:
                    $this->processMessage($message->payload);

                    if ($this->option('once')) {
                        return self::SUCCESS;
                    }

                    break;

                case \RD_KAFKA_RESP_ERR__PARTITION_EOF:
                    break;

                case \RD_KAFKA_RESP_ERR__TIMED_OUT:
                    $this->warn('Esperando eventos...');
                    break;

                default:
                    $this->error($message->errstr());

                    if ($this->option('once')) {
                        return self::FAILURE;
                    }

                    break;
            }
        }
    }

    private function processMessage(?string $rawPayload): void
    {
        if (! $rawPayload) {
            $this->warn('Evento Kafka vacío.');

            return;
        }

        $payload = json_decode($rawPayload, true);

        if (! is_array($payload)) {
            $this->warn('Evento Kafka inválido.');

            return;
        }

        logger()->info('Evento Kafka recibido', [
            'payload' => $payload,
        ]);

        $this->info('Evento recibido:');
        $this->line(json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        if (($payload['event'] ?? null) !== 'proyecto.registrado') {
            $this->warn('Evento ignorado: tipo no soportado.');

            return;
        }

        $proyectoId = $payload['data']['id'] ?? null;

        if (! $proyectoId) {
            $this->warn('Evento ignorado: no contiene ID de proyecto.');

            return;
        }

        $proyecto = Proyecto::query()
            ->with(['estudiante', 'tutor', 'periodo'])
            ->find($proyectoId);

        if (! $proyecto) {
            $this->warn("Proyecto no encontrado: {$proyectoId}");

            return;
        }

        if (! $proyecto->estudiante || ! $proyecto->estudiante->email) {
            $this->warn("El proyecto {$proyecto->id} no tiene estudiante con correo válido.");

            return;
        }

        try {
            Mail::to($proyecto->estudiante->email)->send(
                new ProyectoRegistrado($proyecto)
            );

            logger()->info('Correo de proyecto registrado enviado desde microservicio Kafka', [
                'proyecto_id' => $proyecto->id,
                'estudiante_id' => $proyecto->estudiante_id,
                'email' => $proyecto->estudiante->email,
            ]);

            $this->info("Correo enviado a {$proyecto->estudiante->email}");
        } catch (Throwable $e) {
            report($e);

            $this->error('Error enviando correo desde consumidor Kafka: ' . $e->getMessage());
        }
    }
}