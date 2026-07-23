local stateKey = KEYS[1]
local maximaKey = KEYS[2]
local rankingKey = KEYS[3]
local rankMembersKey = KEYS[4]
local bansKey = KEYS[5]
local idempotencyKey = KEYS[6]
local rateKey = KEYS[7]
local deadlinesKey = KEYS[8]
local streamKey = KEYS[9]
local request = cjson.decode(ARGV[1])

local function fail(code, message, statusCode)
  return cjson.encode({ status = "error", code = code, message = message, statusCode = statusCode or 400 })
end

local function trim(value)
  local normalized = string.gsub(tostring(value or ""), "^0+", "")
  if normalized == "" then return "0" end
  return normalized
end

local function compare(left, right)
  left = trim(left)
  right = trim(right)
  if string.len(left) ~= string.len(right) then
    return string.len(left) < string.len(right) and -1 or 1
  end
  if left == right then return 0 end
  return left < right and -1 or 1
end

local function add(left, right)
  left = trim(left)
  right = trim(right)
  local carry = 0
  local output = ""
  local li = string.len(left)
  local ri = string.len(right)
  while li > 0 or ri > 0 or carry > 0 do
    local ld = li > 0 and tonumber(string.sub(left, li, li)) or 0
    local rd = ri > 0 and tonumber(string.sub(right, ri, ri)) or 0
    local sum = ld + rd + carry
    output = tostring(sum % 10) .. output
    carry = math.floor(sum / 10)
    li = li - 1
    ri = ri - 1
  end
  return trim(output)
end

local function minimum(left, right)
  return compare(left, right) <= 0 and trim(left) or trim(right)
end

local function pad(value)
  value = trim(value)
  return string.rep("0", 19 - string.len(value)) .. value
end

local function rankMember(amount, bidderId)
  return pad(amount) .. ":" .. pad(bidderId)
end
local maxBigint = "9223372036854775807"

local expectedTypes = {
  { stateKey, "hash" }, { maximaKey, "hash" }, { rankingKey, "zset" },
  { rankMembersKey, "hash" }, { bansKey, "set" }, { idempotencyKey, "hash" },
  { rateKey, "string" }, { deadlinesKey, "zset" }, { streamKey, "stream" }
}
for _, expected in ipairs(expectedTypes) do
  local actual = redis.call("TYPE", expected[1]).ok
  if actual ~= "none" and actual ~= expected[2] then
    return fail("CORRUPT_REDIS_STATE", "Redis key has an unexpected type", 503)
  end
end

local fingerprint = request.fingerprint
local replay = redis.call("HGET", idempotencyKey, request.idempotencyKey)
if replay then
  local stored = cjson.decode(replay)
  if stored.fingerprint ~= fingerprint then
    return fail("IDEMPOTENCY_KEY_REUSED", "Idempotency key was used for another request", 409)
  end
  return stored.result
end

local function reject(code, message, statusCode)
  local result = fail(code, message, statusCode)
  redis.call("HSET", idempotencyKey, request.idempotencyKey, cjson.encode({ fingerprint = fingerprint, result = result }))
  redis.call("PEXPIRE", idempotencyKey, tonumber(request.idempotencyTtlMs))
  return result
end

if redis.call("EXISTS", stateKey) == 0 then
  return fail("AUCTION_STATE_NOT_READY", "Auction is not loaded into the bidding authority", 503)
end

local values = redis.call("HMGET", stateKey,
  "productId", "sellerId", "status", "startAtMs", "endAtMs", "startPriceVnd",
  "currentPriceVnd", "stepPriceVnd", "buyNowPriceVnd", "leaderId",
  "leaderMaxPriceVnd", "sequence", "version", "autoExtend",
  "antiSnipeWindowMs", "antiSnipeExtensionMs")
local productId = values[1]
local sellerId = values[2]
local status = values[3]
local startAtMs = tonumber(values[4])
local endAtMs = tonumber(values[5])
local startPrice = values[6]
local currentPrice = values[7]
local stepPrice = values[8]
local buyNowPrice = values[9]
local leaderId = values[10]
local leaderMax = values[11]
local sequence = values[12] or "0"
local version = values[13] or "0"
local autoExtend = values[14] == "1"
local antiSnipeWindowMs = tonumber(values[15] or "0")
local antiSnipeExtensionMs = tonumber(values[16] or "0")
local nowMs = tonumber(request.nowMs)

