# mqi_project — shared database access

The shared database lives on **Neon** (managed Postgres 18.6). It is live: schema
loaded, seeded, and set up with per-role credentials. This document is how the
team connects and how the access model works.

## Why it looks like this

Development ran against a local Homebrew Postgres whose `pg_hba.conf` was on
`trust` — every local connection accepted with **no password**, and no superuser
password had ever been set. Workable for one laptop, unusable for a shared
database, and impossible to give teammates without handing over the machine.

Neon replaces that: always on, stable hostname, TLS enforced, backups handled,
and entirely separate from the unrelated databases still sitting on the dev
laptop (`learning_platform`, `nobiai`, `tableau_rag`).

## Roles

| Role | Login | Purpose | Privileges |
|---|---|---|---|
| `mqi_read` | no | group | CONNECT, USAGE on `public`, SELECT |
| `mqi_app_rw` | no | group | `mqi_read` + INSERT/UPDATE/DELETE, sequence usage |
| `mqi_ddl` | no | group | `mqi_app_rw` + CREATE on `public` |
| `mqi_admin` | yes | owns all tables, adds developers | `mqi_ddl` + CREATEROLE |
| `mqi_migrator` | yes | runs migrations | `mqi_ddl` |
| `mqi_app` | yes | **backend runtime** | `mqi_app_rw` — no DDL |
| per-person | yes | one login per developer | `mqi_read`, or `mqi_app_rw` if they need to write |

`mqi_admin` owns all six tables and their sequences. `mqi_app` deliberately
cannot run DDL, so a leaked app credential cannot drop or alter tables.
Developers each get their own login — never a shared one — so access is
revocable per person with `DROP ROLE`.

Verified working: `mqi_app` can insert but gets `permission denied for schema
public` on CREATE TABLE and `must be owner` on DROP TABLE; a `dev_*` role can
read but gets `permission denied` on insert.

## Connecting

Get your role name and password from whoever set this up, plus the host (it is
in `backend/.env`, and on the Neon dashboard). TLS is mandatory.

```bash
psql "postgresql://dev_you:PW@HOST/mqi_project?sslmode=require"
```

### Use the pooled host for applications

Neon gives two hostnames. The pooled one has `-pooler` in it:

```
ep-xxxx.REGION.aws.neon.tech          # direct — psql, migrations, admin work
ep-xxxx-pooler.REGION.aws.neon.tech   # pooled — the application
```

`backend/.env` points at the **pooled** host. Free-tier connection caps are
low, and an app that opens a connection per request exhausts the direct
endpoint quickly. This causes more real-world free-tier breakage than storage
limits ever do.

## Adding a developer

Run as `mqi_admin` or the Neon owner role:

```bash
psql "$ADMIN_URL" -f backend/db/add-developer.sql -v who=dev_bob -v pw="'...'"
```

Read-only by default; pass `-v role=mqi_app_rw` for someone who needs to write
while developing. Never grant `mqi_ddl` to a person — schema changes go through
`mqi_migrator` so they stay reviewable. Revoke with `DROP ROLE dev_bob;`.

Note: Neon's control plane rejects weak passwords at the API level, so a short
lowercase password will fail with "insecure password" no matter what SQL you
send. Use a generated one.

Current developer logins: `nigar_dev` (`mqi_app_rw`).

## Rebuilding from scratch

If the database is ever recreated, run these in order against the owner
connection string. **Order matters**: `roles.sql` grants `ON ALL TABLES`, which
only affects tables that already exist.

```bash
ADMIN_URL='postgresql://OWNER:PW@HOST/mqi_project?sslmode=require'

psql "$ADMIN_URL" -f backend/db/schema.sql          # 6 tables, indexes, triggers
psql "$ADMIN_URL" -f backend/db/seed.sql            # needs pgcrypto for crypt()
psql "$ADMIN_URL" -f backend/db/roles.sql           # roles, groups, grants
psql "$ADMIN_URL" -f backend/db/role-passwords.sql \
  -v app_pw="'...'" -v mig_pw="'...'" -v adm_pw="'...'"
psql "$ADMIN_URL" -f backend/db/ownership.sql       # tables -> mqi_admin
```

Then change the seeded admin login — `seed.sql` hardcodes `ChangeMe123!`:

```bash
psql "$ADMIN_URL" -c "set role mqi_admin" \
  -c "update admins set password_hash = crypt('NEW', gen_salt('bf',12));"
```

### Three things that will bite you on a managed host

These are already handled in the scripts; this is why the code looks like it
does.

1. **`ERROR: must be able to SET ROLE "mqi_admin"`** — since PG16, you cannot
   make a role the owner of an object unless you can `SET ROLE` to it.
   `CREATEROLE` grants the creator ADMIN on new roles but **not** `set_option`.
   `roles.sql` ends with an explicit `GRANT ... WITH SET TRUE` to fix this.

2. **`ERROR: permission denied to change default privileges`** — the
   `ALTER DEFAULT PRIVILEGES FOR ROLE x` form needs INHERIT membership in `x`,
   which the setup role intentionally does not have. `ownership.sql` uses
   `SET ROLE` instead, which only needs `set_option`.

3. **`ERROR: must be owner of sequence`** — `ALTER TABLE ... OWNER TO` already
   transfers sequences owned by that table's serial columns. Restating them as
   `ALTER SEQUENCE` fails, because ownership has already moved.

Also: Neon creates a default database called `neondb`. `PUBLIC` holds CONNECT on
it, so any role could connect there even without privileges on `mqi_project`.
It is empty, but close it anyway:

```bash
psql "$ADMIN_URL" -c "REVOKE CONNECT ON DATABASE neondb FROM PUBLIC;"
```

## Backups

Neon's free tier gives limited point-in-time recovery, so one bad `DELETE` can
be permanent. The database is small enough that a dump is nearly instant:

```bash
pg_dump "$ADMIN_URL" > backup-$(date +%F).sql
```

Worth running before any migration.

## Credential handling

- No password appears in this directory, and none should ever be committed.
- `backend/.env` is gitignored (`.gitignore:2`) and mode 600. Keep it that way.
- Distribute through a password manager, one role per person.
- Rotate with `role-passwords.sql` using new values — no DROP needed.

## Local development

`local-hardening/` is unrelated to this database. It fixes the `trust` auth on
the dev laptop's own cluster, which is still wide open and worth repairing on
its own merits. See `local-hardening/README.md`.
