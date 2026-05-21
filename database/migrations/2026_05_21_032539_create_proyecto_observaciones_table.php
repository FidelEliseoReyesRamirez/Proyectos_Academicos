<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto_observaciones', function (Blueprint $table) {
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

            $table->foreignId('autor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('dirigido_a_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('tipo');
            $table->text('texto');
            $table->string('estado')->default('abierta');

            $table->timestamps();

            $table->index(['proyecto_id', 'tipo']);
            $table->index(['proyecto_id', 'estado']);
            $table->index('entrega_id');
            $table->index('autor_id');
            $table->index('dirigido_a_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto_observaciones');
    }
};
