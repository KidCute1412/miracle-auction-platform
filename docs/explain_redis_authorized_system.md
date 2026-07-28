# Giải thích hệ thống đấu giá Redis-authoritative

## 1. Tổng quan

Hệ thống đấu giá đã chuyển từ cơ chế PostgreSQL pessimistic locking sang một Redis-backed atomic state machine:

```text
API
  → Redis Lua: kiểm tra + quyết định + cập nhật state + XADD event
  → Redis Stream
  → PostgreSQL projector
  → PostgreSQL projection + transactional outbox
  → Kafka
  → notification, email, analytics và Socket.IO
```

Redis không còn chỉ là cache. Khi `BID_ENGINE=redis`, Redis là nguồn quyết định chính thức cho mọi mutation của một phiên đấu giá đang hoạt động. PostgreSQL là nơi lưu projection bền vững và phục vụ truy vấn.

Đây không đơn thuần là thay `SELECT ... FOR UPDATE` bằng một Redis lock. Hệ thống không acquire/release distributed lock. Thay vào đó, toàn bộ việc đọc state, kiểm tra luật, tính kết quả, cập nhật state và tạo event được thực hiện trong một Lua script nguyên tử.

## 2. Cơ chế PostgreSQL cũ

Trước đây, mỗi bid chạy trong một PostgreSQL transaction:

```text
BEGIN
  khóa idempotency key
  SELECT product ... FOR UPDATE
  kiểm tra luật đấu giá
  tính proxy bidding
  insert bidding_history
  update products
  insert outbox
COMMIT
```

`FOR UPDATE` bảo đảm mỗi sản phẩm chỉ có một transaction được sửa tại một thời điểm.

Ưu điểm:

- PostgreSQL là một nguồn sự thật duy nhất.
- API chỉ trả thành công sau khi dữ liệu đã commit.
- Mô hình phục hồi tương đối dễ hiểu.

Nhược điểm:

- Mọi bid cho cùng một sản phẩm phải chờ row lock.
- Các transaction đang chờ vẫn chiếm database connection.
- Hot auction tạo lock contention lớn.
- Latency tăng khi có nhiều người bid đồng thời.
- Database vừa phải quyết định nghiệp vụ vừa phải lưu lịch sử và side effect.

## 3. Redis Lua thay thế row lock như thế nào?

Khi `BID_ENGINE=redis`, application gửi một mutation command đến Redis:

```ts
redisAuctionAuthority.mutate({
  operation: "BID",
  productId,
  actorId,
  amountVnd,
  idempotencyKey,
  correlationId,
});
```

Redis chạy Lua script theo chuỗi bước:

```text
1. Đọc authoritative auction state
2. Kiểm tra mutation
3. Tính leader và current price mới
4. Cập nhật state
5. Tăng sequence/version
6. Lưu idempotency result
7. XADD event vào Redis Stream
8. Trả kết quả cho API
```

Redis thực thi Lua script như một thao tác nguyên tử: request khác không thể chen vào giữa các bước của script.

Giả sử hai bid đến gần như đồng thời:

```text
Bid A chạy Lua trước
  → đọc price = 100
  → cập nhật price = 120

Bid B chạy Lua sau
  → bắt buộc đọc price = 120
  → không thể quyết định dựa trên price = 100
```

Đây là linearization point của hệ thống: thứ tự thực thi Lua là thứ tự chính thức của các mutation.

Không có:

- `SETNX` để lấy lock.
- Lock timeout.
- Unlock.
- Process chết khi đang giữ lock.
- Database transaction chờ row lock.

Một hot auction vẫn phải được tuần tự hóa vì không thể có hai winner decision đồng thời. Điểm cải thiện là đoạn tuần tự hóa diễn ra hoàn toàn trong memory và rất ngắn.

## 4. Authoritative state trong Redis

Mỗi auction có một state hash gồm:

- Seller.
- Trạng thái auction.
- Thời gian bắt đầu và kết thúc.
- Start price, current price và step price.
- Buy-now price.
- Leader và maximum ẩn của leader.
- Sequence và version.
- Cấu hình anti-sniping.

