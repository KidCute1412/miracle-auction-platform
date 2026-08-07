# TÀI LIỆU CHI TIẾT: NÂNG CẤP GIAO DIỆN HỆ THỐNG (PHONG CÁCH VANGUARD ELITE)

Tài liệu này đặc tả chi tiết kế hoạch nâng cấp giao diện người dùng (UI/UX) cho hệ thống Đấu giá trực tuyến (Online Auction). Mục tiêu là chuyển đổi toàn bộ giao diện hiện tại sang phong cách **Vanguard Elite** (Sang trọng, đẳng cấp kết hợp công nghệ tương lai) và hỗ trợ đầy đủ cơ chế Light/Dark Mode.

---

## I. TRIẾT LÝ THIẾT KẾ: VANGUARD ELITE

Phong cách **Vanguard Elite** hướng đến nhóm người dùng tìm kiếm sự cao cấp, chuyên nghiệp và đáng tin cậy. Thiết kế kết hợp giữa hai yếu tố:
1. **Sự sang trọng cổ điển (Classic Luxury):** Sử dụng các gam màu tối sâu thẳm, kim loại quý (vàng, bạch kim), khoảng trắng thoáng đạt và phông chữ serif/sans-serif cân đối.
2. **Sự hiện đại đột phá (Future-Tech):** Sử dụng các hiệu ứng khúc xạ kính mờ (glassmorphism), các đường viền phát sáng mỏng sắc sảo (glowing borders), và các micro-interactions mượt mà mang hơi hướng kỹ thuật số cao cấp.

---

## II. ĐỊNH NGHĨA HỆ THỐNG MÀU SẮC & PHÔNG CHỮ (THEME TOKENS)

Chúng ta cấu hình lại hệ thống CSS Variables trong `global.css` sử dụng chuẩn màu **OKLCH** của Tailwind v4:

### 1. Bảng màu Dark Mode (Giao diện mặc định & Trọng tâm)
*   **Base Background (`--background`):** `oklch(0.08 0.005 240)` - Màu đen Obsidian sâu thẳm, giảm thiểu ánh sáng xanh, tạo cảm giác huyền bí.
*   **Card/Surface (`--card`):** `oklch(0.12 0.008 240 / 0.7)` - Slate tối pha chút sắc xanh chàm huyền ảo, kết hợp hiệu ứng kính mờ `backdrop-blur-md`.
*   **Primary/Gold Accent (`--primary` & `--accent`):** `oklch(0.78 0.09 75)` - Vàng cát Vanguard (Brushed Gold / Champagne Gold), dùng cho các chi tiết VIP, viền nhấn, tiêu đề quan trọng và nút bấm chính.
*   **Borders (`--border`):** `oklch(1 0 0 / 8%)` - Đường viền mỏng như sợi chỉ, mang sắc thái bạch kim nhạt.
*   **Active Bid Glow (`--chart-2` / Glow):** `oklch(0.65 0.18 140)` - Màu xanh ngọc lục bảo phát sáng nhẹ, thể hiện trạng thái đấu giá đang hoạt động tích cực.

### 2. Bảng màu Light Mode (Giao diện thay thế)
*   **Base Background (`--background`):** `oklch(0.98 0.003 60)` - Trắng ngà ấm (Titanium Alabaster / Ivory), không gây chói mắt.
*   **Card/Surface (`--card`):** `oklch(1 0 0)` - Trắng tinh khiết với bóng đổ mịn màng (ultra-soft shadow).
*   **Primary Accent (`--primary`):** `oklch(0.20 0.01 240)` - Đen than đá (Charcoal Obsidian), tạo độ tương phản cực kỳ cao cho chữ và các nút hành động chính.
*   **Accent Color (`--accent`):** `oklch(0.72 0.08 75)` - Màu vàng đồng mờ sang trọng, thanh lịch.
*   **Borders (`--border`):** `oklch(0.90 0.005 240)` - Đường viền xám Titanium siêu nhẹ.

### 3. Phông chữ (Typography)
*   **Tiêu đề lớn & Con số (Headers / Numbers):** Sử dụng **Outfit** hoặc **Syne** (Google Fonts). Đường nét hình học sắc sảo giúp hiển thị giá tiền và tiêu đề cực kỳ quyền lực.
*   **Nội dung (Body Text):** Sử dụng **Inter** để hiển thị thông tin rõ ràng, sắc nét kể cả ở kích thước nhỏ.

---

## III. KIẾN TRÚC KỸ THUẬT & HẠ TẦNG THEME

### 1. Quản lý trạng thái Theme (Theme Context)
Chúng ta sẽ tạo ra một Provider mới tại `Frontend/src/contexts/ThemeContext.tsx` để:
*   Đọc trạng thái ban đầu từ `localStorage` (mặc định sẽ là `dark` để thể hiện đúng chất Vanguard Elite).
*   Lắng nghe thay đổi và thêm/bớt class `.dark` trên thẻ `<html>` của tài liệu.
*   Cung cấp hook `useTheme()` để các component con dễ dàng truy vấn và chuyển đổi theme.

