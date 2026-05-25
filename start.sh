#!/usr/bin/env bash
set -euo pipefail

# Java 21 is required — the project is compiled with Java 21.
# Explicitly set JAVA_HOME so this script works regardless of the system default JDK.
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home

kill_port() {
  lsof -ti tcp:$1 | xargs kill -9 2>/dev/null || true
}

# Always run from project root (the folder where this script lives)
cd "$(dirname "$0")"

kill_port 8000
kill_port 5173

# Start backend
./mvnw spring-boot:run &
BACKEND_PID=$!

# Start frontend
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"

# Wait — Ctrl+C stops both
wait