Redis còn lưu:

- Hash maximum bid của từng bidder.
- Sorted set ranking.
- Set bidder bị cấm.
- Idempotency result.
- Rate-limit counter.
- Sorted set deadline.
- Redis Stream mutation results.

Sorted set ranking không dùng tiền làm floating-point score. Member được tạo theo dạng:

```text
<maximum được pad 19 chữ số>:<userId được pad 19 chữ số>
```

Cách này cho phép sắp xếp deterministic trong phạm vi PostgreSQL `BIGINT` mà không làm mất độ chính xác tiền.

## 5. Một state machine cho toàn bộ mutation

Nếu Redis là authority thì mọi mutation có thể thay đổi winner hoặc trạng thái auction phải đi qua Redis Lua:

- `BID`
- `BUY_NOW`
- `BAN`
- `CLOSE`
- `CANCEL`

Không thể để bid đi qua Redis nhưng buy-now hoặc close sửa PostgreSQL trực tiếp. Làm như vậy sẽ tạo hai authority và có thể sinh hai lịch sử mâu thuẫn.

### 5.1 BID

Lua kiểm tra:

- Auction đang `ACTIVE`.
- Thời điểm hiện tại nằm trong cửa sổ đấu giá.
- Bidder không phải seller.
- Bidder không bị ban.
- Maximum bid ít nhất bằng `currentPrice + stepPrice`.
- Maximum mới lớn hơn maximum trước đó của chính bidder.
- Phép tính không vượt PostgreSQL `BIGINT`.

Sau đó Lua tính proxy bidding:

- Chưa có leader: bidder trở thành leader.
- Leader tự tăng maximum: chỉ thay maximum ẩn.
- Bidder mới không vượt maximum leader: leader cũ vẫn thắng, giá hiển thị tăng vừa đủ.
- Bidder mới vượt leader: chuyển leader và tính giá vừa đủ thắng.

Nếu bid nằm trong anti-sniping window, Lua gia hạn deadline trong cùng mutation.

### 5.2 BUY_NOW

Lua:

- Kiểm tra auction còn active.
- Kiểm tra quyền tham gia.
- Kiểm tra buy-now được bật.
- Chuyển status thành `SOLD`.
- Đặt buyer làm leader.
- Đặt current price bằng buy-now price.
- Xóa auction khỏi deadline index.
- Dành trước một public order UUID.

### 5.3 BAN

Seller hoặc admin mới có quyền ban.

Lua:

- Thêm bidder vào ban set.
- Xóa maximum và ranking entry.
- Nếu bidder bị ban đang dẫn đầu, tính lại leader và current price từ ranking còn lại.

### 5.4 CLOSE

Close scheduler đọc auction đến hạn từ Redis sorted set rồi gọi mutation `CLOSE`.

- Chưa đến deadline: từ chối.
- Không có leader: chuyển `ENDED`, không tạo order.
- Có leader: chuyển `ENDED`, event chứa public order UUID.

Idempotency key của close gắn với product và deadline, nên retry không đóng auction hai lần.

### 5.5 CANCEL

Seller hoặc admin có thể hủy auction `PENDING` hoặc `ACTIVE`. Lua chuyển status sang `CANCELLED` và xóa auction khỏi deadline index.

## 6. Idempotency

Mọi mutation yêu cầu `Idempotency-Key`.

Fingerprint bao gồm:

- Operation.
- Auction.
- Actor.
- Amount.
- Target user.
- Reason.

Hai trường hợp:

```text
Cùng key + cùng fingerprint
→ trả lại chính xác kết quả cũ

Cùng key + fingerprint khác
→ từ chối IDEMPOTENCY_KEY_REUSED
```

Tác dụng:

- Client timeout rồi retry không tạo bid thứ hai.
- Buy-now retry không tạo hai order.
- Close job retry không tạo hai close event.
- Một logical request tạo tối đa một state transition và một Stream event.

