-- Roles, groups and grants for mqi_project. Portable across a managed
-- Postgres (Neon / Supabase / RDS) and a local cluster.
--
-- Run this AFTER schema.sql: the "ON ALL TABLES" grants only affect tables
-- that already exist. The ALTER DEFAULT PRIVILEGES in 04-ownership.sql is what
-- covers tables created later.
--
-- Needs CREATEROLE, not superuser -- which is what managed providers give you
-- (Neon's owner role, RDS master, Supabase `postgres`). Idempotent: safe to
-- re-run. Uses current_database() rather than a hardcoded name, because
-- managed providers often dictate the database name (Neon defaults to
-- `neondb`).
\set ON_ERROR_STOP on
BEGIN;

-- ---------- group roles (no login, no password) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='mqi_read') THEN
    CREATE ROLE mqi_read NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='mqi_app_rw') THEN
    CREATE ROLE mqi_app_rw NOLOGIN IN ROLE mqi_read;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='mqi_ddl') THEN
    CREATE ROLE mqi_ddl NOLOGIN IN ROLE mqi_app_rw;
  END IF;
END $$;

-- ---------- login roles (passwords set by 02-passwords.sql) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='mqi_admin') THEN
    CREATE ROLE mqi_admin LOGIN CREATEROLE IN ROLE mqi_ddl;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='mqi_migrator') THEN
    CREATE ROLE mqi_migrator LOGIN IN ROLE mqi_ddl;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='mqi_app') THEN
    CREATE ROLE mqi_app LOGIN IN ROLE mqi_app_rw;
  END IF;
END $$;

-- ---------- lock down database + public schema ----------
-- PG15+ already removes CREATE on `public` from PUBLIC; the REVOKE is a no-op
-- there and a real fix on anything older.
DO $$
BEGIN
  EXECUTE format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO mqi_read', current_database());
END $$;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE  ON SCHEMA public TO mqi_read;
GRANT CREATE ON SCHEMA public TO mqi_ddl;

-- ---------- data privileges on existing objects ----------
GRANT SELECT ON ALL TABLES    IN SCHEMA public TO mqi_read;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO mqi_read;

GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mqi_app_rw;
GRANT USAGE, UPDATE ON ALL SEQUENCES       IN SCHEMA public TO mqi_app_rw;

-- ---------- allow the setup role to assign ownership ----------
-- PG16+ requires that you be able to SET ROLE to a role before you can make it
-- the owner of an object. CREATEROLE grants the creator ADMIN on new roles but
-- NOT set_option, so ownership.sql fails with
--   ERROR: must be able to SET ROLE "mqi_admin"
-- unless we take SET explicitly here. ADMIN is what permits this self-grant.
-- INHERIT stays false: the setup role should be able to *act as* mqi_admin on
-- demand, not silently absorb its privileges.
DO $$
BEGIN
  EXECUTE format('GRANT mqi_admin    TO %I WITH SET TRUE, INHERIT FALSE', current_user);
  EXECUTE format('GRANT mqi_migrator TO %I WITH SET TRUE, INHERIT FALSE', current_user);
END $$;

COMMIT;
