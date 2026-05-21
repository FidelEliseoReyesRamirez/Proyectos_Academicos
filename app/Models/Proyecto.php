<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proyecto extends Model
{
    use SoftDeletes;

    protected $table = 'proyectos';

    protected $fillable = [
        'codigo',
        'titulo',
        'descripcion',
        'documento_trabajo_titulo',
        'documento_trabajo_url',
        'documento_trabajo_actualizado_por_id',
        'documento_trabajo_actualizado_at',
        'modalidad',
        'area_tematica',
        'estado',
        'estudiante_id',
        'tutor_id',
        'periodo_id',
    ];

    protected function casts(): array
    {
        return [
            'estado' => 'string',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
            'documento_trabajo_actualizado_at' => 'datetime',
        ];
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(PeriodoAcademico::class, 'periodo_id');
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function documentoTrabajoActualizadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'documento_trabajo_actualizado_por_id');
    }

    public function revisores(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'proyecto_revisores', 'proyecto_id', 'revisor_id')
            ->withPivot(['asignado_en', 'plazo_revision']);
    }

    public function entregas(): HasMany
    {
        return $this->hasMany(ProyectoEntrega::class, 'proyecto_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(ProyectoArchivo::class, 'proyecto_id');
    }

    public function observaciones(): HasMany
    {
        return $this->hasMany(ProyectoObservacion::class, 'proyecto_id');
    }

    public function revisiones(): HasMany
    {
        return $this->hasMany(ProyectoRevision::class, 'proyecto_id');
    }

    public function eventos(): HasMany
    {
        return $this->hasMany(ProyectoEvento::class, 'proyecto_id');
    }
}
