#!/usr/bin/env bash
# Generate a self-signed server cert for Postgres TLS.
# Run once. Needs no sudo: the data dir is owned by the account running the
# server, which is the same account running this script.
set -euo pipefail

PGDATA=/opt/homebrew/var/postgresql@17
CN=mqi-project-db

cd "$PGDATA"
umask 077

openssl req -new -x509 -days 365 -nodes \
  -out server.crt -keyout server.key \
  -subj "/CN=${CN}" \
  -addext "subjectAltName=IP:192.168.1.17,DNS:localhost"

# Postgres refuses to start if the key is group/world readable.
chmod 600 server.key
chmod 644 server.crt

echo "wrote $PGDATA/server.crt and server.key"
echo "hand server.crt to teammates if you want sslmode=verify-ca instead of require"
