-- =============================================================
-- BASE DE DATOS PROPIA DEL MICROSERVICIO DE AUDITORIA
-- PostgreSQL 16
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS audit_events (
    id              BIGSERIAL PRIMARY KEY,
    event_id        VARCHAR(120) NOT NULL,
    event           VARCHAR(120) NOT NULL,
    module          VARCHAR(80),
    aggregate_type  VARCHAR(80),
    aggregate_id    VARCHAR(120),
    actor_id        VARCHAR(120),
    actor_name      VARCHAR(255),
    actor_email     VARCHAR(255),
    actor_role      VARCHAR(80),
    target_name     VARCHAR(255),
    target_email    VARCHAR(255),
    description     TEXT,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    payload         JSONB NOT NULL,
    occurred_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_audit_events_event_id
    ON audit_events (event_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_event
    ON audit_events (event);

CREATE INDEX IF NOT EXISTS idx_audit_events_module
    ON audit_events (module);

CREATE INDEX IF NOT EXISTS idx_audit_events_aggregate
    ON audit_events (aggregate_type, aggregate_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor_email
    ON audit_events (actor_email);

CREATE INDEX IF NOT EXISTS idx_audit_events_target_email
    ON audit_events (target_email);

CREATE INDEX IF NOT EXISTS idx_audit_events_occurred_at
    ON audit_events (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
    ON audit_events (created_at DESC);

COMMENT ON TABLE audit_events IS 'Eventos de auditoria consumidos desde Kafka por el microservicio de auditoria';
