-- Add one developer login.
--
--   psql "$ADMIN_URL" -f backend/db/add-developer.sql \
--     -v who=dev_name -v pw="'...'" [-v role=mqi_app_rw]
--
-- role defaults to mqi_read (read-only). Pass role=mqi_app_rw for someone who
-- needs to insert/update while developing. Never grant mqi_ddl to a person --
-- schema changes go through mqi_migrator so they are reviewable.
--
-- Revoke with: DROP ROLE dev_name;
\set ON_ERROR_STOP on

\if :{?role}
\else
  \set role mqi_read
\endif

CREATE ROLE :who LOGIN IN ROLE :role PASSWORD :pw;
