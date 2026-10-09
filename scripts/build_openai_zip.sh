#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
version="$(node -p 'require("./plugins/morvs/.codex-plugin/plugin.json").version')"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid plugin version: $version" >&2
  exit 1
fi

mkdir -p dist
archive="dist/morvs-plugin-${version}.zip"
find plugins/morvs -type f \
  ! -name '.DS_Store' ! -name 'Thumbs.db' ! -name 'desktop.ini' \
  ! -path '*/__MACOSX/*' -print | LC_ALL=C sort | zip -q -X -FS "$archive" -@

echo "$archive"
unzip -Z1 "$archive"
echo "Size: $(wc -c < "$archive" | tr -d '[:space:]') bytes"
