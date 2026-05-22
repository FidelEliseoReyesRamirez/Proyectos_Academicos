<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proyecto_archivos', function (Blueprint $table) {
            $table->string('estado')->default('activo')->after('tipo_archivo');
            $table->foreignId('reemplazado_por_archivo_id')
                ->nullable()
                ->after('tamano_bytes')
                ->constrained('proyecto_archivos')
                ->nullOnDelete();
            $table->timestamp('reemplazado_at')->nullable()->after('reemplazado_por_archivo_id');
            $table->text('motivo_reemplazo')->nullable()->after('reemplazado_at');

            $table->index(['proyecto_id', 'entrega_id', 'tipo_archivo', 'estado'], 'idx_proyecto_archivos_activos');
        });
    }

    public function down(): void
    {
        Schema::table('proyecto_archivos', function (Blueprint $table) {
            $table->dropIndex('idx_proyecto_archivos_activos');
            $table->dropConstrainedForeignId('reemplazado_por_archivo_id');
            $table->dropColumn([
                'estado',
                'reemplazado_at',
                'motivo_reemplazo',
            ]);
        });
    }
};
