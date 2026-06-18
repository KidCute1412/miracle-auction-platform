# Hướng Dẫn Thiết Lập Dự Án Đấu Giá Trực Tuyến

## Giới Thiệu Dự Án

**Online Auction** là một nền tảng đấu giá trực tuyến được xây dựng để cho phép người dùng tham gia đấu giá sản phẩm một cách thuận tiện và an toàn. Dự án bao gồm các tính năng chính như:

- **Đấu giá real-time**: Sử dụng Socket.io để cập nhật giá đấu giá tức thời.
- **Quản lý sản phẩm và danh mục**: Hỗ trợ thêm, sửa, xóa sản phẩm và phân loại theo danh mục.
- **Hệ thống người dùng**: Đăng ký, đăng nhập, quản lý hồ sơ cá nhân.
- **Thông báo email**: Tự động gửi email khi đấu giá kết thúc.
- **Upload hình ảnh**: Tích hợp Cloudinary để lưu trữ và quản lý hình ảnh sản phẩm.
- **Giao diện thân thiện**: Frontend responsive với React và TailwindCSS.

**Công nghệ sử dụng**:

- **Backend**: Node.js, TypeScript, Express.js, Socket.io, Knex.js, PostgreSQL (Supabase)
- **Frontend**: React, Vite, TailwindCSS, Socket.io-client
- **Bảo mật**: JWT, bcrypt
- **Email**: Nodemailer với Gmail SMTP
- **Hình ảnh**: Cloudinary

Dự án này phù hợp cho việc học tập, phát triển kỹ năng full-stack và triển khai ứng dụng web real-time.

## Yêu Cầu Hệ Thống

- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- PostgreSQL (chỉ cần nếu sử dụng local; nếu dùng Supabase thì không cần)

## 1. Thiết Lập Cơ Sở Dữ Liệu (Database)

### 1.1 Sử Dụng Supabase (Khuyến Nghị)

Dự án này sử dụng PostgreSQL thông qua dịch vụ đám mây Supabase để dễ dàng quản lý và triển khai.

1. Đăng ký tài khoản tại [Supabase](https://supabase.com/).
2. Tạo một project mới trên Supabase.
3. Trong dashboard của project, vào phần "Settings" > "Database" để lấy thông tin kết nối.

### 1.2 Chạy Scripts Khởi Tạo Dữ Liệu

1. Trong Supabase dashboard, vào phần "SQL Editor".
2. Chạy các file Jupyter Notebook hoặc SQL theo thứ tự:
   - Chạy file `data/database.sql` để khởi tạo database.
   - Chạy nội dung của `data/category/category.ipynb`, file này tạo nội dung `data/category/category.insert.sql` phù hợp để thêm dữ liệu categories.
   - Chạy nội dung của `data/product/tikiAPI/product.ipynb`, file này cho phép tạo products phù hợp mỗi categories, kết quả mỗi bộ products sẽ ghi đè lên file `data/product/tikiAPI/product.insert.sql` để thêm dữ liệu products.

Bạn có thể copy-paste nội dung các file SQL vào SQL Editor của Supabase và chạy.

## 2. Thiết Lập Backend

### 2.1 Cài Đặt Dependencies

1. Mở terminal và điều hướng đến thư mục `Backend`.
2. Chạy lệnh:
   ```
   npm install
   ```

### 2.2 Cấu Hình Biến Môi Trường

1. Copy file `.env.example` trong thư mục `Backend` thành `.env`.
2. Chỉnh sửa file `.env` với thông tin thực tế của bạn:
   - Nếu sử dụng Supabase: Thay `DB_HOST`, `DB_USER`, `DB_PASSWORD` bằng thông tin từ Supabase dashboard ("Settings" > "Database").
   - Cập nhật các biến khác như `JWT_SECRET`, `GMAIL_ADDRESS`, `CLOUDINARY_*`, v.v. với thông tin thực tế.

### 2.3 Chạy Backend

1. Trong thư mục `Backend`, chạy:
   ```
   npm run dev
   ```
2. Backend sẽ chạy trên `http://localhost:5000`.

## 3. Thiết Lập Frontend

### 3.1 Cài Đặt Dependencies

1. Mở terminal và điều hướng đến thư mục `Frontend`.
2. Chạy lệnh:
   ```
   npm install
   ```

### 3.2 Chạy Frontend

1. Trong thư mục `Frontend`, chạy:
   ```
   npm run dev
   ```
2. Frontend sẽ chạy trên `http://localhost:5173`.

## 4. Triển Khai Toàn Bộ Dự Án

### 4.1 Chạy Song Song Backend và Frontend

1. Mở hai terminal riêng biệt.
2. Trong terminal 1: Chạy backend (`npm run dev` trong thư mục Backend).
3. Trong terminal 2: Chạy frontend (`npm run dev` trong thư mục Frontend).

### 4.2 Truy Cập Ứng Dụng

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 5. Cấu Hình Bổ Sung

### 5.1 Email Setup

Để gửi email (cho việc kết thúc đấu giá), cấu hình trong file `.env`:

- `GMAIL_ADDRESS`: Email Gmail gửi
- `GMAIL_APP_PASSWORD`: Mật khẩu ứng dụng Gmail (tạo trong Google Account settings)

### 5.2 Cloudinary Setup

Để upload hình ảnh:

- Đăng ký tài khoản Cloudinary
- Thêm thông tin vào `.env`

### 5.3 Socket.io

Ứng dụng sử dụng Socket.io cho đấu giá real-time. Đảm bảo CORS được cấu hình đúng (mặc định cho `localhost:5173`).

## 6. Troubleshooting

- Nếu gặp lỗi kết nối database với Supabase, kiểm tra lại thông tin connection trong "Settings" > "Database" và đảm bảo project đang active.
- Nếu gặp lỗi kết nối database local, kiểm tra lại thông tin trong `.env` và đảm bảo PostgreSQL đang chạy.
- Nếu port bị conflict, thay đổi port trong `server.ts` (backend) hoặc `vite.config.ts` (frontend).
- Đảm bảo PostgreSQL (local hoặc Supabase) đang chạy trước khi start backend.

## 7. Cấu Trúc Dự Án

- `Backend/`: Code backend với Express.js, Socket.io, Knex.js
- `Frontend/`: Code frontend với React, Vite, TailwindCSS

Chúc bạn thành công trong việc thiết lập dự án!
