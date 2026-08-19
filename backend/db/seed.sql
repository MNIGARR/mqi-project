CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO admins (email, password_hash, name)
VALUES ('admin@mqi-project.local', crypt('ChangeMe123!', gen_salt('bf', 12)), 'Admin');

INSERT INTO categories (name)
VALUES ('Handmade'), ('Food'), ('Clothing'), ('Workshops');

INSERT INTO content (key, value) VALUES
    ('about', 'About the community.'),
    ('mission', 'Our mission.'),
    ('activities', 'What we do.'),
    ('whatsapp', 'https://wa.me/000000000'),
    ('instagram', 'https://instagram.com/');
