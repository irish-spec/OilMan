#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to run setup" >&2
  exit 1
fi

echo "[setup] installing dependencies"
npm ci

echo "[setup] running lint"
npm run lint

echo "[setup] running tests"
npm run test

echo "[setup] complete"
