# Kế Hoạch Nâng Cấp Hệ Thống Đấu Giá Trực Tuyến (Reflourish Online Auction)

Dự án này sẽ được nâng cấp toàn diện từ một ứng dụng Web Đấu giá cơ bản thành một hệ thống **Production-Ready** tối ưu, có kiến trúc phân tầng rõ ràng, áp dụng caching, message queue, AI và containerization. Đây sẽ là một dự án nổi bật trong CV để gây ấn tượng mạnh với nhà tuyển dụng.

---

## Các Thành Phần Chính Của Kế Hoạch

### 1. Backend Architecture Refactoring (Kiến Trúc Phân Tầng & Clean Code)
Tái cấu trúc Backend từ mô hình MVC thô (Controller truy cập trực tiếp Database qua Model chứa SQL raw) sang kiến trúc phân tầng rõ ràng:
`Routing -> Validation Middleware -> Controller -> Business Service -> Model/Repository -> DB`.

- **Middleware bắt lỗi tập trung**: Định nghĩa một global error middleware để bắt mọi ngoại lệ và trả về JSON định dạng chuẩn.
- **Custom App Errors**: Khai báo các lớp lỗi chuẩn hóa như `BadRequestError`, `UnauthorizedError`, `NotFoundError` kế thừa từ `Error` cơ bản.
- **Uniform Response Format**: Hàm helper trả về response chuẩn (`success`, `error`, `data`) để dễ dàng làm việc ở Frontend.
- **Service Layer**:
  - `auth.service.ts`: Xử lý xác thực, đăng ký, OTP.
  - `product.service.ts`: Xử lý logic truy vấn sản phẩm và caching.
  - `bid.service.ts`: Xử lý logic đấu giá dập tắt race condition (dùng transaction locking).
- **Socket.io Decoupling**: Đóng gói Socket.io thành một service riêng để phát/thu tín hiệu dễ dàng mà không bị circular dependency.

---

### 2. Redis Integration (Caching & Rate Limiting)
Tích hợp Redis nhằm giảm tải database cho các request đọc nhiều, đồng thời bảo vệ hệ thống khỏi spam request.

- **Redis Caching**:
  - Cache cây danh mục sản phẩm (Categories Tree).
  - Cache danh sách Top sản phẩm nổi bật (gần kết thúc, hot nhất, nhiều lượt bid nhất).
  - Cache chi tiết sản phẩm. Tự động xoá (invalidate) cache khi có người chơi đấu giá thành công để dữ liệu luôn chính xác.
- **Rate Limiting**:
  - Middleware giới hạn request dựa trên Redis.
  - Áp dụng giới hạn tần suất gửi OTP, đăng nhập và đặt giá đấu (`playBid`) để ngăn chặn spam bot phá hoại phiên đấu giá.

---

### 3. RabbitMQ Integration (Hàng Đợi Email Không Đồng Bộ)
Thay thế việc gửi email trực tiếp (gây block request API) bằng kiến trúc gửi không đồng bộ thông qua Message Broker.

- **Publisher-Consumer Pattern**:
  - Backend đóng vai trò Publisher gửi các tác vụ email dạng JSON vào RabbitMQ.
  - Xây dựng một Worker độc lập (Consumer) lắng nghe hàng đợi `email_queue` để thực thi gửi email qua Nodemailer.
- **Các tác vụ chuyển sang queue**:
  - Gửi OTP xác thực khi đăng ký.
  - Gửi mail thắng đấu giá (cho cả Winner và Seller).
  - Gửi mail cảnh báo bị vượt giá (Outbid) cho người trả giá cao nhất trước đó.

---

### 4. Chatbot AI Integration (Trợ Lý Đấu Giá Thông Minh)
Xây dựng một chatbot AI tích hợp trong hệ thống giúp tư vấn đấu giá, tra cứu sản phẩm nhanh và hỏi đáp điều khoản sử dụng.

