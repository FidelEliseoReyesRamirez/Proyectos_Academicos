<?php

namespace App\Http\Controllers;

use App\Models\CalendarioActividad;
use App\Services\KafkaProducerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CalendarioController extends Controller
{
    public function index(Request $request): Response
    {
        $usuario = $request->user();
        $rol = strtolower((string) ($usuario->role ?? $usuario->rol ?? ''));

        $actividades = CalendarioActividad::query()
            ->with('creador:id,name,email')
            ->orderBy('fecha_inicio')
            ->get()
            ->map(fn (CalendarioActividad $actividad) => $this->serializarActividad($actividad))
            ->values();

        return Inertia::render('calendario', [
            'calendarioData' => [
                'actividades' => $actividades,
                'puedeGestionar' => $this->puedeGestionar($rol),
                'rol' => $rol,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->autorizarGestion($request);
        $validated = $this->validarActividad($request);

        DB::transaction(function () use ($validated, $request): void {
            $actividad = CalendarioActividad::create([
                ...$validated,
                'creado_por_id' => $request->user()->id,
            ]);

            $this->publicarEvento('calendario.actividad_creada', $actividad, $request);
        });

        return back()->with('success', 'Actividad creada correctamente.');
    }

    public function update(Request $request, CalendarioActividad $actividad): RedirectResponse
    {
        $this->autorizarGestion($request);
        $validated = $this->validarActividad($request);

        DB::transaction(function () use ($validated, $actividad, $request): void {
            $actividad->update($validated);
            $actividad->refresh();

            $this->publicarEvento('calendario.actividad_actualizada', $actividad, $request);
        });

        return back()->with('success', 'Actividad actualizada correctamente.');
    }

    public function destroy(Request $request, CalendarioActividad $actividad): RedirectResponse
    {
        $this->autorizarGestion($request);

        DB::transaction(function () use ($actividad, $request): void {
            $actividad->delete();

            $this->publicarEvento('calendario.actividad_eliminada', $actividad, $request);
        });

        return back()->with('success', 'Actividad eliminada correctamente.');
    }

    private function validarActividad(Request $request): array
    {
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:180'],
            'descripcion' => ['nullable', 'string', 'max:4000'],
            'tipo' => ['required', 'string', 'max:60'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
        ]);

        $validated['color'] = $validated['color'] ?: '#6B1230';

        return $validated;
    }

    private function autorizarGestion(Request $request): void
    {
        $rol = strtolower((string) ($request->user()->role ?? $request->user()->rol ?? ''));

        abort_unless($this->puedeGestionar($rol), 403);
    }

    private function puedeGestionar(string $rol): bool
    {
        return in_array($rol, ['coordinador', 'admin', 'administrador'], true);
    }

    private function serializarActividad(CalendarioActividad $actividad): array
    {
        return [
            'id' => $actividad->id,
            'titulo' => $actividad->titulo,
            'descripcion' => $actividad->descripcion,
            'tipo' => $actividad->tipo,
            'color' => $actividad->color ?: '#6B1230',
            'fecha_inicio' => optional($actividad->fecha_inicio)->toISOString(),
            'fecha_fin' => optional($actividad->fecha_fin)->toISOString(),
            'creador' => $actividad->creador ? [
                'id' => $actividad->creador->id,
                'name' => $actividad->creador->name,
                'email' => $actividad->creador->email,
            ] : null,
        ];
    }

    private function publicarEvento(string $event, CalendarioActividad $actividad, Request $request): void
    {
        $actividadActualizada = $actividad->fresh('creador') ?? $actividad;

        $payload = [
            'event' => $event,
            'source' => 'sudosquad_laravel',
            'occurred_at' => now()->toISOString(),
            'actor' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role ?? $request->user()->rol ?? null,
            ],
            'entity' => [
                'type' => 'calendario_actividad',
                'id' => $actividad->id,
            ],
            'actividad' => $this->serializarActividad($actividadActualizada),
        ];

        try {
            app(KafkaProducerService::class)->publish(
                config('kafka.topics.calendario_eventos', 'calendario.eventos'),
                $payload,
                'calendario-'.$actividad->id
            );
        } catch (\Throwable $e) {
            Log::warning('No se pudo publicar evento de calendario en Kafka.', [
                'event' => $event,
                'actividad_id' => $actividad->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
