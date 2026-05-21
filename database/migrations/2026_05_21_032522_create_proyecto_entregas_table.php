<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto_entregas', function (Blueprint $table) {
            $table->id();

            $table->integer('proyecto_id');
            $table->foreign('proyecto_id')
                ->references('id')
                ->on('proyectos')
                ->cascadeOnDelete();

            $table->foreignId('estudiante_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->unsignedSmallInteger('numero_version')->default(1);
            $table->string('estado')->default('enviado');

            $table->timestamp('enviado_at')->nullable();

            $table->timestamps();

            $table->unique(['proyecto_id', 'numero_version']);
            $table->index(['proyecto_id', 'estado']);
            $table->index('estudiante_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto_entregas');
    }
};
