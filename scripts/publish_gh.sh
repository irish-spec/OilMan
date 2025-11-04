#!/usr/bin/env bash
set -euo pipefail

GH_USERNAME="${GH_USERNAME:-<REPLACE_ME>}"
GITHUB_REPO_NAME="${GITHUB_REPO_NAME:-idle-oil-inc}"

if ! command -v gh >/dev/null 2>&1; then
  cat <<INSTRUCTIONS
[publish] GitHub CLI (gh) is required for automatic publish.
Install gh and log in, or provide a personal access token and run scripts/publish_with_pat.sh instead.
INSTRUCTIONS
  exit 1
fi

if [ ! -d .git ]; then
  git init
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "init idle-oil-inc"
fi

gh repo create "${GH_USERNAME}/${GITHUB_REPO_NAME}" --public --source=. --remote=origin --push
