<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalendarioActividad extends Model
{
    use SoftDeletes;

    protected $table = 'calendario_actividades';

    protected $fillable = [
        'titulo',
        'descripcion',
        'tipo',
        'color',
        'fecha_inicio',
        'fecha_fin',
        'creado_por_id',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por_id');
    }
}
