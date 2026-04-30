-- =============================================================
-- SUDOSQUAD ACADEMIC PLATFORM - PostgreSQL 16
-- Script COMPLETO y autónomo.
-- Incluye todas las tablas de Laravel (users, sessions, cache,
-- jobs, password_reset_tokens) + todas las tablas del proyecto.
-- Con este script NO se necesita php artisan migrate.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- TABLAS BASE DE LARAVEL
-- Equivalentes exactas a las migrations default de Laravel 12
-- + columnas de Jetstream (two_factor_*)
-- + columnas del proyecto (rol, activo, etc.)
-- =============================================================

CREATE TABLE users (
    id                        BIGSERIAL    PRIMARY KEY,
    name                      VARCHAR(255) NOT NULL,
    email                     VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at         TIMESTAMPTZ,
    password                  VARCHAR(255) NOT NULL,
    -- Jetstream two factor
    two_factor_secret         TEXT,
    two_factor_recovery_codes TEXT,
    two_factor_confirmed_at   TIMESTAMPTZ,
    remember_token            VARCHAR(100),
    -- Columnas del proyecto
    rol                       VARCHAR(20)  NOT NULL DEFAULT 'estudiante',
    activo                    BOOLEAN      NOT NULL DEFAULT TRUE,
    intentos_fallidos         SMALLINT     NOT NULL DEFAULT 0,
    bloqueado_hasta           TIMESTAMPTZ,
    telefono_contacto         VARCHAR(20),
    foto_perfil_url           VARCHAR(500),
    -- Timestamps de Laravel
    created_at                TIMESTAMPTZ,
    updated_at                TIMESTAMPTZ
);

CREATE INDEX idx_users_rol    ON users (rol);
CREATE INDEX idx_users_activo ON users (activo);

CREATE TABLE password_reset_tokens (
    email      VARCHAR(255) PRIMARY KEY,
    token      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ
);

CREATE TABLE sessions (
    id            VARCHAR(255) PRIMARY KEY,
    user_id       BIGINT       REFERENCES users (id) ON DELETE CASCADE,
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    payload       TEXT         NOT NULL,
    last_activity INTEGER      NOT NULL
);

CREATE INDEX idx_sessions_user_id       ON sessions (user_id);
CREATE INDEX idx_sessions_last_activity ON sessions (last_activity);

-- Cache
CREATE TABLE cache (
    key        VARCHAR(255) PRIMARY KEY,
    value      TEXT         NOT NULL,
    expiration INTEGER      NOT NULL
);

CREATE TABLE cache_locks (
    key        VARCHAR(255) PRIMARY KEY,
    owner      VARCHAR(255) NOT NULL,
    expiration INTEGER      NOT NULL
);

-- Jobs / Queues
CREATE TABLE jobs (
    id           BIGSERIAL    PRIMARY KEY,
    queue        VARCHAR(255) NOT NULL,
    payload      TEXT         NOT NULL,
    attempts     SMALLINT     NOT NULL,
    reserved_at  INTEGER,
    available_at INTEGER      NOT NULL,
    created_at   INTEGER      NOT NULL
);

CREATE INDEX idx_jobs_queue ON jobs (queue);

CREATE TABLE job_batches (
    id             VARCHAR(255) PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    total_jobs     INTEGER      NOT NULL,
    pending_jobs   INTEGER      NOT NULL,
    failed_jobs    INTEGER      NOT NULL,
    failed_job_ids TEXT         NOT NULL,
    options        TEXT,
    cancelled_at   INTEGER,
    created_at     INTEGER      NOT NULL,
    finished_at    INTEGER
);

