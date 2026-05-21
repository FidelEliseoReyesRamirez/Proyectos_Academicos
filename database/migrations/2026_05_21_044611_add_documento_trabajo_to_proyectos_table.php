<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proyectos', function (Blueprint $table) {
            $table->string('documento_trabajo_titulo')->nullable()->after('descripcion');
            $table->text('documento_trabajo_url')->nullable()->after('documento_trabajo_titulo');

            $table->foreignId('documento_trabajo_actualizado_por_id')
                ->nullable()
                ->after('documento_trabajo_url')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('documento_trabajo_actualizado_at')
                ->nullable()
                ->after('documento_trabajo_actualizado_por_id');
        });
    }

    public function down(): void
    {
        Schema::table('proyectos', function (Blueprint $table) {
            $table->dropForeign(['documento_trabajo_actualizado_por_id']);

            $table->dropColumn([
                'documento_trabajo_titulo',
                'documento_trabajo_url',
                'documento_trabajo_actualizado_por_id',
                'documento_trabajo_actualizado_at',
            ]);
        });
    }
};
