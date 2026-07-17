# Kế hoạch test coverage API Backend

## Trạng thái hiện tại

- Vitest và Supertest đã được cấu hình trong `Backend`.
- CI dùng PostgreSQL tách biệt (`online_auction_api_test`), chạy Prisma generate,
  validate và migrate trước test.
- `npm run test` chạy unit, integration và concurrency; `npm run test:coverage`
  tạo báo cáo text/LCOV và chặn coverage line dưới 80%.
- Coverage chỉ đo mã nghiệp vụ tại `src/modules/**/application` và
  `src/modules/**/domain`; route, controller, repository, config và Prisma client
  được bảo đảm bằng integration test thay vì tính vào ngưỡng.
- 76 route nghiệp vụ trong 9 module đều có route-contract integration test; hai
  endpoint hạ tầng `/health` và `/ready` cũng được kiểm tra riêng.
- Các lỗi phổ biến đã được kiểm tra theo ranh giới dùng chung: payload auth sai,
  thiếu/malformed token, sai role, URL/method không tồn tại, state order/category
  không hợp lệ và provider ngoài thất bại.
- Coverage hiện được xác minh ở mức trên 80%; xem con số chính xác trong output
  của `npm run test:coverage` hoặc artifact `backend-lcov` trên CI.

## Quy ước test

- Integration test chỉ chạy khi `DATABASE_URL` chứa `test`; dữ liệu được
  `TRUNCATE ... RESTART IDENTITY CASCADE` trước từng test. Không dùng seed/demo.
- Redis, Kafka và các provider ngoài là mock trong Vitest. Test không được mở kết
  nối thật đến email, OAuth, Cloudinary/upload hoặc chatbot.
- Mỗi API mới cần ít nhất một kịch bản thành công và một kịch bản lỗi (validation,
  authentication, authorization hoặc resource/state không hợp lệ), đồng thời giữ
  nguyên response envelope mà frontend đang dùng.
- Test đấu giá đồng thời phải dùng PostgreSQL thật. Bid bị rollback không được tạo
  lịch sử, đổi `price_owner_id`, tạo order hay ghi outbox event.

## Lệnh chạy

```powershell
cd Backend
npm run prisma:generate
npm run prisma:migrate:deploy
npm run test
npm run test:coverage
```

## Phạm vi test theo module

1. Accounts/session: route contract, validation phổ biến, JWT, CAPTCHA và refresh session.
2. Products, categories, profiles, users, settings, orders: route contract và các
   nhánh nghiệp vụ thường lỗi như phân trang, ownership, trạng thái và upload.
3. Admin: route contract cộng với thiếu token, sai role và admin hợp lệ trên router đã mount.
4. Bids: đặt giá, history, buy-now, cấm bidder và concurrency với PostgreSQL thật.
5. Khi thêm route vào frontend, ghi contract đầy đủ vào
   `docs/api-route-contracts.md` trước khi đổi API.