CREATE TABLE failed_jobs (
    id         BIGSERIAL    PRIMARY KEY,
    uuid       VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT         NOT NULL,
    queue      TEXT         NOT NULL,
    payload    TEXT         NOT NULL,
    exception  TEXT         NOT NULL,
    failed_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ENUM TYPES DEL PROYECTO
-- =============================================================

CREATE TYPE estado_proyecto AS ENUM (
    'en_revision', 'aprobado', 'en_desarrollo', 'observado', 'concluido'
);

CREATE TYPE modalidad_proyecto AS ENUM (
    'presencial', 'virtual', 'mixto'
);

CREATE TYPE resultado_observacion AS ENUM (
    'aprobado', 'observado', 'requiere_correccion'
);

CREATE TYPE modalidad_reunion AS ENUM (
    'presencial', 'virtual'
);

CREATE TYPE tipo_evento_auditoria AS ENUM (
    'login_exitoso', 'login_fallido', 'logout',
    'creacion', 'edicion', 'eliminacion', 'cambio_estado',
    'descarga_archivo', 'cambio_password',
    'token_recuperacion_generado', 'token_recuperacion_usado',
    'cuenta_bloqueada', 'cuenta_desbloqueada',
    'asignacion_rol', 'asignacion_tutor', 'asignacion_revisor'
);

CREATE TYPE tipo_notificacion AS ENUM (
    'asignacion_tutor', 'cambio_estado', 'nueva_observacion',
    'nuevo_documento', 'nuevo_mensaje', 'asignacion_revisor',
    'reunion_registrada', 'cuenta_creada'
);

-- =============================================================
-- TABLA: periodos_academicos
-- =============================================================

CREATE TABLE periodos_academicos (
    id           SERIAL       PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    fecha_inicio DATE         NOT NULL,
    fecha_cierre DATE         NOT NULL,
    activo       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fechas_periodo CHECK (fecha_cierre > fecha_inicio)
);

CREATE UNIQUE INDEX uq_periodo_activo
    ON periodos_academicos (activo)
    WHERE activo = TRUE;

-- =============================================================
-- TABLA: proyectos
-- =============================================================

CREATE SEQUENCE seq_proyecto_codigo START 1 INCREMENT 1;

CREATE TABLE proyectos (
    id            SERIAL             PRIMARY KEY,
    codigo        VARCHAR(20)        NOT NULL UNIQUE DEFAULT '',
    titulo        VARCHAR(300)       NOT NULL,
    descripcion   TEXT,
    modalidad     modalidad_proyecto NOT NULL,
    area_tematica VARCHAR(150)       NOT NULL,
    estado        estado_proyecto    NOT NULL DEFAULT 'en_revision',
    estudiante_id BIGINT             NOT NULL REFERENCES users (id),
    tutor_id      BIGINT                      REFERENCES users (id),
    periodo_id    INTEGER                     REFERENCES periodos_academicos (id),
    created_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proyectos_estudiante ON proyectos (estudiante_id);
CREATE INDEX idx_proyectos_tutor      ON proyectos (tutor_id);
CREATE INDEX idx_proyectos_estado     ON proyectos (estado);
CREATE INDEX idx_proyectos_periodo    ON proyectos (periodo_id);

-- =============================================================
-- TABLA: proyecto_revisores
-- =============================================================

CREATE TABLE proyecto_revisores (
    id             SERIAL      PRIMARY KEY,
    proyecto_id    INTEGER     NOT NULL REFERENCES proyectos (id) ON DELETE CASCADE,
    revisor_id     BIGINT      NOT NULL REFERENCES users (id),
    asignado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    plazo_revision DATE,
    CONSTRAINT uq_proyecto_revisor UNIQUE (proyecto_id, revisor_id)
);

CREATE INDEX idx_proj_revisores_proyecto ON proyecto_revisores (proyecto_id);

-- =============================================================
-- TABLA: historial_estados
-- =============================================================

CREATE TABLE historial_estados (
    id              SERIAL          PRIMARY KEY,
    proyecto_id     INTEGER         NOT NULL REFERENCES proyectos (id) ON DELETE CASCADE,
    estado_anterior estado_proyecto,
    estado_nuevo    estado_proyecto NOT NULL,
    usuario_id      BIGINT          NOT NULL REFERENCES users (id),
    comentario      TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historial_estados_proyecto ON historial_estados (proyecto_id);
CREATE INDEX idx_historial_estados_fecha    ON historial_estados (created_at DESC);

-- =============================================================
-- TABLA: documentos
-- =============================================================

CREATE TABLE documentos (
    id                  SERIAL       PRIMARY KEY,
    proyecto_id         INTEGER      NOT NULL REFERENCES proyectos (id) ON DELETE CASCADE,
    subido_por_id       BIGINT       NOT NULL REFERENCES users (id),
    nombre_original     VARCHAR(300) NOT NULL,
    nombre_servidor     VARCHAR(300) NOT NULL UNIQUE,
    ruta_almacenamiento VARCHAR(500) NOT NULL,
    numero_version      SMALLINT     NOT NULL DEFAULT 1,
    tamano_bytes        BIGINT,
    mime_type           VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_mime_pdf CHECK (mime_type = 'application/pdf'),
    CONSTRAINT chk_tamano   CHECK (tamano_bytes <= 10485760)
);

CREATE INDEX idx_documentos_proyecto ON documentos (proyecto_id);
CREATE INDEX idx_documentos_version  ON documentos (proyecto_id, numero_version DESC);

-- =============================================================
-- TABLA: observaciones
-- =============================================================

CREATE TABLE observaciones (
    id           SERIAL                PRIMARY KEY,
    documento_id INTEGER               NOT NULL REFERENCES documentos (id) ON DELETE CASCADE,
    proyecto_id  INTEGER               NOT NULL REFERENCES proyectos (id),
    tutor_id     BIGINT                NOT NULL REFERENCES users (id),
    texto        TEXT                  NOT NULL,
    resultado    resultado_observacion NOT NULL,
    created_at   TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_texto_minimo CHECK (LENGTH(TRIM(texto)) >= 20)
);

CREATE INDEX idx_observaciones_documento ON observaciones (documento_id);
CREATE INDEX idx_observaciones_proyecto  ON observaciones (proyecto_id);
CREATE INDEX idx_observaciones_fecha     ON observaciones (created_at DESC);

-- =============================================================
-- TABLA: reuniones_seguimiento
-- =============================================================

CREATE TABLE reuniones_seguimiento (
    id             SERIAL            PRIMARY KEY,
    proyecto_id    INTEGER           NOT NULL REFERENCES proyectos (id) ON DELETE CASCADE,
    registrado_por BIGINT            NOT NULL REFERENCES users (id),
    fecha_reunion  DATE              NOT NULL,
    modalidad      modalidad_reunion NOT NULL,
    temas_tratados TEXT              NOT NULL,
    acuerdos       VARCHAR(1000),
    created_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reuniones_proyecto ON reuniones_seguimiento (proyecto_id);

-- =============================================================
-- TABLA: mensajes
-- =============================================================

CREATE TABLE mensajes (
    id           SERIAL      PRIMARY KEY,
    proyecto_id  INTEGER     NOT NULL REFERENCES proyectos (id) ON DELETE CASCADE,
    remitente_id BIGINT      NOT NULL REFERENCES users (id),
    contenido    TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_contenido_mensaje CHECK (LENGTH(TRIM(contenido)) > 0)
);

CREATE INDEX idx_mensajes_proyecto ON mensajes (proyecto_id, created_at ASC);

-- =============================================================
-- TABLA: notificaciones
-- =============================================================

CREATE TABLE notificaciones (
    id          SERIAL            PRIMARY KEY,
    usuario_id  BIGINT            NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    tipo        tipo_notificacion NOT NULL,
    titulo      VARCHAR(200)      NOT NULL,
    cuerpo      TEXT,
    proyecto_id INTEGER           REFERENCES proyectos (id) ON DELETE SET NULL,
    leida       BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones (usuario_id, leida);
CREATE INDEX idx_notificaciones_fecha   ON notificaciones (created_at DESC);

-- =============================================================
-- TABLA: audit_logs — INMUTABLE
-- =============================================================

CREATE TABLE audit_logs (
    id                 BIGSERIAL             PRIMARY KEY,
    usuario_id         BIGINT                REFERENCES users (id) ON DELETE SET NULL,
    usuario_email      VARCHAR(255),
    tipo_evento        tipo_evento_auditoria NOT NULL,
    tabla_afectada     VARCHAR(100),
    registro_id        INTEGER,
    valores_anteriores JSONB,
    valores_nuevos     JSONB,
    ip_address         INET,
    user_agent         TEXT,
    descripcion        TEXT,
    created_at         TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_usuario     ON audit_logs (usuario_id);
CREATE INDEX idx_audit_tipo_evento ON audit_logs (tipo_evento);
CREATE INDEX idx_audit_tabla       ON audit_logs (tabla_afectada, registro_id);
CREATE INDEX idx_audit_fecha       ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_ip          ON audit_logs (ip_address);

CREATE RULE audit_logs_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- =============================================================
-- TABLA: login_intentos
-- =============================================================

CREATE TABLE login_intentos (
    id         BIGSERIAL    PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    exitoso    BOOLEAN      NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_email ON login_intentos (email, created_at DESC);
CREATE INDEX idx_login_ip    ON login_intentos (ip_address, created_at DESC);

-- =============================================================
-- FUNCIONES Y TRIGGERS
-- =============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proyectos_updated_at
    BEFORE UPDATE ON proyectos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_periodos_updated_at
    BEFORE UPDATE ON periodos_academicos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_generar_codigo_proyecto()
RETURNS TRIGGER AS $$
BEGIN
    NEW.codigo = 'PROJ-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                 LPAD(NEXTVAL('seq_proyecto_codigo')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proyecto_codigo
    BEFORE INSERT ON proyectos
    FOR EACH ROW
    WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
    EXECUTE FUNCTION fn_generar_codigo_proyecto();

-- Historial de estados: desde Laravel hacer
-- DB::statement("SET LOCAL app.user_id = $id") antes del UPDATE
CREATE OR REPLACE FUNCTION fn_registrar_historial_estado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO historial_estados (
            proyecto_id, estado_anterior, estado_nuevo, usuario_id
        ) VALUES (
            NEW.id, OLD.estado, NEW.estado,
            NULLIF(current_setting('app.user_id', TRUE), '')::BIGINT
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_estado
    AFTER UPDATE OF estado ON proyectos
    FOR EACH ROW EXECUTE FUNCTION fn_registrar_historial_estado();

CREATE OR REPLACE FUNCTION fn_validar_tutor_no_revisor()
RETURNS TRIGGER AS $$
DECLARE
    v_tutor_id BIGINT;
BEGIN
    SELECT tutor_id INTO v_tutor_id FROM proyectos WHERE id = NEW.proyecto_id;
    IF v_tutor_id IS NOT NULL AND v_tutor_id = NEW.revisor_id THEN
        RAISE EXCEPTION 'El tutor del proyecto no puede ser asignado como revisor del mismo proyecto.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_tutor_no_revisor
    BEFORE INSERT OR UPDATE ON proyecto_revisores
    FOR EACH ROW EXECUTE FUNCTION fn_validar_tutor_no_revisor();

CREATE OR REPLACE FUNCTION fn_limite_revisores()
RETURNS TRIGGER AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM proyecto_revisores WHERE proyecto_id = NEW.proyecto_id;
    IF v_total >= 2 THEN
        RAISE EXCEPTION 'Un proyecto no puede tener más de 2 revisores asignados.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_limite_revisores
    BEFORE INSERT ON proyecto_revisores
    FOR EACH ROW EXECUTE FUNCTION fn_limite_revisores();

-- =============================================================
-- TABLA: migrations — necesaria para que Laravel no falle
-- al correr php artisan migrate:status o comandos similares
-- =============================================================

CREATE TABLE migrations (
    id        SERIAL       PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch     INTEGER      NOT NULL
);

-- Registrar todas las migrations de Laravel como ya ejecutadas
-- para que artisan no intente volver a crearlas
INSERT INTO migrations (migration, batch) VALUES
    ('0001_01_01_000000_create_users_table',            1),
    ('0001_01_01_000001_create_cache_table',            1),
    ('0001_01_01_000002_create_jobs_table',             1),
    ('2019_12_14_000001_create_personal_access_tokens_table', 1),
    ('2024_01_01_000000_add_jetstream_columns_to_users', 1);

-- =============================================================
-- DATOS INICIALES
-- =============================================================

INSERT INTO periodos_academicos (nombre, fecha_inicio, fecha_cierre, activo)
VALUES ('Gestión I - 2025', '2025-02-01', '2025-07-31', TRUE);

-- =============================================================
-- COMENTARIOS
-- =============================================================

COMMENT ON TABLE users                 IS 'Usuarios del sistema - incluye columnas de Laravel y del proyecto';
COMMENT ON TABLE periodos_academicos   IS 'Gestiones académicas para organización temporal';
COMMENT ON TABLE proyectos             IS 'Registro formal de proyectos académicos estudiantiles';
COMMENT ON TABLE proyecto_revisores    IS 'Tribunal revisor, máx. 2 por proyecto';
COMMENT ON TABLE historial_estados     IS 'Trazabilidad del ciclo de vida de cada proyecto';
COMMENT ON TABLE documentos            IS 'Archivos PDF con control de versiones';
COMMENT ON TABLE observaciones         IS 'Retroalimentación formal del tutor sobre documentos';
COMMENT ON TABLE reuniones_seguimiento IS 'Registro estructurado de sesiones de tutoría';
COMMENT ON TABLE mensajes              IS 'Canal de comunicación interno por proyecto';
COMMENT ON TABLE notificaciones        IS 'Alertas internas del sistema para cada usuario';
COMMENT ON TABLE audit_logs            IS 'Log inmutable de seguridad y auditoría';
COMMENT ON TABLE login_intentos        IS 'Rastreo de intentos de autenticación';