<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto_archivos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('entrega_id')
                ->constrained('proyecto_entregas')
                ->cascadeOnDelete();

            $table->integer('proyecto_id');
            $table->foreign('proyecto_id')
                ->references('id')
                ->on('proyectos')
                ->cascadeOnDelete();

            $table->foreignId('subido_por_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('tipo_archivo');
            $table->string('nombre_original');
            $table->string('nombre_servidor');
            $table->string('ruta_almacenamiento');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('tamano_bytes')->nullable();

            $table->timestamps();

            $table->index(['proyecto_id', 'tipo_archivo']);
            $table->index('entrega_id');
            $table->index('subido_por_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto_archivos');
    }
};
