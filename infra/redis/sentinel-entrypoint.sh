#!/bin/sh
set -eu

config=/data/sentinel.conf
if [ ! -f "$config" ]; then
  master_name="${REDIS_SENTINEL_MASTER:-auction-primary}"
  master_host="${REDIS_SENTINEL_MASTER_HOST:-redis}"
  master_port="${REDIS_SENTINEL_MASTER_PORT:-6379}"
  master_ip="$(getent hosts "$master_host" | awk 'NR == 1 { print $1 }')"
  if [ -z "$master_ip" ]; then
    echo "Unable to resolve initial Redis primary: $master_host" >&2
    exit 1
  fi
  cat > "$config" <<EOF
port 26379
dir /data
sentinel resolve-hostnames no
sentinel announce-hostnames no
sentinel monitor ${master_name} ${master_ip} ${master_port} 2
sentinel down-after-milliseconds ${master_name} 5000
sentinel failover-timeout ${master_name} 30000
sentinel parallel-syncs ${master_name} 1
EOF
fi

exec redis-server "$config" --sentinel
