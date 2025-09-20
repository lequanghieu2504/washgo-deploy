#!/bin/bash

# Root-level start script for Railway
# This won't work well for multi-service apps, use separate deployments instead

echo "❌ This is a multi-service application"
echo "📋 Please deploy services separately:"
echo "   1. Deploy backend from ./Washgo directory"
echo "   2. Deploy frontend from ./washgo-Frontend directory"
echo ""
echo "📚 See DEPLOY_SEPARATELY.md for instructions"

exit 1