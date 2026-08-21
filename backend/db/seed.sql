CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO admins (email, password_hash, name)
VALUES ('admin@mqi-project.local', crypt('ChangeMe123!', gen_salt('bf', 12)), 'Admin');

INSERT INTO categories (name)
VALUES ('Handmade'), ('Food'), ('Clothing'), ('Workshops');

INSERT INTO products (name, description, price, category_id, image_url) VALUES
    ('Handmade Tote Bag', 'A durable tote bag handmade by a community member.', 25.00, (SELECT id FROM categories WHERE name = 'Handmade'), 'https://images.example.com/tote-bag.jpg'),
    ('Embroidered Scarf', 'Hand-embroidered scarf with traditional patterns.', 18.50, (SELECT id FROM categories WHERE name = 'Clothing'), 'https://images.example.com/scarf.jpg'),
    ('Homemade Jam', 'Seasonal fruit jam made in small batches.', 6.00, (SELECT id FROM categories WHERE name = 'Food'), 'https://images.example.com/jam.jpg');

INSERT INTO services (name, description, price, category_id) VALUES
    ('Custom Sewing', 'Alterations and custom sewing for garments.', 20.00, (SELECT id FROM categories WHERE name = 'Clothing')),
    ('Baking Workshop', 'Hands-on workshop learning traditional baking techniques.', 15.00, (SELECT id FROM categories WHERE name = 'Workshops'));

INSERT INTO content (key, value) VALUES
    ('about', 'About the community.'),
    ('mission', 'Our mission.'),
    ('activities', 'What we do.'),
    ('whatsapp', 'https://wa.me/000000000'),
    ('instagram', 'https://instagram.com/');

