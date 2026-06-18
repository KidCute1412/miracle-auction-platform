-- Auto-generated INSERT statements for categories table

-- Generated at: 2025-12-27 12:27:14



-- ============================================

-- PARENT CATEGORIES (3 categories mới)

-- ============================================

-- Reset sequence and truncate
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- Insert parent categories with explicit IDs to make child references completely deterministic
INSERT INTO categories (id, name, parent_id, status, deleted, description, slug, cat_image) VALUES
(1, 'Điện Tử', NULL, 'active', FALSE, 'Danh mục Điện Tử', 'dien-tu', 'https://shop-images.imgix.net/291430_2.jpg'),
(2, 'Thời Trang', NULL, 'active', FALSE, 'Danh mục Thời Trang', 'thoi-trang', 'https://shop-images.imgix.net/291631_2.jpg'),
(7, 'Nội Thất & Gia Dụng', NULL, 'active', FALSE, 'Danh mục Nội Thất & Gia Dụng', 'noi-that-gia-dung', 'https://shop-images.imgix.net/291872_2.jpg'),
(8, 'Thể Thao & Du Lịch', NULL, 'active', FALSE, 'Danh mục Thể Thao & Du Lịch', 'the-thao-du-lich', 'https://shop-images.imgix.net/291300_2.jpg'),
(9, 'Sách & Văn Phòng Phẩm', NULL, 'active', FALSE, 'Danh mục Sách & Văn Phòng Phẩm', 'sach-van-phong-pham', 'https://shop-images.imgix.net/291736_2.jpg');

-- Adjust the sequence so that subsequent auto-generated IDs start after the max ID (9)
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));



-- ============================================

-- CHILD CATEGORIES (25 categories con)

-- ============================================


-- Child categories của 'Điện Tử' (parent_id = 1)

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Điện Thoại', 1, 'active', FALSE, 'Điện Thoại thuộc Điện Tử', 'ien-thoai', 'https://shop-images.imgix.net/291430_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Laptop', 1, 'active', FALSE, 'Laptop thuộc Điện Tử', 'laptop', 'https://shop-images.imgix.net/291742_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Máy Tính Bảng', 1, 'active', FALSE, 'Máy Tính Bảng thuộc Điện Tử', 'may-tinh-bang', 'https://shop-images.imgix.net/291300_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Phụ Kiện Điện Tử', 1, 'active', FALSE, 'Phụ Kiện Điện Tử thuộc Điện Tử', 'phu-kien-ien-tu', 'https://shop-images.imgix.net/291336_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Thiết Bị Âm Thanh', 1, 'active', FALSE, 'Thiết Bị Âm Thanh thuộc Điện Tử', 'thiet-bi-am-thanh', 'https://shop-images.imgix.net/291333_2.jpg');


-- Child categories của 'Thời Trang' (parent_id = 2)

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Áo Nam', 2, 'active', FALSE, 'Áo Nam thuộc Thời Trang', 'ao-nam', 'https://shop-images.imgix.net/291631_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Áo Nữ', 2, 'active', FALSE, 'Áo Nữ thuộc Thời Trang', 'ao-nu', 'https://shop-images.imgix.net/291662_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Quần Jeans', 2, 'active', FALSE, 'Quần Jeans thuộc Thời Trang', 'quan-jeans', 'https://shop-images.imgix.net/291703_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Giày Dép', 2, 'active', FALSE, 'Giày Dép thuộc Thời Trang', 'giay-dep', 'https://shop-images.imgix.net/291299_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Phụ Kiện Thời Trang', 2, 'active', FALSE, 'Phụ Kiện Thời Trang thuộc Thời Trang', 'phu-kien-thoi-trang', 'https://shop-images.imgix.net/291704_2.jpg');


-- Child categories của 'Nội Thất & Gia Dụng' (parent_id = 7)

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Bàn Ghế', 7, 'active', FALSE, 'Bàn Ghế thuộc Nội Thất & Gia Dụng', 'ban-ghe', 'https://shop-images.imgix.net/291858_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Sofa', 7, 'active', FALSE, 'Sofa thuộc Nội Thất & Gia Dụng', 'sofa', 'https://shop-images.imgix.net/291351_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Đồ Dùng Nhà Bếp', 7, 'active', FALSE, 'Đồ Dùng Nhà Bếp thuộc Nội Thất & Gia Dụng', 'o-dung-nha-bep', 'https://shop-images.imgix.net/291704_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Đèn Trang Trí', 7, 'active', FALSE, 'Đèn Trang Trí thuộc Nội Thất & Gia Dụng', 'en-trang-tri', 'https://shop-images.imgix.net/291656_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Chăn Ga Gối', 7, 'active', FALSE, 'Chăn Ga Gối thuộc Nội Thất & Gia Dụng', 'chan-ga-goi', 'https://shop-images.imgix.net/291669_2.jpg');


-- Child categories của 'Thể Thao & Du Lịch' (parent_id = 8)

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Dụng Cụ Tập Gym', 8, 'active', FALSE, 'Dụng Cụ Tập Gym thuộc Thể Thao & Du Lịch', 'dung-cu-tap-gym', 'https://shop-images.imgix.net/291859_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Xe Đạp', 8, 'active', FALSE, 'Xe Đạp thuộc Thể Thao & Du Lịch', 'xe-ap', 'https://shop-images.imgix.net/291300_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Giày Thể Thao', 8, 'active', FALSE, 'Giày Thể Thao thuộc Thể Thao & Du Lịch', 'giay-the-thao', 'https://shop-images.imgix.net/291847_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Phụ Kiện Du Lịch', 8, 'active', FALSE, 'Phụ Kiện Du Lịch thuộc Thể Thao & Du Lịch', 'phu-kien-du-lich', 'https://shop-images.imgix.net/291443_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Dụng Cụ Camping', 8, 'active', FALSE, 'Dụng Cụ Camping thuộc Thể Thao & Du Lịch', 'dung-cu-camping', 'https://shop-images.imgix.net/291697_2.jpg');


-- Child categories của 'Sách & Văn Phòng Phẩm' (parent_id = 9)

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Sách Văn Học', 9, 'active', FALSE, 'Sách Văn Học thuộc Sách & Văn Phòng Phẩm', 'sach-van-hoc', 'https://shop-images.imgix.net/291625_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Sách Kỹ Năng', 9, 'active', FALSE, 'Sách Kỹ Năng thuộc Sách & Văn Phòng Phẩm', 'sach-ky-nang', 'https://shop-images.imgix.net/291695_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Văn Phòng Phẩm', 9, 'active', FALSE, 'Văn Phòng Phẩm thuộc Sách & Văn Phòng Phẩm', 'van-phong-pham', 'https://shop-images.imgix.net/291626_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Dụng Cụ Học Tập', 9, 'active', FALSE, 'Dụng Cụ Học Tập thuộc Sách & Văn Phòng Phẩm', 'dung-cu-hoc-tap', 'https://shop-images.imgix.net/291535_2.jpg');

INSERT INTO categories (name, parent_id, status, deleted, description, slug, cat_image)
VALUES ('Sổ Tay', 9, 'active', FALSE, 'Sổ Tay thuộc Sách & Văn Phòng Phẩm', 'so-tay', 'https://shop-images.imgix.net/291704_2.jpg');