### 2. Tinh chỉnh Tailwind CSS v4
Cập nhật config của Tailwind trong file `global.css` để định nghĩa rõ các utility class cần cho Vanguard:
*   `bg-glass`: Nền kính mờ khúc xạ ánh sáng.
*   `border-gold-gradient`: Đường viền chuyển sắc vàng kim sang trọng.
*   `shadow-gold-glow`: Hiệu ứng phát sáng vàng bao quanh thẻ.

---

## IV. BẢN THIẾT KẾ CHI TIẾT CHO CÁC COMPONENT CỐT LÕI

### 1. Thanh điều hướng (Navbar) & Chân trang (Footer)
*   **Navbar:**
    *   Sử dụng hiệu ứng sticky và `backdrop-blur-md` kết hợp màu nền mờ (`bg-background/80`).
    *   Tách biệt các danh mục bằng đường kẻ mỏng bạch kim.
    *   Tích hợp nút chuyển đổi Light/Dark mode dạng chuyển động trượt hoặc xoay tròn mặt trăng/mặt trời.
*   **Footer:**
    *   Bố cục tối giản, phân chia cột rõ ràng.
    *   Sử dụng icon kim loại mờ, hiệu ứng hover đổi sang sắc vàng kim ấm áp.

### 2. Thẻ hiển thị sản phẩm đấu giá (ProductCard.tsx)
*   **Khung thẻ:** Viền góc tròn nhỏ tinh tế (`rounded-lg`), hiệu ứng phóng to nhẹ (`scale-[1.01]`) và tăng cường độ mờ của kính khi hover.
*   **Đồng hồ đếm ngược (Countdown Timer):**
    *   Không dùng hộp màu đỏ lòe loẹt. Thay vào đó, dùng chữ màu vàng kim sáng hoặc xanh ngọc lục bảo mờ trên nền đen bóng, font chữ số mono sắc sảo.
*   **Nút Đặt giá nhanh (Quick Bid Button):**
    *   Thiết kế mỏng viền vàng, khi hover sẽ tự động lấp đầy bằng dải màu gradient vàng kim rực rỡ và phát sáng nhẹ.

### 3. Bảng điều khiển đấu giá (Bidding Panel ở Detail Product Page)
*   Giao diện buồng lái (Cockpit Panel):
    *   Khu vực nhập số tiền và nút đặt giá được bao bọc trong một khung kính mờ lớn, góc cạnh sắc nét.
    *   Hiển thị thông tin đấu giá cao nhất hiện tại (Current Bid) với kích thước chữ lớn, hiệu ứng nhịp thở nhẹ (pulse) khi có người trả giá mới.
*   Timeline lịch sử giá: Dùng các chấm tròn phát sáng kết nối với nhau bằng các đường kẻ đứt mảnh (dashed lines) mang phong cách công nghệ cao.

---

## V. CÁC HIỆU ỨNG MICRO-ANIMATIONS ĐẶC TRƯNG

1.  **Hiệu ứng Quét sáng (Shine Effect):**
    *   Khi rê chuột vào các thẻ sản phẩm VIP hoặc nút bấm quan trọng, một vệt sáng trắng mờ chéo qua bề mặt tạo cảm giác chất liệu kim loại được đánh bóng.
2.  **Đồng hồ nhấp nháy (Heartbeat Pulse):**
    *   Khi thời gian đấu giá còn dưới 5 phút, đồng hồ đếm ngược sẽ chuyển sang màu đỏ hổ phách và nhịp thở nhẹ để tăng tính khẩn trương một cách tinh tế.
3.  **Custom Scrollbars:**
    *   Thiết kế thanh cuộn siêu mảnh màu vàng/bạch kim mờ, ẩn đi khi không tương tác để giữ tính gọn gàng tối đa.

---

## VI. LỘ TRÌNH THỰC HIỆN STEP-BY-STEP

### Bước 1: Khởi tạo Hạ tầng Theme
*   Tạo file `ThemeContext.tsx` quản lý trạng thái.
*   Tích hợp Provider vào `main.tsx`.
*   Tạo nút Toggle Theme và đặt vào góc phải của `Navbar.tsx`.

### Bước 2: Cài đặt và Phân phối Font Chữ & Cấu hình CSS
*   Nhúng các font Outfit, Syne, Inter qua thẻ `@import` Google Fonts tại file `global.css`.
*   Định nghĩa toàn bộ biến màu OKLCH cho `.dark` và `:root`.

### Bước 3: Nâng cấp Toàn bộ Common Components
*   Tái cấu trúc `button.tsx`, `ProductCard.tsx`, `Navbar.tsx` và `Footer.tsx`.

### Bước 4: Refactor Trang Client
*   Áp dụng giao diện mới cho trang chủ, chi tiết sản phẩm, danh sách tìm kiếm và trang cá nhân.

### Bước 5: Kiểm thử và Tinh chỉnh
*   Kiểm tra tính tương phản màu sắc của Light và Dark Mode đảm bảo tiêu chuẩn WCAG (độ tương phản tốt cho mắt).
*   Tối ưu hóa hiệu năng render các hiệu ứng chuyển động mượt mà ở tần số quét cao (60Hz - 120Hz).
