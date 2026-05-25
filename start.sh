#!/usr/bin/env bash
set -euo pipefail

# ── Check required tools are installed ───────────────────────────────────────
if ! command -v java &>/dev/null; then
  echo "ERROR: Java is not installed. Please install Java 21+"
  exit 1
fi

if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
  echo "ERROR: Node.js / npm is not installed. Please install Node.js (https://nodejs.org)"
  exit 1
fi

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

# ── Install frontend dependencies if node_modules is missing ─────────────────
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi

# ── Start backend ─────────────────────────────────────────────────────────────
echo "Starting backend on http://localhost:8000 ..."
./mvnw spring-boot:run &
BACKEND_PID=$!

# ── Start frontend ────────────────────────────────────────────────────────────
echo "Starting frontend on http://localhost:5173 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait — Ctrl+C stops both
wait
