<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto_reuniones_tutoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('fecha_reunion');
            $table->string('modalidad', 20);
            $table->text('temas_tratados');
            $table->text('acuerdos');
            $table->timestamps();

            $table->index(['proyecto_id', 'fecha_reunion']);
            $table->index(['tutor_id', 'fecha_reunion']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto_reuniones_tutoria');
    }
};
