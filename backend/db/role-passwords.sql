-- Set login-role passwords. Pass values in as psql variables so no secret is
-- ever written to a file:
--   psql "$ADMIN_URL" -f backend/db/role-passwords.sql \
--     -v app_pw="'...'" -v mig_pw="'...'" -v adm_pw="'...'"
--
-- Stored as SCRAM-SHA-256 verifiers (the default since PG14), so these are not
-- reversible. Rotate by re-running with new values -- no DROP needed.
\set ON_ERROR_STOP on

ALTER ROLE mqi_app      WITH PASSWORD :app_pw;
ALTER ROLE mqi_migrator WITH PASSWORD :mig_pw;
ALTER ROLE mqi_admin    WITH PASSWORD :adm_pw;
