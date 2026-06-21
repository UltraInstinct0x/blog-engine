#!/bin/bash
# Build all blog hosts to their output directories.
set -euo pipefail

BLOG_SITE_DIR="/home/ubuntu/blog-site"
VAULT_BLOGS="/home/ubuntu/vault-write/blogs"
HOST="${1:-}"

echo "=== Building blog ==="
echo "Source: $VAULT_BLOGS"

cd "$BLOG_SITE_DIR"

npx @11ty/eleventy \
  --input="$VAULT_BLOGS" \
  --output="$BLOG_SITE_DIR/_site"

# Make output world-readable for nginx (runs as www-data)
chmod -R o+rX "$BLOG_SITE_DIR/_site"

POST_COUNT=$(find "$BLOG_SITE_DIR/_site" -name "index.html" -not -path "*/tags/*" -not -path "*/assets/*" | wc -l)
echo "=== Done: $POST_COUNT pages built ==="
