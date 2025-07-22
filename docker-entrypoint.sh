#!/bin/sh

set -e

# Check if VITE_API_SERVER is set
if [ -z "$VITE_API_SERVER" ]; then
  echo "❌ VITE_API_SERVER is not set. Exiting."
  exit 1
fi

echo "✅ Building UI with VITE_API_SERVER=$VITE_API_SERVER"
pnpm build

echo "🚀 Starting preview server..."
exec pnpm preview --host
