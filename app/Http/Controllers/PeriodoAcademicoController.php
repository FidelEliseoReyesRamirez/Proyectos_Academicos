<?php

namespace App\Http\Controllers;

use App\Models\PeriodoAcademico;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;

class PeriodoAcademicoController extends Controller
{
    public function index(Request $request): Response
    {
        $periodos = PeriodoAcademico::query()
            ->orderByDesc('fecha_inicio')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('periodos/index', [
            'periodos' => $periodos,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('periodos/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fecha_inicio' => ['required', 'date'],
            'fecha_cierre' => ['required', 'date', 'after:fecha_inicio'],
        ]);

        $fecha = Carbon::parse($validated['fecha_inicio']);
        $anio = $fecha->year;
        $mes = $fecha->month;

        // Determinar gestión
        $gestion = $mes <= 6 ? 'I' : 'II';

        // Nombre correcto
        $nombre = "Gestión {$gestion} - {$anio}";

        // Validación SIN whereRaw raro (más seguro)
        $existe = PeriodoAcademico::all()->contains(function ($p) use ($anio, $gestion) {
            $f = Carbon::parse($p->fecha_inicio);
            $g = $f->month <= 6 ? 'I' : 'II';
            return $f->year == $anio && $g == $gestion;
        });

        if ($existe) {
            return back()->withErrors([
                'fecha_inicio' => 'Ya existe ese periodo académico.',
            ]);
        }

        // Desactivar anteriores
        PeriodoAcademico::query()
            ->where('activo', true)
            ->update(['activo' => false]);

        // Crear nuevo
        PeriodoAcademico::create([
            'nombre' => $nombre,
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_cierre' => $validated['fecha_cierre'],
            'activo' => true,
        ]);

        return to_route('periodos.index')->with('toast', [
            'type' => 'success',
            'message' => 'Periodo creado correctamente.',
        ]);
    }

    public function edit(PeriodoAcademico $periodo): Response
    {
        return Inertia::render('periodos/edit', [
            'periodo' => $periodo,
        ]);
    }

    public function update(Request $request, PeriodoAcademico $periodo): RedirectResponse
    {
        $validated = $request->validate([
            'fecha_inicio' => ['required', 'date'],
            'fecha_cierre' => ['required', 'date', 'after:fecha_inicio'],
        ]);

        $fecha = Carbon::parse($validated['fecha_inicio']);
        $anio = $fecha->year;
        $mes = $fecha->month;

        $gestion = $mes <= 6 ? 'I' : 'II';

        $nombre = "Gestión {$gestion} - {$anio}";

        // Validar duplicado excluyendo el actual
        $existe = PeriodoAcademico::all()->contains(function ($p) use ($anio, $gestion, $periodo) {
            if ($p->id == $periodo->id) return false;

            $f = Carbon::parse($p->fecha_inicio);
            $g = $f->month <= 6 ? 'I' : 'II';

            return $f->year == $anio && $g == $gestion;
        });

        if ($existe) {
            return back()->withErrors([
                'fecha_inicio' => 'Ya existe ese periodo académico.',
            ]);
        }

        $periodo->update([
            'nombre' => $nombre,
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_cierre' => $validated['fecha_cierre'],
        ]);

        return to_route('periodos.index')->with('toast', [
            'type' => 'success',
            'message' => 'Periodo actualizado correctamente.',
        ]);
    }
}