<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProyectoRevision extends Model
{
    protected $table = 'proyecto_revisiones';

    protected $fillable = [
        'proyecto_id',
        'entrega_id',
        'revisor_id',
        'rol_revision',
        'resultado',
        'comentario',
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

    public function revisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisor_id');
    }
}
