<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * En PostgreSQL un ENUM no se puede modificar para QUITAR valores.
     * El patron correcto es: renombrar el viejo, crear el nuevo,
     * convertir la columna mapeando valores y luego eliminar el viejo.
     */
    public function up(): void
    {
        DB::statement('ALTER TYPE modalidad_proyecto RENAME TO modalidad_proyecto_old');

        DB::statement("
            CREATE TYPE modalidad_proyecto AS ENUM (
                'proyecto_grado',
                'tesis',
                'excelencia',
                'trabajo_dirigido'
            )
        ");

        // Mapeo de valores antiguos a nuevos para no perder datos existentes.
        DB::statement("
            ALTER TABLE proyectos
                ALTER COLUMN modalidad TYPE modalidad_proyecto
                USING (
                    CASE modalidad::text
                        WHEN 'presencial' THEN 'proyecto_grado'
                        WHEN 'virtual'    THEN 'tesis'
                        WHEN 'mixto'      THEN 'trabajo_dirigido'
                        ELSE 'proyecto_grado'
                    END
                )::modalidad_proyecto
        ");

        DB::statement('DROP TYPE modalidad_proyecto_old');
    }

    public function down(): void
    {
        DB::statement('ALTER TYPE modalidad_proyecto RENAME TO modalidad_proyecto_new');

        DB::statement("
            CREATE TYPE modalidad_proyecto AS ENUM (
                'presencial',
                'virtual',
                'mixto'
            )
        ");

        DB::statement("
            ALTER TABLE proyectos
                ALTER COLUMN modalidad TYPE modalidad_proyecto
                USING (
                    CASE modalidad::text
                        WHEN 'proyecto_grado'   THEN 'presencial'
                        WHEN 'tesis'            THEN 'virtual'
                        WHEN 'excelencia'       THEN 'mixto'
                        WHEN 'trabajo_dirigido' THEN 'mixto'
                        ELSE 'presencial'
                    END
                )::modalidad_proyecto
        ");

        DB::statement('DROP TYPE modalidad_proyecto_new');
    }
};