<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendario_actividades', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 180);
            $table->text('descripcion')->nullable();
            $table->string('tipo', 60)->default('general');
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->foreignId('creado_por_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['fecha_inicio', 'fecha_fin']);
            $table->index('tipo');
            $table->index('creado_por_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendario_actividades');
    }
};