- **Gemini API**: Kết nối với mô hình `gemini-1.5-flash` để trả lời nhanh.
- **Function Calling (Tool Use)**:
  - Định nghĩa công cụ `search_products(query)` để AI tự tìm sản phẩm trong database theo từ khoá hoặc khoảng giá.
  - Định nghĩa công cụ `get_product_detail(id)` để AI xem trạng thái chi tiết của sản phẩm.
  - Định nghĩa công cụ `get_auction_rules()` để trả lời các quy chế sử dụng.
- **Giao diện nổi (Floating UI)**: Thiết kế đẹp mắt góc phải màn hình, hỗ trợ markdown, gõ chữ real-time (typing status) và các nút bấm gợi ý câu hỏi nhanh.

---

### 5. Dockerization & Deployment (Docker Compose & Cấu hình Độc lập)
Đóng gói và triển khai ứng dụng linh hoạt nhờ phân tách môi trường bằng biến số môi trường (`.env`).

- **docker-compose.yml (Môi trường Local/Testing)**:
  - `postgres`: Cơ sở dữ liệu Postgres ảo cho local dev và test k6.
  - `redis`: Hỗ trợ cache và rate limit local.
  - `rabbitmq`: Quản lý hàng đợi gửi email ảo local.
- **Chiến thuật Switch môi trường bằng Biến Môi Trường (.env)**:
  - **Local Development & Test**: Cấu hình `.env` trỏ về các cổng của Docker Compose local (`localhost`).
  - **Production Deployment**: Không sử dụng Docker Compose. Thay vào đó, Backend khi deploy lên Render sẽ được cấu hình trực tiếp các biến môi trường trỏ đến các Cloud Service miễn phí/giá rẻ:
    - Database: **Neon.tech** hoặc **Supabase** (Free Tier Postgres).
    - Redis: **Upstash** (Free Tier Serverless Redis).
    - RabbitMQ: **CloudAMQP** (Gói Little Lemur miễn phí).
    - Frontend: Deploy lên **Vercel** hoặc **Netlify** kết nối trực tiếp API Backend qua domain Render.

---

### 6. Performance & Load Testing với k6 (Chiến thuật Kiểm thử Hiệu năng Local)
Đo đạc chỉ số chịu tải thực tế của tính năng Bidding dưới áp lực 10,000 lượt đặt giá liên tục bằng k6 tại local nhằm bảo vệ tài nguyên Cloud và hạn chế tối đa rác dữ liệu:

- **Chiến thuật kiểm thử local**:
  - Chạy backend kết nối với Database/Redis/RabbitMQ local thông qua Docker Compose nhằm loại bỏ trễ mạng internet và không làm quá tải gói Cloud miễn phí.
  - Tạo trước Token JWT giả lập ngoại tuyến (offline) thông qua một script Node.js để k6 giả lập các Virtual Users (VUs) đặt giá mà không bị chặn bởi lớp bảo mật Captcha.
- **Kịch bản Test chi tiết (Thư mục /PerformanceTests)**:
  - `bidding_stress_test.js`: k6 giả lập hàng trăm user đặt giá cùng lúc. Kiểm tra cơ chế khóa giao dịch (`FOR UPDATE`) phòng tránh Race Condition.
  * Phản hồi hợp lệ: Mã `200` (đặt giá thành công) hoặc `400` (giá thầu bị lỗi thời - đây là xử lý concurrency chuẩn).
  * Lỗi hệ thống: Mã `500` hoặc timeout (chứng minh xảy ra lỗi sập luồng/deadlock).
- **Dọn dẹp rác dữ liệu**:
  - Tận dụng vòng đời k6 (`setup` và `teardown`) để tự động khởi tạo sản phẩm đấu giá test trước khi stress test và xoá sạch nó cùng lịch sử bid liên quan sau khi test kết thúc.
  - Hoặc chạy lệnh reset Database nhanh sau mỗi lần chạy test: `docker compose down -v` để dọn sạch hoàn toàn các bản ghi rác.
