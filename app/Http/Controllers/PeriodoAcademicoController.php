<?php

namespace App\Http\Controllers;

use App\Models\PeriodoAcademico;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PeriodosAcademicosController extends Controller
{
    public function index(Request $request): Response
    {
        $periodos = PeriodoAcademico::query()
            ->orderByDesc('created_at')
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
            'nombre' => ['required', 'string', 'max:100'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_cierre' => ['required', 'date', 'after:fecha_inicio'],
        ]);

        PeriodoAcademico::where('activo', '=', true, 'and')->update(['activo' => false]);

        PeriodoAcademico::create([
            'nombre' => $validated['nombre'],
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_cierre' => $validated['fecha_cierre'],
            'activo' => true,
        ]);

        return to_route('periodos.index')->with('toast', [
            'type' => 'success',
            'message' => 'Periodo creado correctamente.',
        ]);
    }
}