## 7. Tiền phải là decimal string và BigInt

VND được biểu diễn như sau:

```text
API JSON: decimal string
Backend: bigint
PostgreSQL: BIGINT
Lua: decimal-string arithmetic
Frontend: BigInt
```

Ví dụ:

```json
{
  "max_price": "150000000"
}
```

JavaScript `number` chỉ biểu diễn chính xác integer đến `2^53 - 1`. Redis Lua number cũng không nên được dùng để tính tiền `BIGINT`. Vì vậy Lua tự so sánh, cộng và kiểm tra overflow trên decimal string.

## 8. Redis Stream thực chất là gì?

Redis Stream là một cấu trúc dữ liệu dạng append-only log:

```text
ID                  Payload
1721000000000-0     BID_ACCEPTED auction=42 sequence=1
1721000000001-0     BID_ACCEPTED auction=42 sequence=2
1721000000002-0     AUCTION_CLOSED auction=42 sequence=3
```

`XADD` nối một entry mới vào cuối Stream. Entry cũ không bị sửa.

Trong Lua, state mutation và `XADD` nằm trong cùng atomic execution. Vì vậy không thể có:

```text
Redis state đã đổi nhưng không có event
```

hoặc:

```text
Có event nhưng Redis state chưa đổi
```

Đây là lý do Stream phù hợp hơn việc application update Redis rồi publish sang một broker bằng một network call riêng.

## 9. Stream ID, sequence, version và event ID

Redis tự tạo Stream ID gần giống:

```text
<millisecond-time>-<counter>
```

Stream hiện chứa event của nhiều auction, nên Stream ID không phải thứ tự nghiệp vụ riêng của từng auction.

Ví dụ:

```text
Stream ID 100-0 → auction 42, sequence 1
Stream ID 101-0 → auction 99, sequence 1
Stream ID 102-0 → auction 42, sequence 2
```

Mỗi event vì vậy có thêm:

- Stream ID: vị trí vật lý trong Stream.
- `sequence`: thứ tự mutation trong một auction.
- `version`: chống snapshot cũ ghi đè snapshot mới.
- `event_id`: chống xử lý cùng event nhiều lần.

Projector chỉ nhận event kế tiếp khi:

```text
incoming.sequence == postgres.sequence + 1
incoming.version > postgres.version
```

Nhờ đó hệ thống phát hiện được event đảo thứ tự, event bị thiếu hoặc snapshot cũ.

## 10. Consumer group, PEL và ACK

Projector sử dụng consumer group:

```text
postgres-projector-v1
```

Redis giữ:

- `last-delivered-id`.
- Danh sách consumer.
- Pending Entries List, gọi tắt là PEL.

Projector đọc entry mới bằng logic tương đương:

```text
XREADGROUP GROUP postgres-projector-v1 consumer-A
STREAMS auction:v1:results >
```

Dấu `>` nghĩa là lấy entry mới chưa từng được giao cho group.

Redis thực hiện:

```text
1. Chọn entry mới
2. Giao cho consumer-A
3. Đưa entry vào PEL
4. Cập nhật last-delivered-id
```

Entry nằm trong PEL nghĩa là Redis đã giao event nhưng chưa biết consumer xử lý thành công hay chưa.

Sau khi PostgreSQL commit thành công, projector gọi:

```text
XACK stream group entry-id
```

`XACK` chỉ xóa tham chiếu khỏi PEL. Nó không xóa entry khỏi Stream. Entry chỉ biến mất khi hệ thống chủ động trim hoặc delete.

## 11. Projector ghi PostgreSQL như thế nào?

Mỗi Stream event được áp dụng trong một PostgreSQL transaction:

```text
BEGIN
  kiểm tra event_id đã xử lý chưa
  kiểm tra sequence/version
  insert immutable auction transition
  insert bidding history nếu là bid
  cập nhật ban nếu là ban
  tạo order nếu buy-now/close có winner
  update product snapshot
  insert processed event
  insert transactional outbox
COMMIT

emit Socket.IO
XACK Redis entry
```

