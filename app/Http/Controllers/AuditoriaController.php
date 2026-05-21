<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class AuditoriaController extends Controller
{
    private function auditoriaApiUrl(): string
    {
        return rtrim((string) env('AUDITORIA_API_URL', 'http://sudosquad_auditoria_api:8081'), '/');
    }

    public function index(Request $request): Response
    {
        $filters = [
            'event' => $request->query('event'),
            'module' => $request->query('module'),
            'aggregate_type' => $request->query('aggregate_type'),
            'aggregate_id' => $request->query('aggregate_id'),
            'actor_email' => $request->query('actor_email'),
            'target_email' => $request->query('target_email'),
            'date_from' => $request->query('date_from'),
            'date_to' => $request->query('date_to'),
            'search' => $request->query('search'),
            'page' => $request->query('page', 1),
            'per_page' => $request->query('per_page', 20),
        ];

        $query = array_filter($filters, fn ($value) => $value !== null && $value !== '');

        try {
            $response = Http::timeout(8)
                ->acceptJson()
                ->get($this->auditoriaApiUrl() . '/audit-events', $query);

            if (! $response->ok()) {
                return Inertia::render('auditoria/index', [
                    'eventos' => [],
                    'meta' => [
                        'page' => 1,
                        'per_page' => 20,
                        'total' => 0,
                        'last_page' => 1,
                    ],
                    'filters' => $filters,
                    'error' => 'No se pudo consultar el microservicio de auditoría.',
                ]);
            }

            $payload = $response->json();

            return Inertia::render('auditoria/index', [
                'eventos' => $payload['data'] ?? [],
                'meta' => $payload['meta'] ?? [
                    'page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                    'last_page' => 1,
                ],
                'filters' => $filters,
                'error' => null,
            ]);
        } catch (\Throwable $e) {
            report($e);

            return Inertia::render('auditoria/index', [
                'eventos' => [],
                'meta' => [
                    'page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                    'last_page' => 1,
                ],
                'filters' => $filters,
                'error' => 'El microservicio de auditoría no está disponible.',
            ]);
        }
    }

    public function show(int $id): Response
    {
        try {
            $response = Http::timeout(8)
                ->acceptJson()
                ->get($this->auditoriaApiUrl() . "/audit-events/{$id}");

            if (! $response->ok()) {
                return Inertia::render('auditoria/show', [
                    'evento' => null,
                    'error' => 'No se encontró el evento de auditoría solicitado.',
                ]);
            }

            return Inertia::render('auditoria/show', [
                'evento' => $response->json('data'),
                'error' => null,
            ]);
        } catch (\Throwable $e) {
            report($e);

            return Inertia::render('auditoria/show', [
                'evento' => null,
                'error' => 'El microservicio de auditoría no está disponible.',
            ]);
        }
    }
}
