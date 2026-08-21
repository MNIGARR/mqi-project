-- Server-level settings via ALTER SYSTEM (lands in postgresql.auto.conf, so
-- postgresql.conf itself stays pristine and this is easy to undo with
-- ALTER SYSTEM RESET <name>).
--
-- Requires superuser. `ssl` and `listen_addresses` need a RESTART, not a
-- reload -- see db/README.md for the ordering.
\set ON_ERROR_STOP on

-- Listen on the LAN address as well as loopback. Prefer naming the interface
-- explicitly over '*' so a new interface (VPN, hotspot) doesn't widen exposure.
ALTER SYSTEM SET listen_addresses = 'localhost,192.168.1.17';

ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file  = 'server.key';
ALTER SYSTEM SET ssl_min_protocol_version = 'TLSv1.2';

-- Prod-grade auditing: without this there is no record of who connected.
ALTER SYSTEM SET logging_collector   = on;
ALTER SYSTEM SET log_destination     = 'stderr';
ALTER SYSTEM SET log_connections     = on;
ALTER SYSTEM SET log_disconnections  = on;
ALTER SYSTEM SET log_line_prefix     = '%m [%p] %q%u@%d from %h ';

-- Bound the blast radius of a leaked credential / runaway client.
ALTER SYSTEM SET max_connections = 60;