if not productId or not sellerId or not status or not startAtMs or not endAtMs or
   not startPrice or not currentPrice or not stepPrice or not nowMs then
  return fail("CORRUPT_REDIS_STATE", "Auction state is incomplete", 503)
end
if compare(sequence, maxBigint) >= 0 or compare(version, maxBigint) >= 0 then
  return fail("CORRUPT_REDIS_STATE", "Auction sequence or version is exhausted", 503)
end
if productId ~= tostring(request.productId) then
  return fail("CORRUPT_REDIS_STATE", "Auction identifier does not match its key", 503)
end

local operation = request.operation
local actorId = tostring(request.actorId)
local nextStatus = status
local nextLeaderId = leaderId
local nextLeaderMax = leaderMax
local nextPrice = currentPrice
local nextEndAtMs = endAtMs
local orderId = request.orderId
local eventType = nil
local banTargetId = request.targetUserId and tostring(request.targetUserId) or nil
local newRankMember = nil
local oldRankMember = nil

if operation == "BID" or operation == "BUY_NOW" then
  if status ~= "ACTIVE" or nowMs < startAtMs or nowMs >= endAtMs then
    return reject("AUCTION_NOT_ACTIVE", "Auction is not active", 409)
  end
  if actorId == sellerId then return reject("SELLER_CANNOT_BID", "Seller cannot bid on their own auction", 403) end
  if redis.call("SISMEMBER", bansKey, actorId) == 1 then
    return reject("BIDDER_BANNED", "Bidder is banned from this auction", 403)
  end
end

if operation == "BID" then
  local maximum = trim(request.amountVnd)
  local minimumBid = add(currentPrice, stepPrice)
  if compare(minimumBid, maxBigint) > 0 then
    return reject("MONEY_OVERFLOW", "No higher BIGINT bid can be represented", 409)
  end
  if compare(maximum, minimumBid) < 0 then
    return reject("BID_TOO_LOW", "Maximum bid does not meet the next bid step", 409)
  end
  local previousMaximum = redis.call("HGET", maximaKey, actorId)
  if previousMaximum and compare(maximum, previousMaximum) <= 0 then
    return reject("MAXIMUM_NOT_INCREASED", "Maximum bid must increase", 409)
  end
  if leaderId == false or leaderId == nil or leaderId == "" then
    nextLeaderId = actorId
    nextLeaderMax = maximum
  elseif leaderId == actorId then
    nextLeaderMax = maximum
  elseif compare(maximum, leaderMax) <= 0 then
    nextPrice = minimum(add(maximum, stepPrice), leaderMax)
  else
    nextPrice = minimum(add(leaderMax, stepPrice), maximum)
    nextLeaderId = actorId
    nextLeaderMax = maximum
  end
  oldRankMember = redis.call("HGET", rankMembersKey, actorId)
  newRankMember = rankMember(maximum, actorId)
  if autoExtend and antiSnipeWindowMs > 0 and antiSnipeExtensionMs > 0 and
     endAtMs - nowMs <= antiSnipeWindowMs then
    nextEndAtMs = endAtMs + antiSnipeExtensionMs
  end
  eventType = "BID_ACCEPTED"
elseif operation == "BUY_NOW" then
  if not buyNowPrice or buyNowPrice == "" then return reject("BUY_NOW_DISABLED", "Buy now is not available", 409) end
  if compare(request.amountVnd, buyNowPrice) < 0 then return reject("BUY_NOW_PRICE_MISMATCH", "Buy now amount is too low", 409) end
  nextStatus = "SOLD"
  nextLeaderId = actorId
  nextLeaderMax = buyNowPrice
  nextPrice = buyNowPrice
  nextEndAtMs = nowMs
  eventType = "BUY_NOW_COMPLETED"
elseif operation == "BAN" then
  if status ~= "ACTIVE" then return reject("AUCTION_NOT_ACTIVE", "Auction is not active", 409) end
  if actorId ~= sellerId and request.actorRole ~= "admin" then return reject("FORBIDDEN", "Only the seller or admin can ban", 403) end
  if not banTargetId then return reject("INVALID_TARGET", "A bidder is required", 400) end
  if banTargetId == sellerId then return reject("INVALID_TARGET", "Seller cannot be banned", 409) end
  if redis.call("SISMEMBER", bansKey, banTargetId) == 1 then return reject("ALREADY_BANNED", "Bidder is already banned", 409) end
  oldRankMember = redis.call("HGET", rankMembersKey, banTargetId)
  eventType = "BIDDER_BANNED"
