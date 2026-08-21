-- LOCAL CLUSTER ONLY. Not needed on managed Postgres.
--
-- This cluster's two superusers (`postgres` and `ayla.i`) have NO password,
-- because Homebrew's initdb never sets one and pg_hba.conf was left on `trust`.
-- Run this BEFORE installing pg_hba.conf.proposed, or the reload will lock you
-- out of your own cluster with no way back in short of single-user mode.
--
--   psql -U "$USER" -d postgres -f db/local-hardening/00-superuser-passwords.sql \
--     -v super_pw="'...'"
\set ON_ERROR_STOP on
ALTER ROLE postgres WITH PASSWORD :super_pw;
ALTER ROLE "ayla.i" WITH PASSWORD :super_pw;
