<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'nombre',
    'fecha_inicio',
    'fecha_cierre',
    'activo',
])]
class PeriodoAcademico extends Model
{
    protected $table = 'periodos_academicos';

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_cierre' => 'date',
            'activo' => 'boolean',
        ];
    }

    public function proyectos()
    {
        return $this->hasMany(Proyecto::class, 'periodo_id');
    }
}