PostgreSQL transaction bảo đảm không xuất hiện partial projection, ví dụ product đã cập nhật nhưng bid history chưa được ghi.

## 12. Nếu projector bị crash

### 12.1 Crash trước PostgreSQL commit

```text
Redis đã giao event
Event nằm trong PEL
PostgreSQL chưa thay đổi
Consumer chết
```

Consumer khác dùng `XAUTOCLAIM` để giành lại entry đã idle quá lâu rồi xử lý lại.

### 12.2 Crash sau PostgreSQL commit nhưng trước XACK

```text
PostgreSQL đã commit
Redis chưa nhận XACK
Consumer chết
```

Entry được giao lại. Projector tìm thấy `event_id` trong `auction_processed_events`, xác định đây là duplicate và ACK mà không ghi dữ liệu lần hai.

Mô hình thực tế là:

```text
at-least-once delivery
+
idempotent consumer
=
effectively-once database effect
```

Đây không phải exactly-once delivery. Event có thể được giao nhiều lần; application bảo đảm tác dụng database không bị lặp.

## 13. Tại sao không có transaction xuyên Redis và PostgreSQL?

Redis transaction và PostgreSQL transaction không có một commit chung:

```text
BEGIN
  update Redis
  update PostgreSQL
COMMIT cả hai
```

không tồn tại trong kiến trúc hiện tại.

Hệ thống chia thành:

```text
Transaction A — Redis Lua
  mutate authoritative state + append event

Transaction B — PostgreSQL projector
  apply event + write outbox
```

Redis Stream là chiếc cầu bền vững giữa hai transaction.

## 14. Redis Stream so với Kafka

Điểm giống:

- Cùng có mô hình append-only log.
- Event có vị trí.
- Consumer có thể đọc tuần tự.
- Event có thể được giữ lại để replay.
- Nhiều consumer group có thể đọc độc lập.

Điểm khác:

| Redis Stream | Kafka |
|---|---|
| Data structure bên trong Redis | Distributed event-log platform |
| Dữ liệu chính hoạt động trong memory | Log được tổ chức trên disk |
| Có PEL, `XACK`, `XAUTOCLAIM` | Consumer quản lý và commit offset |
| Không có partition tự nhiên trong một Stream | Topic được chia thành partition |
| Ordering trong một Stream | Ordering trong từng partition |
| Retention phải chủ động quản lý | Retention là khả năng cốt lõi |
| Scale phụ thuộc Redis topology | Scale ngang bằng partition và broker |
| Phù hợp pipeline nhỏ, latency thấp | Phù hợp event backbone và replay dài hạn |

Kafka không đánh dấu từng message là pending cho một consumer giống Redis. Consumer Kafka đọc log từ một offset và commit offset đã hoàn thành.

Trong hệ thống hiện tại:

```text
Redis Stream
  vận chuyển authoritative mutation
  từ Redis sang PostgreSQL

Kafka
  vận chuyển side effect sau PostgreSQL commit
  như notification, email và analytics
```

Kafka không quyết định winner. Kafka outage không làm mất bid vì transactional outbox trong PostgreSQL giữ side effect chờ retry.

## 15. Redis Stream so với RabbitMQ

Điểm giống:

- Có competing consumers.
- Consumer acknowledge sau khi xử lý.
- Message chưa ACK có thể được giao lại.
- Có thể xây retry và DLQ.

Điểm khác:

| Redis Stream | RabbitMQ queue |
|---|---|
| Log có lịch sử | Queue thiên về giao công việc |
| `XACK` không xóa Stream entry | Message thường rời queue sau ACK |
| Có thể replay bằng ID/range | Replay lịch sử không phải mô hình mặc định |
| Không có routing mạnh | Exchange, binding và routing key là core |
| DLQ được xây bằng Stream khác | Có dead-letter exchange/queue |
| Persistence dựa vào Redis AOF/RDB | Có queue durability, persistent message và publisher confirm |

