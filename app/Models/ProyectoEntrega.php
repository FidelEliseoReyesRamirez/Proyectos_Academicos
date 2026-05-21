<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProyectoEntrega extends Model
{
    protected $table = 'proyecto_entregas';

    protected $fillable = [
        'proyecto_id',
        'estudiante_id',
        'titulo',
        'descripcion',
        'numero_version',
        'estado',
        'enviado_at',
    ];

    protected function casts(): array
    {
        return [
            'numero_version' => 'integer',
            'enviado_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id');
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(ProyectoArchivo::class, 'entrega_id');
    }

    public function observaciones(): HasMany
    {
        return $this->hasMany(ProyectoObservacion::class, 'entrega_id');
    }

    public function revisiones(): HasMany
    {
        return $this->hasMany(ProyectoRevision::class, 'entrega_id');
    }
}
