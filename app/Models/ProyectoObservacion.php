<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProyectoObservacion extends Model
{
    protected $table = 'proyecto_observaciones';

    protected $fillable = [
        'proyecto_id',
        'entrega_id',
        'autor_id',
        'dirigido_a_id',
        'tipo',
        'texto',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id');
    }

    public function entrega(): BelongsTo
    {
        return $this->belongsTo(ProyectoEntrega::class, 'entrega_id');
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'autor_id');
    }

    public function dirigidoA(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dirigido_a_id');
    }
}
