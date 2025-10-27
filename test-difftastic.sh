#!/bin/bash

# Test script for difftastic API
# This script verifies that the difftastic API is working correctly

echo "🧪 Testing Difftastic API Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if difftastic is installed
echo "1. Checking difftastic installation..."
if command -v difft &> /dev/null; then
    VERSION=$(difft --version)
    echo -e "${GREEN}✓${NC} Difftastic is installed: $VERSION"
else
    echo -e "${RED}✗${NC} Difftastic is not installed"
    echo -e "${YELLOW}Install with: cargo install difftastic${NC}"
    exit 1
fi
echo ""

# 2. Check if API server is running
echo "2. Checking API server..."
if curl -s http://localhost:3001/health > /dev/null; then
    HEALTH=$(curl -s http://localhost:3001/health)
    echo -e "${GREEN}✓${NC} API server is running"
    echo "   Response: $HEALTH"
else
    echo -e "${RED}✗${NC} API server is not running"
    echo -e "${YELLOW}Start with: pnpm dev:api${NC}"
    exit 1
fi
echo ""

# 3. Check difftastic status endpoint
echo "3. Checking difftastic status endpoint..."
STATUS=$(curl -s http://localhost:3001/api/difftastic/status)
if echo "$STATUS" | grep -q '"installed":true'; then
    echo -e "${GREEN}✓${NC} Difftastic status endpoint working"
    echo "   Response: $STATUS"
else
    echo -e "${RED}✗${NC} Difftastic status endpoint not working properly"
    echo "   Response: $STATUS"
    exit 1
fi
echo ""

# 4. Test actual diff processing
echo "4. Testing diff processing..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/difftastic \
  -H "Content-Type: application/json" \
  -d '{
    "oldContent": "function hello() {\n  console.log(\"Hello\");\n}",
    "newContent": "function hello() {\n  console.log(\"Hello, World!\");\n}",
    "oldPath": "test.ts",
    "newPath": "test.ts",
    "language": "typescript"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓${NC} Diff processing working"
    echo "   (Response contains diff data)"
else
    echo -e "${RED}✗${NC} Diff processing failed"
    echo "   Response: $RESPONSE"
    exit 1
fi
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All tests passed! ✓${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Your difftastic API is ready to use!"
echo ""
echo "Next steps:"
echo "  1. Start both servers: pnpm dev"
echo "  2. See DIFFTASTIC_INTEGRATION_PLAN.md for Phase 2 implementation"