Mô hình RabbitMQ phù hợp với:

```text
Hãy giao task này cho đúng một worker xử lý
```

Mô hình log phù hợp với:

```text
Hãy lưu chuỗi event theo thứ tự để consumer tiến qua và có thể replay
```

## 16. AOF thực sự hoạt động như thế nào?

Redis chủ yếu xử lý dữ liệu trong RAM. AOF, viết tắt của Append Only File, ghi lại các write operation để dựng lại dataset sau khi Redis restart.

Ví dụ:

```text
HSET auction:42 currentPrice 150
XADD auction:results * event ...
INCR auction:42:sequence
```

Khi restart, Redis replay AOF để dựng lại:

- Auction state.
- Ranking.
- Idempotency records.
- Deadline index.
- Stream entries.
- Consumer-group state.

Redis không dùng AOF làm nơi đọc chính trong lúc hoạt động. Luồng ghi là:

```text
Client command
  → Redis thay đổi dữ liệu trong RAM
  → append dữ liệu vào file/buffer
  → OS page cache
  → fsync
  → SSD/NVMe
```

## 17. `write()` và `fsync()`

Khi process ghi file, dữ liệu thường mới nằm trong page cache của hệ điều hành:

```text
Redis RAM
  → write
OS page cache
  → fsync
Storage device
```

Nếu Redis process crash nhưng host vẫn hoạt động, OS vẫn có thể flush page cache.

Nếu host mất điện trước `fsync`, dữ liệu trong page cache có thể mất.

`fsync()` yêu cầu hệ điều hành đẩy dữ liệu xuống storage bền vững trước khi hoàn thành.

## 18. Các chế độ AOF fsync

### 18.1 `appendfsync always`

```text
write command
→ append AOF
→ fsync
→ trả response
```

An toàn nhất nhưng tăng latency và giảm throughput vì write phải chờ disk.

### 18.2 `appendfsync everysec`

```text
write command
→ append/page cache
→ có thể trả response
→ background fsync khoảng mỗi giây
```

Đây là cấu hình hiện tại:

```yaml
--appendonly yes
--appendfsync everysec
```

Ưu điểm:

- Nhanh.
- Bid không phải chờ fsync riêng.
- Thông thường chỉ có cửa sổ mất dữ liệu khoảng một giây khi host chết đột ngột.

Nhược điểm:

```text
API có thể đã trả success
nhưng write chưa được fsync
```

Nếu host chết trong cửa sổ đó, một số mutation vừa được xác nhận có thể mất.

### 18.3 `appendfsync no`

Redis append nhưng để hệ điều hành tự quyết định lúc flush. Cấu hình này nhanh nhưng cửa sổ mất dữ liệu lớn và khó dự đoán hơn.

## 19. Atomicity không phải durability

Cần phân biệt:

```text
Lua atomicity ≠ disk durability
```

Lua atomicity nghĩa là request khác không thể nhìn thấy state nửa cũ nửa mới.

AOF durability nghĩa là sau restart Redis có dựng lại được state đó hay không.

Với cấu hình `everysec`, mutation có thể đã hoàn tất trong RAM và API đã trả thành công nhưng AOF chưa được fsync.

Để giảm rủi ro production cần:

- Redis replication.
- Automatic failover.
- Durable volume.
- Backup.
- Theo dõi AOF health.
- Xác định RPO/RTO rõ ràng.

## 20. AOF rewrite

AOF sẽ tăng dần vì nó chứa lịch sử write:

```text
HSET price 100
HSET price 110
HSET price 120
```

Trong khi state cuối chỉ cần `price = 120`.

Redis dùng AOF rewrite để tạo lại tập command tối thiểu có thể dựng state hiện tại:

```text
AOF cũ:
  nhiều write lịch sử

Base AOF mới:
  state tối thiểu

Incremental AOF:
  write xảy ra trong lúc rewrite
```

