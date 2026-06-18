# Hướng Dẫn Chạy Test Concurrency Đấu Giá Với k6

Thư mục này chứa kịch bản kiểm thử tải (Stress Test) và đồng thời (Concurrency Test) cho chức năng đặt giá đấu (`POST /api/bid/play`) để kiểm tra xem hệ thống có bị lag, sập hoặc sai sót dữ liệu khi có hàng nghìn lượt đặt giá hay không.

---

## Bước 1: Cài đặt k6 trên máy của bạn
k6 là một công cụ độc lập viết bằng Go, không chạy qua NodeJS. Bạn cần cài đặt k6 trên máy:
* **Windows (PowerShell):**
  ```powershell
  winget install k6
  ```
  *(Hoặc bạn có thể tải file `.msi` cài đặt từ trang chủ [k6.io](https://k6.io/docs/get-started/installation/))*
* **macOS:** `brew install k6`

---

## Bước 2: Tạo Token kiểm thử giả lập (Offline)
Vì API đấu giá yêu cầu xác thực JWT qua Cookie và có thể có lớp bảo mật Captcha ở môi trường thật, chúng ta sẽ tạo trước danh sách các token hợp lệ ngoại tuyến để truyền vào k6.

1. Di chuyển vào thư mục này (`PerformanceTests`):
   ```bash
   cd PerformanceTests
   ```
2. Đảm bảo bạn đã cài các thư viện bổ trợ ở thư mục Backend (hoặc cài tại đây):
   ```bash
   npm install jsonwebtoken dotenv
   ```
3. Chạy file tạo token:
   ```bash
   node generate_tokens.js
   ```
   Lệnh này sẽ tự động đọc `JWT_SECRET` từ file `.env` của Backend và tạo ra file `tokens.json`.

---

## Bước 3: Chạy Stress Test bằng k6
Mở Terminal/PowerShell tại thư mục `PerformanceTests` và chạy lệnh sau:

```bash
k6 run bidding_stress_test.js
```

k6 sẽ khởi chạy tối đa 100 người dùng ảo (`VUs`) liên tục ném các gói thầu với giá tăng dần vào cổng API `http://localhost:5000/api/bid/play` trong 25 giây.

---

## Bước 4: Đọc hiểu Kết Quả (Cách xem hệ thống có Lag hay Concurrency Tốt không?)

Sau khi k6 hoàn tất, bạn sẽ nhận được một bảng báo cáo các chỉ số trong terminal. Hãy quan tâm đến các thông số sau:

### 1. Hệ thống có bị LAG không?
Xem chỉ số **`http_req_duration`**:
* **`avg` (Average)**: Thời gian phản hồi trung bình của API. Nếu con số này dưới **100ms**, hệ thống chạy cực nhanh.
* **`p(95)` và `p(99)`**: Thời gian phản hồi của 95% và 99% người dùng. 
  * Nếu `p(95)` dưới **500ms**: Hệ thống hoàn toàn không lag dưới tải cao.
  * Nếu `p(95)` trên **2000ms (2 giây)**: Hệ thống đang bị nghẽn (lag). Nguyên nhân thường do Database bị lock dòng quá lâu vì cơ chế `FOR UPDATE` trong [bid.model.ts](file:///D:/HCMUS/Third%20Year/Ultra%20Web%20Skills/ReflourishedOnlineAuction/Online-Auction/Backend/src/models/bid.model.ts#L70-L75).

### 2. Có đảm bảo tính ĐỒNG THỜI (Concurrency) không?
Xem tỷ lệ lỗi của check **`is expected business response`** và **`is not 500 server error`**:
* **`400 Bad Request`**: Đây là phản hồi **hoàn toàn chính xác** về mặt nghiệp vụ khi chạy concurrency. Ví dụ: User A và User B cùng gửi giá $150k cùng một mili-giây. Người đến trước (A) được chấp nhận (trả về 200). Người đến sau (B) bị từ chối vì giá trị đặt thầu đã lỗi thời so với giá mới của A (trả về 400 - "Giá đặt không hợp lệ").
* **`500 Internal Server Error`**: Nếu có lỗi 500 xuất hiện, nghĩa là code Backend hoặc Database đang bị **Deadlock** (tranh chấp khoá) hoặc crash bộ nhớ. Bạn cần kiểm tra log của Express để debug lỗi tranh chấp luồng.
* **Kiểm tra Database sau khi test**:
  * Kiểm tra bảng `products` xem `current_price` của sản phẩm test có bằng đúng giá trị lớn nhất trong lịch sử đấu giá (`bids` / `bidding_history`) hay không.
  * Đảm bảo không có 2 dòng dữ liệu đấu giá nào có **cùng một mức giá thành công** trong bảng lịch sử. Nếu có, tức là cơ chế khoá transaction bị lỗi!
