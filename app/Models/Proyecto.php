<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'codigo',
    'titulo',
    'descripcion',
    'modalidad',
    'area_tematica',
    'estado',
    'estudiante_id',
    'tutor_id',
    'periodo_id',
])]
class Proyecto extends Model
{
    protected $table = 'proyectos';
    protected $casts = [
        'estado' => 'string',
    ];
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // 🔗 Relación con periodo académico
    public function periodo()
    {
        return $this->belongsTo(PeriodoAcademico::class, 'periodo_id');
    }

    // 🔗 Relación con estudiante
    public function estudiante()
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    // 🔗 Relación con tutor
    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }
}
