<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto_eventos', function (Blueprint $table) {
            $table->id();

            $table->integer('proyecto_id');
            $table->foreign('proyecto_id')
                ->references('id')
                ->on('proyectos')
                ->cascadeOnDelete();

            $table->foreignId('actor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('tipo_evento');
            $table->text('descripcion');
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['proyecto_id', 'tipo_evento']);
            $table->index('actor_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto_eventos');
    }
};