elseif operation == "CLOSE" then
  if status ~= "ACTIVE" then return reject("AUCTION_NOT_ACTIVE", "Auction is not active", 409) end
  if nowMs < endAtMs then return reject("AUCTION_NOT_DUE", "Auction deadline has not passed", 409) end
  nextStatus = "ENDED"
  eventType = "AUCTION_CLOSED"
  if not leaderId or leaderId == "" then orderId = nil end
elseif operation == "CANCEL" then
  if status ~= "PENDING" and status ~= "ACTIVE" then return reject("AUCTION_NOT_CANCELLABLE", "Auction cannot be cancelled", 409) end
  if actorId ~= sellerId and request.actorRole ~= "admin" then return reject("FORBIDDEN", "Only the seller or admin can cancel", 403) end
  nextStatus = "CANCELLED"
  eventType = "AUCTION_CANCELLED"
else
  return reject("UNKNOWN_OPERATION", "Unknown auction mutation", 400)
end

local rate = redis.call("INCR", rateKey)
if rate == 1 then redis.call("PEXPIRE", rateKey, tonumber(request.rateWindowMs)) end
if rate > tonumber(request.rateLimit) then
  return reject("RATE_LIMITED", "Too many auction mutations", 429)
end

if operation == "BID" then
  if oldRankMember then redis.call("ZREM", rankingKey, oldRankMember) end
  redis.call("HSET", maximaKey, actorId, trim(request.amountVnd))
  redis.call("HSET", rankMembersKey, actorId, newRankMember)
  redis.call("ZADD", rankingKey, 0, newRankMember)
elseif operation == "BAN" then
  redis.call("SADD", bansKey, banTargetId)
  redis.call("HDEL", maximaKey, banTargetId)
  redis.call("HDEL", rankMembersKey, banTargetId)
  if oldRankMember then redis.call("ZREM", rankingKey, oldRankMember) end
  if leaderId == banTargetId then
    local top = redis.call("ZREVRANGE", rankingKey, 0, 1)
    if #top == 0 then
      nextLeaderId = ""
      nextLeaderMax = ""
      nextPrice = startPrice
    else
      nextLeaderId = trim(string.sub(top[1], 21))
      nextLeaderMax = trim(string.sub(top[1], 1, 19))
      if #top == 1 then
        nextPrice = startPrice
      else
        local secondMaximum = trim(string.sub(top[2], 1, 19))
        nextPrice = minimum(add(secondMaximum, stepPrice), nextLeaderMax)
      end
    end
  end
end

sequence = add(sequence, "1")
version = add(version, "1")
redis.call("HSET", stateKey,
  "status", nextStatus,
  "currentPriceVnd", nextPrice,
  "leaderId", nextLeaderId or "",
  "leaderMaxPriceVnd", nextLeaderMax or "",
  "endAtMs", tostring(nextEndAtMs),
  "sequence", sequence,
  "version", version)
if nextStatus == "ACTIVE" then
  redis.call("ZADD", deadlinesKey, nextEndAtMs, productId)
else
  redis.call("ZREM", deadlinesKey, productId)
end

local event = {
  eventId = request.eventId,
  correlationId = request.correlationId,
  idempotencyKey = request.idempotencyKey,
  schemaVersion = 1,
  type = eventType,
  productId = productId,
  actorId = actorId,
  requestedMaxPriceVnd = operation == "BID" and trim(request.amountVnd) or nil,
  targetUserId = banTargetId,
  currentPriceVnd = nextPrice,
  leaderId = nextLeaderId or "",
  leaderMaxPriceVnd = nextLeaderMax or "",
  endAtMs = tostring(nextEndAtMs),
  status = nextStatus,
  sequence = sequence,
  version = version,
  occurredAtMs = tostring(nowMs),
  orderId = orderId,
  reason = request.reason
}
local payload = cjson.encode(event)
redis.call("XADD", streamKey, "*", "event", payload)

local result = cjson.encode({
  status = "success",
  data = {
    event_id = request.eventId,
    product_id = productId,
    current_price = nextPrice,
    leader_id = nextLeaderId or cjson.null,
    end_time_ms = tostring(nextEndAtMs),
    sequence = sequence,
    version = version,
    order_id = orderId or cjson.null
  }
})
redis.call("HSET", idempotencyKey, request.idempotencyKey, cjson.encode({ fingerprint = fingerprint, result = result }))
redis.call("PEXPIRE", idempotencyKey, tonumber(request.idempotencyTtlMs))
return result
