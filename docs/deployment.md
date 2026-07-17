# Kế hoạch deploy demo / portfolio

Mục tiêu: chi phí thấp, có Docker + AWS để thể hiện kỹ thuật, nhưng không cam kết uptime production vì dùng free tier.

## Deploy ở đâu?

| Thành phần | Nơi deploy | Lý do |
| --- | --- | --- |
| Frontend Vite | Vercel | Có CDN, HTTPS, deploy từ Git nhanh và miễn phí cho portfolio. |
| Backend API + Socket.IO | Một AWS EC2 Ubuntu | Cần tiến trình Node chạy liên tục cho API, cookie auth và Socket.IO. |
| Worker | Cùng EC2, container riêng | Xử lý event/đấu giá độc lập với API, không cần thuê thêm máy. |
| PostgreSQL | Supabase Free | Không phải tự vận hành database. |
| Redis | Upstash Redis Free | Có endpoint TLS, phù hợp cache/rate limit. |
| Kafka | Upstash Kafka Free | Không phải tự vận hành Kafka trên EC2 nhỏ. |

Luồng truy cập:

```text
Người dùng → app.example.com (Vercel)
Người dùng → api.example.com (EC2 + Nginx → API + Socket.IO)
API/Worker → Supabase + Upstash Redis + Upstash Kafka
```

## Checklist trước khi deploy

- [ ] Sửa Docker để build được JavaScript production. Hiện `tsconfig.json` đang có `noEmit: true` và Dockerfile chưa tạo `dist`, nên chưa thể chạy `node dist/server.js` / `node dist/worker.js`.
- [ ] Tách hai service Docker: `api` và `worker`; đặt `restart: unless-stopped`.
- [ ] Sửa backend lấy `PORT` từ biến môi trường.
- [ ] Sửa CORS của Express và Socket.IO dùng `CLIENT_URL=https://app.example.com`, không hard-code localhost và không dùng `*` khi có cookie.
- [ ] Cookie production phải có `Secure`, `HttpOnly`, `SameSite=Lax`; giữ `trust proxy` vì API đứng sau Nginx.
- [ ] Thống nhất Kafka theo code hiện tại: `KAFKA_USERNAME`, `KAFKA_PASSWORD`; topics `bidding_events`, `dashboard_updates`.
- [ ] Chạy kiểm tra: `npm run build` ở Backend, `npm run lint` + `npm run build` ở Frontend, `docker compose config`, `docker build Backend`.

## Cấu hình từng nơi

### 1. Supabase, Upstash

- [ ] Tạo Supabase project, chạy schema/seed; lấy `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- [ ] Tạo Upstash Redis; lấy `REDIS_URL` dạng `rediss://...`.
- [ ] Tạo Upstash Kafka và các topics cần thiết; lấy `KAFKA_BROKERS`, `KAFKA_USERNAME`, `KAFKA_PASSWORD`.
- [ ] Bật cảnh báo quota. Free tier chỉ dùng cho demo; Supabase có thể pause khi ít hoạt động.

### 2. AWS EC2

- [ ] Tạo Ubuntu EC2, thử `t3.micro` cho demo nhẹ; nếu API + worker thiếu RAM, nâng `t3.small`.
- [ ] Security group chỉ mở `80`, `443`; mở `22` cho IP của người deploy. Không public port `5000`, database, Redis hay Kafka.
- [ ] Cài Docker, Docker Compose plugin và Nginx.
- [ ] Trỏ `api.example.com` về EC2; Nginx proxy vào API container và bật WebSocket upgrade.
- [ ] Dùng Certbot cấp HTTPS cho `api.example.com`.
- [ ] Lưu `.env` chỉ trên EC2, không commit Git. Tạo AWS Budget alert ở $5 và $15.

Biến môi trường backend/worker cần có:

```text
NODE_ENV=production
PORT=5000
CLIENT_URL=https://app.example.com
JWT_SECRET, JWT_REFRESH_SECRET
DB_CLIENT=pg, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
REDIS_URL
KAFKA_BROKERS, KAFKA_USERNAME, KAFKA_PASSWORD
GMAIL_ADDRESS, GMAIL_APP_PASSWORD       # nếu bật email
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET  # nếu dùng upload
CAPTCHA_SECRET_KEY                       # nếu bật captcha
```

### 3. Vercel

- [ ] Import repository, chọn **Root Directory** là `Frontend`.
- [ ] Build command: `npm run build`; Output directory: `dist`.
- [ ] Gắn domain `app.example.com`.
- [ ] Khai báo:

```text
VITE_API_URL=https://api.example.com
VITE_PATH_ADMIN=admin
VITE_TINY_MCE=...             # chỉ public key
VITE_CAPTCHA_SITE_KEY=...     # chỉ site key public
VITE_GOOGLE_CLIENT_ID=...     # chỉ client ID public
```

- [ ] Không đặt secret trong `VITE_*`; giá trị này sẽ xuất hiện trong JavaScript của trình duyệt.
- [ ] Cập nhật OAuth redirect URI và reCAPTCHA allowed domain thành `app.example.com`.

## Kiểm tra sau deploy

- [ ] `https://api.example.com/health` trả `200`.
- [ ] `https://api.example.com/ready` báo database, Redis, Kafka đều sẵn sàng.
- [ ] Frontend gọi đúng `https://api.example.com`; Socket.IO kết nối WebSocket.
- [ ] Đăng nhập tạo cookie `Secure`, `HttpOnly`, `SameSite=Lax`.
- [ ] Test luồng: đăng nhập → xem sản phẩm → đặt giá → worker nhận event → kết quả mong đợi.
- [ ] Lưu image tag cũ và backup database trước migration để có thể rollback.

## Chi phí dự kiến (USD/tháng)

| Hạng mục | Khi còn AWS credit/free plan | Sau khi hết credit | Ghi chú |
| --- | ---: | ---: | --- |
| Vercel frontend | $0 | $0 | Trong giới hạn Hobby, dùng cho portfolio. |
| EC2 `t3.micro` | $0 nếu đủ credit | ~$8–10 | Phụ thuộc region. |
| EBS 10 GB | $0 nếu đủ credit | ~$1 | Phụ thuộc region. |
| Public IPv4 AWS | $0 nếu đủ credit | ~$3.60 | $0.005/giờ × khoảng 720 giờ. |
| Supabase / Upstash | $0 | $0 | Chỉ khi còn trong free quota. |
| Domain | ~$1–2 | ~$1–2 | Thường trả $12–24/năm. |
| **Tổng** | **~$1–2** | **~$14–17** | Có thể tăng nếu vượt quota, data transfer hoặc phải nâng EC2. |

Ghi chú: AWS credit/free tier chỉ có thời hạn; free tier của Supabase/Upstash cũng có quota. Theo dõi usage và không để server/IP không dùng vẫn chạy.
