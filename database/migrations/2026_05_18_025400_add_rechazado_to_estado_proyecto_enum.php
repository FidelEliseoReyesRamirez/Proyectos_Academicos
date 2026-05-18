<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * PostgreSQL no permite modificar ENUM dentro de una transacción.
     */
    public $withinTransaction = false;

    public function up(): void
    {
        DB::statement(<<<'SQL'
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_type
                    WHERE typname = 'estado_proyecto'
                ) THEN
                    ALTER TYPE estado_proyecto ADD VALUE IF NOT EXISTS 'rechazado';
                END IF;
            END $$;
        SQL);
    }

    public function down(): void
    {
        //
    }
};