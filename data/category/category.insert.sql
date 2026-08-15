-- Reset categories table
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- Insert parent categories
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (1, 'Fashion', NULL, 'active', FALSE, 'Category Fashion', 'fashion', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (2, 'Electronics', NULL, 'active', FALSE, 'Category Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (3, 'Art & Jewelry', NULL, 'active', FALSE, 'Category Art & Jewelry', 'art-jewelry', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500');

-- Insert child subcategories
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (4, 'Men''s Fashion', 1, 'active', FALSE, 'Men''s Fashion under Fashion', 'mens-fashion', 'https://file.hstatic.net/1000284478/file/phong-cach-thoi-trang-nam-2024-b_26df758c91ef4fc78b185be0ff9f4cb0.jpg');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (5, 'Women''s Fashion', 1, 'active', FALSE, 'Women''s Fashion under Fashion', 'womens-fashion', 'https://uvi.vn/wp-content/uploads/2022/03/Chan-vay-xoe-duoi-ca.jpg');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (6, 'Footwear', 1, 'active', FALSE, 'Footwear under Fashion', 'footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (7, 'Phones & Tablets', 2, 'active', FALSE, 'Phones & Tablets under Electronics', 'phones-tablets', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (8, 'Laptop & PC', 2, 'active', FALSE, 'Laptop & PC under Electronics', 'laptop-pc', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (9, 'Digital Accessories', 2, 'active', FALSE, 'Digital Accessories under Electronics', 'digital-accessories', 'https://storage.googleapis.com/48877118-7272-4a4d-b302-0465d8aa4548/f646d3c1-f6c3-4227-92ba-bd451d0401ea/8a9fa536-61df-4faa-9217-0033791bf9a5.jpg');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (10, 'Cameras & Camcorders', 2, 'active', FALSE, 'Cameras & Camcorders under Electronics', 'cameras-camcorders', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (11, 'Paintings & Artworks', 3, 'active', FALSE, 'Paintings & Artworks under Art & Jewelry', 'paintings-artworks', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (12, 'Sculptures & Statues', 3, 'active', FALSE, 'Sculptures & Statues under Art & Jewelry', 'sculptures-statues', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500');
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES (13, 'Jewelry', 3, 'active', FALSE, 'Jewelry under Art & Jewelry', 'jewelry', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500');

-- Adjust ID sequence
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));