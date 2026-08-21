-- Hand the schema to a shared role so no object depends on one person's login.
-- Run as the provider's owner role (Neon owner / RDS master / Supabase postgres).
--
-- Deliberately NOT using REASSIGN OWNED: databases are cluster-shared objects,
-- so a blanket REASSIGN would also move any other database owned by the same
-- role -- which on a local cluster means unrelated projects get swept along.
\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE public.admins     OWNER TO mqi_admin;
ALTER TABLE public.categories OWNER TO mqi_admin;
ALTER TABLE public.content    OWNER TO mqi_admin;
ALTER TABLE public.events     OWNER TO mqi_admin;
ALTER TABLE public.products   OWNER TO mqi_admin;
ALTER TABLE public.services   OWNER TO mqi_admin;

-- No ALTER SEQUENCE needed: ALTER TABLE ... OWNER TO already transfers any
-- sequence owned by that table's serial/identity columns. Restating them here
-- fails with "must be owner of sequence ..." because ownership has already
-- moved by that point. (public.content has no sequence -- its id is not serial.)

-- ALTER DATABASE ... OWNER is intentionally omitted: most managed providers
-- reserve database ownership and the statement fails. It is not needed -- table
-- ownership is what governs DDL rights. On a self-hosted cluster you may add:
--   ALTER DATABASE mqi_project OWNER TO mqi_admin;

-- Tables created LATER inherit these grants automatically. Without this, every
-- new migration would need a manual GRANT for every role.
--
-- Done via SET ROLE rather than "ALTER DEFAULT PRIVILEGES FOR ROLE x": the
-- FOR ROLE form requires INHERIT membership in x, which the setup role
-- deliberately does not have (see roles.sql). SET ROLE uses the set_option
-- granted there, and defaults then apply to the role we have become.
SET ROLE mqi_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mqi_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO mqi_app_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO mqi_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, UPDATE ON SEQUENCES TO mqi_app_rw;
RESET ROLE;

-- Same, for tables created by the migration role.
SET ROLE mqi_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mqi_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO mqi_app_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO mqi_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, UPDATE ON SEQUENCES TO mqi_app_rw;
RESET ROLE;

COMMIT;
