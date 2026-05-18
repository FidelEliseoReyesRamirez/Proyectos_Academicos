<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    /**
     * Añade la columna deleted_at para habilitar soft deletes en proyectos.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('proyectos', 'deleted_at')) {
            Schema::table('proyectos', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }
 
    public function down(): void
    {
        if (Schema::hasColumn('proyectos', 'deleted_at')) {
            Schema::table('proyectos', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};