CREATE TABLE categories (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) CHECK (price >= 0),
    category_id INTEGER REFERENCES categories (id) ON DELETE SET NULL,
    image_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE services (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) CHECK (price >= 0),
    category_id INTEGER REFERENCES categories (id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE events (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    event_date  TIMESTAMPTZ NOT NULL,
    location    TEXT,
    image_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admins (
    id            SERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name          TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Editable text blocks: about, mission, activities, whatsapp, instagram
CREATE TABLE content (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX products_category_id_idx ON products (category_id);
CREATE INDEX services_category_id_idx ON services (category_id);
CREATE INDEX events_event_date_idx ON events (event_date);

CREATE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_touch BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER services_touch BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER events_touch BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER content_touch BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
