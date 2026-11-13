#!/usr/bin/env bash
# Test command: node scripts/verify.mjs
set -e

echo "=== Umoja prototype verification ==="
node scripts/verify.mjs
echo "=== Verification complete ==="
