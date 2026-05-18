<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * area_tematica pasa de VARCHAR(150) NOT NULL a TEXT NULL
     * porque ahora es opcional y puede contener multiples areas (CSV).
     * Uso SQL crudo para no depender de doctrine/dbal en el change().
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE proyectos ALTER COLUMN area_tematica TYPE TEXT');
        DB::statement('ALTER TABLE proyectos ALTER COLUMN area_tematica DROP NOT NULL');
    }

    public function down(): void
    {
        // Si alguien guardo mas de 150 chars, truncamos para no romper el rollback.
        DB::statement("UPDATE proyectos SET area_tematica = LEFT(area_tematica, 150) WHERE area_tematica IS NOT NULL");
        DB::statement("UPDATE proyectos SET area_tematica = '' WHERE area_tematica IS NULL");
        DB::statement('ALTER TABLE proyectos ALTER COLUMN area_tematica TYPE VARCHAR(150)');
        DB::statement('ALTER TABLE proyectos ALTER COLUMN area_tematica SET NOT NULL');
    }
};