Từ Redis 7, AOF được tổ chức thành base file, incremental files và manifest. Rewrite rút gọn lịch sử command cần thiết để dựng dataset; nó không tự xóa các entry Stream vẫn còn tồn tại trong dataset.

## 21. Redis bị sập thì hệ thống làm gì?

Khi `BID_ENGINE=redis`, nếu Redis không khả dụng:

- Bid trả `503`.
- Buy-now trả `503`.
- Ban, close và cancel cũng không được thực hiện.
- Hệ thống không fallback sang PostgreSQL.

Không fallback là quyết định bắt buộc. Nếu Redis lỗi mà application ghi trực tiếp PostgreSQL, hệ thống sẽ có hai authority và không còn một thứ tự duy nhất để xác định winner.

Sau khi Redis restart:

- AOF được replay để dựng lại state và Stream.
- Projector tiếp tục xử lý entry chưa ACK.
- Entry bị consumer cũ giữ có thể được `XAUTOCLAIM`.
- Unique constraints và event ID ngăn duplicate projection.

Rủi ro còn lại:

- `everysec` có thể mất khoảng một giây mutation khi host chết.
- Nếu mất cả Redis state/AOF/replica, PostgreSQL có thể thiếu mutation chưa kịp project.
- Không được bootstrap mù quáng từ PostgreSQL nếu projection đang lag.

## 22. Eventual consistency

Ở cơ chế PostgreSQL cũ:

```text
API 200
⇒ PostgreSQL đã commit bid
```

Ở Redis engine:

```text
API 200
⇒ Redis đã chấp nhận mutation và tạo Stream event
⇒ PostgreSQL có thể chưa cập nhật
```

Trong khoảng thời gian projection lag:

- Product query từ PostgreSQL có thể trả current price cũ.
- Bid history có thể chưa thấy bid mới.
- Winner order có thể chưa được tạo.
- Socket.IO được phát sau projection commit nên có thể đến sau API response.

Đây là trade-off chính:

```text
latency thấp hơn + throughput cao hơn
đổi lấy
eventual consistency + vận hành phức tạp hơn
```

## 23. Winner order và quyền của client

Buy-now hoặc close mutation sinh public order UUID. Projector tạo order pending cho authoritative winner.

Client chỉ được hoàn thiện order đã tồn tại bằng `public_order_id`. Client không được gửi một `product_id`, tự khai winner hoặc tự khai price để tạo order.

Unique constraint bảo đảm:

- Một public order ID duy nhất.
- Tối đa một order cho mỗi auction.
- Retry không tạo duplicate order.

## 24. Bootstrap Redis

Khi server khởi động với Redis engine:

```text
1. Đọc các auction PENDING/ACTIVE từ PostgreSQL
2. Nạp auction snapshot
3. Nạp bidder maxima
4. Nạp ranking
5. Nạp ban set
6. Nạp deadline index
7. Khởi động projector
8. Khởi động close scheduler
```

Auction mới cũng được bootstrap sau khi tạo trong PostgreSQL.

Bootstrap chỉ an toàn khi PostgreSQL đại diện đúng checkpoint cần phục hồi. Nếu PostgreSQL đang lag so với Redis trước sự cố, dùng PostgreSQL để dựng lại Redis có thể làm mất accepted mutation chưa được project.

## 25. Các chế độ rollout

### `postgres`

Dùng implementation `FOR UPDATE` cũ. Đây là baseline benchmark và đường rollback.

### `redis`

Redis Lua là authority. PostgreSQL được cập nhật bất đồng bộ.

### `shadow`

PostgreSQL vẫn authoritative. Application chạy thêm reference model mô phỏng quyết định Lua và so sánh kết quả mà không mutate Redis auction state.

Shadow mode giúp phát hiện khác biệt về winner/current price trước khi chuyển authority.

## 26. Vì sao kiến trúc phù hợp với bidding?

### State quyết định nhỏ và bounded

Một bid chỉ cần current state, pricing rule, leader, bidder maxima, ban và deadline.

### Cần tuần tự hóa mạnh

