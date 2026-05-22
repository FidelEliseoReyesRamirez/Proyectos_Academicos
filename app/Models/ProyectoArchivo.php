<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProyectoArchivo extends Model
{
    protected $casts = [
        'reemplazado_at' => 'datetime',
    ];

    protected $table = 'proyecto_archivos';

    protected $fillable = [
        'entrega_id',
        'proyecto_id',
        'subido_por_id',
        'tipo_archivo',
        'motivo_reemplazo',
        'reemplazado_at',
        'reemplazado_por_archivo_id',
        'estado',
        'nombre_original',
        'nombre_servidor',
        'ruta_almacenamiento',
        'mime_type',
        'tamano_bytes',
    ];

    protected function casts(): array
    {
        return [
            'tamano_bytes' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function entrega(): BelongsTo
    {
        return $this->belongsTo(ProyectoEntrega::class, 'entrega_id');
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id');
    }

    public function subidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subido_por_id');
    }
    public function reemplazadoPor()
    {
        return $this->belongsTo(self::class, 'reemplazado_por_archivo_id');
    }

    public function reemplazos()
    {
        return $this->hasMany(self::class, 'reemplazado_por_archivo_id');
    }
}
