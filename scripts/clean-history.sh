#!/usr/bin/env bash
set -euo pipefail

LEAKED_KEY="REDACTED_GEMINI_API_KEY"
REPLACEMENT="REDACTED_GEMINI_API_KEY"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
cd "$REPO_ROOT"

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "✗ 未安装 git-filter-repo" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "! 工作区有未提交改动，继续执行将丢弃这些改动"
fi

CURRENT_HITS="$(git log --all -S "$LEAKED_KEY" --oneline | wc -l | tr -d ' ')"
if [[ "$CURRENT_HITS" -eq 0 ]]; then
  echo "✓ 历史中未发现该 Key"
  exit 0
fi

echo "⚠  发现 $CURRENT_HITS 个提交包含泄露的 Key:"
git log --all -S "$LEAKED_KEY" --oneline | head -10
echo ""

BACKUP_BRANCH="backup/pre-filter-$(date +%Y%m%d-%H%M%S)"
echo "→ 创建备份分支: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"

REPLACEMENTS_FILE="$(mktemp)"
trap 'rm -f "$REPLACEMENTS_FILE"' EXIT
printf '%s==>%s\n' "$LEAKED_KEY" "$REPLACEMENT" > "$REPLACEMENTS_FILE"

echo "→ 重写 git 历史..."
git filter-repo --replace-text "$REPLACEMENTS_FILE" --force

echo "→ 过期 reflog 并 gc..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

REMAINING="$(git log --all -S "$LEAKED_KEY" --oneline | wc -l | tr -d ' ')"
if [[ "$REMAINING" -eq 0 ]]; then
  echo "✓ 历史中已无泄露 Key"
else
  echo "✗ 仍有 $REMAINING 处残留" >&2
  exit 1
fi