Hai bid cho cùng auction phải có một thứ tự duy nhất. Lua cung cấp linearization point rõ ràng.

### Hot path cần latency thấp

Winner decision chạy trong memory, không chờ database row lock và nhiều query.

### Có thể tách decision khỏi side effect

Notification, email và analytics không cần tham gia vào quyết định bid.

### PostgreSQL vẫn giữ vai trò durable query store

Lịch sử, order và snapshot được lưu bằng transaction, unique constraint và outbox.

## 27. Những gì Redis Stream không tự giải quyết

Redis Stream không tự cung cấp data safety tuyệt đối hay exactly-once application semantics. Hệ thống vẫn phải triển khai:

- Producer idempotency.
- Consumer idempotency.
- Sequence/version fencing.
- PostgreSQL transaction.
- Retry classification.
- DLQ.
- Stream retention.
- Reconciliation.
- Projection-lag monitoring.
- Redis replication/failover.
- Backup.
- Capacity planning.

Nếu `XACK` trước PostgreSQL commit, event có thể mất projection.

Nếu thiếu unique `event_id`, redelivery có thể tạo duplicate.

Nếu trim Stream trước khi PostgreSQL bắt kịp, event có thể mất vĩnh viễn.

## 28. Các hạn chế cần chú ý trong implementation hiện tại

### 28.1 Retry và DLQ chưa phân loại lỗi đủ sâu

Projector hiện có thể tăng retry cho:

- PostgreSQL outage.
- Projection gap.
- Invalid event schema.

Đây là ba loại lỗi khác nhau:

- Infrastructure error: nên retry theo backoff dài hơn.
- Ordering gap: nên chờ sequence trước.
- Terminal schema/invariant error: phù hợp với DLQ.

Nếu không phân loại, một event hợp lệ có thể bị DLQ chỉ vì outage kéo dài hoặc xử lý lệch thứ tự.

### 28.2 Reconciliation chủ yếu mới phát hiện

Reconciliation có thể báo:

- `converged`
- `projection_lag`
- `diverged`

Nhưng cần thêm cơ chế tự động replay/repair và cảnh báo vận hành.

### 28.3 Stream retention cần checkpoint an toàn

Không trim thì Stream tăng mãi. Trim quá sớm thì mất khả năng replay. Chỉ nên trim sau durable projection checkpoint và một reconciliation window đã xác định.

### 28.4 Redis Cluster

Lua hiện thao tác đồng thời trên per-auction keys và các global key như:

- Deadline index.
- Results Stream.

Redis Cluster yêu cầu các key của một Lua script nằm cùng hash slot. Key hiện chưa được thiết kế bằng cluster hash tags, nên kiến trúc hiện tại phù hợp với một Redis authority endpoint có replication/failover hơn là bật sharding Redis Cluster trực tiếp.

## 29. Mô hình tinh thần

Có thể hình dung toàn hệ thống như sau:

```text
Redis Lua
= trọng tài quyết định ngay lập tức

Redis Stream
= sổ giao quyết định từ trọng tài sang bộ phận lưu trữ

Consumer group + PEL
= danh sách hồ sơ đã giao nhưng chưa xác nhận hoàn tất

PostgreSQL projector
= người chép quyết định vào sổ cái bền vững

Transactional outbox
= danh sách side effect chỉ được phát sau khi sổ cái commit

Kafka
= đường phân phối side effect ra các hệ thống khác

AOF
= nhật ký write dùng để dựng lại trí nhớ Redis sau restart

fsync
= ranh giới write đã thực sự xuống storage bền vững
```

Redis Stream phù hợp ở đây không đơn thuần vì nó nhanh. Điểm cốt lõi là Lua có thể nguyên tử hóa cả authoritative auction decision và việc ghi lại event cần project. Nếu state nằm trong Redis nhưng event được publish bằng một network call riêng sang Kafka hoặc RabbitMQ, hệ thống sẽ lại có failure window giữa hai thao tác và cần một cơ chế phối hợp phức tạp hơn.

