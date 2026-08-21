# Local cluster hardening (optional, separate from prod)

Nothing in this directory is needed for the managed database. It exists because
the local Homebrew cluster is currently wide open, and that is worth fixing on
its own merits even after prod moves off this machine.

## The current state

`/opt/homebrew/var/postgresql@17/pg_hba.conf` is Homebrew's default:

```
local  all  all                trust
host   all  all  127.0.0.1/32  trust
host   all  all  ::1/128       trust
```

`trust` means **every local connection is accepted with no password**, for every
database on the cluster — including `learning_platform`, `nobiai` and
`tableau_rag`. Any process running as your user, or any code you execute, can
read or drop all of it. There is no superuser password to stop it.

## Fixing it

Order is load-bearing. Step 1 before step 3, or you lose access to the cluster.

```bash
cd /Users/ayla.i/Desktop/holb-final-project

# 1. give the superusers passwords (they have none today)
psql -U "$USER" -d postgres \
  -f backend/db/local-hardening/00-superuser-passwords.sql -v super_pw="'...'"

# 2. optional: TLS + listen/logging settings
./backend/db/local-hardening/setup-tls.sh
psql -U "$USER" -d postgres -f backend/db/local-hardening/05-server-config.sql

# 3. swap trust -> scram-sha-256 (back up first)
cp /opt/homebrew/var/postgresql@17/pg_hba.conf ~/pg_hba.conf.bak
cp backend/db/local-hardening/pg_hba.conf.proposed /opt/homebrew/var/postgresql@17/pg_hba.conf

# 4. restart
brew services restart postgresql@17
```

If you skip step 2, also drop the `hostssl` line from `pg_hba.conf.proposed`
first — it requires TLS, and without a cert the server will refuse those
connections. `05-server-config.sql` also sets `listen_addresses` to include the
LAN address; delete that line if you want to stay loopback-only.

## Verify

```bash
# must now FAIL (no password)
psql "postgresql://ayla.i@localhost:5432/postgres" -c 'select 1'
# must SUCCEED
psql "postgresql://ayla.i:PW@localhost:5432/postgres" -c 'select current_user'
```

## Rollback

```bash
cp ~/pg_hba.conf.bak /opt/homebrew/var/postgresql@17/pg_hba.conf
psql -U "$USER" -d postgres -c "ALTER SYSTEM RESET listen_addresses;"
psql -U "$USER" -d postgres -c "ALTER SYSTEM RESET ssl;"
brew services restart postgresql@17
```

## Note on `nobiai`

At the time of writing something had ~10 idle connections open against
`nobiai`. Restarting the cluster drops them. Make sure that is not a running job
you care about before step 4.
