#!/usr/bin/env bash
set -euo pipefail

kill_port() {
  lsof -ti tcp:$1 | xargs kill -9 2>/dev/null || true
}

# Always run from project root (the folder where this script lives)
cd "$(dirname "$0")"

kill_port 8000

./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8000
