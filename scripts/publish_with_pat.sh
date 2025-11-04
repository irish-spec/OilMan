#!/usr/bin/env bash
set -euo pipefail

GH_USERNAME="${GH_USERNAME:-<REPLACE_ME>}"
GITHUB_REPO_NAME="${GITHUB_REPO_NAME:-idle-oil-inc}"
GITHUB_PAT="${GITHUB_PAT:-<REPLACE_ME_IF_NOT_USING_gh>}"

if [[ "$GITHUB_PAT" == "<REPLACE_ME_IF_NOT_USING_gh>" ]]; then
  cat <<MSG
[publish] set the GITHUB_PAT env var to a classic token with repo scope before running this script.
Example:
  export GITHUB_PAT=ghp_yourtoken
MSG
  exit 1
fi

if [ ! -d .git ]; then
  git init
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "init idle-oil-inc"
fi

git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_PAT}@github.com/${GH_USERNAME}/${GITHUB_REPO_NAME}.git"

git branch -M main
git push -u origin main
