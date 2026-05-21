<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto_revisiones', function (Blueprint $table) {
            $table->id();

            $table->integer('proyecto_id');
            $table->foreign('proyecto_id')
                ->references('id')
                ->on('proyectos')
                ->cascadeOnDelete();

            $table->foreignId('entrega_id')
                ->nullable()
                ->constrained('proyecto_entregas')
                ->nullOnDelete();

            $table->foreignId('revisor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('rol_revision');
            $table->string('resultado')->default('pendiente');
            $table->text('comentario')->nullable();

            $table->timestamps();

            $table->index(['proyecto_id', 'rol_revision']);
            $table->index(['proyecto_id', 'resultado']);
            $table->index('entrega_id');
            $table->index('revisor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto_revisiones');
    }
};
