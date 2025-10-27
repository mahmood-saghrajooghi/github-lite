#!/bin/bash
# Test script for Phase 2 implementation

echo "🧪 Testing Phase 2: Data Transformation Layer"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test files (escaped for JSON)
OLD_CONTENT='function hello() { console.log(\"Hello\"); }'
NEW_CONTENT='function hello() { console.log(\"Hello, World!\"); }'

echo "📝 Test Input:"
echo "Old: function hello() { console.log(\"Hello\"); }"
echo "New: function hello() { console.log(\"Hello, World!\"); }"
echo ""

# Test 1: Check difftastic status
echo "Test 1: Checking difftastic installation..."
STATUS_RESPONSE=$(curl -s http://localhost:3001/api/difftastic/status)
if echo "$STATUS_RESPONSE" | grep -q '"installed":true'; then
    echo -e "${GREEN}✓${NC} Difftastic is installed"
else
    echo -e "${RED}✗${NC} Difftastic not installed"
    echo "Response: $STATUS_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Process a diff
echo "Test 2: Processing diff..."
# Use jq to properly construct JSON payload
RESPONSE=$(curl -s -X POST http://localhost:3001/api/difftastic \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg old "$OLD_CONTENT" \
    --arg new "$NEW_CONTENT" \
    '{oldContent: $old, newContent: $new, oldPath: "test.ts", newPath: "test.ts"}')")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓${NC} Diff processed successfully"
    echo ""
    echo "📊 Response structure:"
    echo "$RESPONSE" | jq '.'
else
    echo -e "${RED}✗${NC} Failed to process diff"
    echo "Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 3: Verify response structure
echo "Test 3: Verifying response structure..."
HAS_CHUNKS=$(echo "$RESPONSE" | jq '.diff.chunks | length > 0')
HAS_LANGUAGE=$(echo "$RESPONSE" | jq '.diff.language != null')
HAS_STATUS=$(echo "$RESPONSE" | jq '.diff.status != null')

if [ "$HAS_CHUNKS" = "true" ] && [ "$HAS_LANGUAGE" = "true" ] && [ "$HAS_STATUS" = "true" ]; then
    echo -e "${GREEN}✓${NC} Response structure is valid"
    echo "  - Chunks: $(echo "$RESPONSE" | jq '.diff.chunks | length')"
    echo "  - Language: $(echo "$RESPONSE" | jq -r '.diff.language')"
    echo "  - Status: $(echo "$RESPONSE" | jq -r '.diff.status')"
else
    echo -e "${RED}✗${NC} Response structure is invalid"
    exit 1
fi
echo ""

echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Phase 2 implementation is working correctly."
echo "Next: Implement Phase 3 - Rendering Layer"
