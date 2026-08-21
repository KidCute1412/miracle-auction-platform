local stateKey = KEYS[1]
local maximaKey = KEYS[2]
local rankingKey = KEYS[3]
local rankMembersKey = KEYS[4]
local bansKey = KEYS[5]
local deadlinesKey = KEYS[6]
local recoveryFenceKey = KEYS[7]
local seed = cjson.decode(ARGV[1])

if redis.call("EXISTS", recoveryFenceKey) == 1 and not seed.recovery then
  return redis.error_reply("AUCTION_AUTHORITY_RECOVERING")
end

if redis.call("EXISTS", stateKey) == 1 then return "EXISTS" end

local expectedTypes = {
  { maximaKey, "hash" },
  { rankingKey, "zset" },
  { rankMembersKey, "hash" },
  { bansKey, "set" },
  { deadlinesKey, "zset" },
}
for _, expected in ipairs(expectedTypes) do
  local actual = redis.call("TYPE", expected[1]).ok
  if actual ~= "none" and actual ~= expected[2] then
    return redis.error_reply("CORRUPT_BOOTSTRAP_TARGET")
  end
end

local stateArguments = {}
for field, value in pairs(seed.state) do
  table.insert(stateArguments, field)
  table.insert(stateArguments, value)
end
redis.call("HSET", stateKey, unpack(stateArguments))

for _, maximum in ipairs(seed.maxima) do
  redis.call("HSET", maximaKey, maximum.userId, maximum.amount)
  redis.call("HSET", rankMembersKey, maximum.userId, maximum.member)
  redis.call("ZADD", rankingKey, 0, maximum.member)
end
if #seed.bans > 0 then redis.call("SADD", bansKey, unpack(seed.bans)) end
if seed.deadlineScore then redis.call("ZADD", deadlinesKey, seed.deadlineScore, seed.productId) end
return "INITIALIZED"
