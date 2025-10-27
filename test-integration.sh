#!/bin/bash
# Integration test for complete diff processing pipeline

echo "🧪 Integration Test: Complete Diff Pipeline"
echo "==========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test with a more complex example
OLD_CONTENT='function add(a, b) {
  return a + b;
}

function subtract(x, y) {
  return x - y;
}'

NEW_CONTENT='function add(a, b) {
  // Added documentation
  return a + b;
}

function multiply(x, y) {
  return x * y;
}'

echo "📝 Testing complex diff with:"
echo "  - Modified function (add)"
echo "  - Removed function (subtract)"
echo "  - Added function (multiply)"
echo ""

# Process the diff
echo "Processing diff..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/difftastic \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg old "$OLD_CONTENT" \
    --arg new "$NEW_CONTENT" \
    '{oldContent: $old, newContent: $new, oldPath: "math.ts", newPath: "math.ts"}')")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓${NC} Diff processed successfully"
    echo ""

    # Extract and display key metrics
    CHUNK_COUNT=$(echo "$RESPONSE" | jq '.diff.chunks | length')
    LANGUAGE=$(echo "$RESPONSE" | jq -r '.diff.language')
    STATUS=$(echo "$RESPONSE" | jq -r '.diff.status')

    echo "📊 Diff Metrics:"
    echo "  - Chunks: $CHUNK_COUNT"
    echo "  - Language: $LANGUAGE"
    echo "  - Status: $STATUS"
    echo ""

    # Count changes
    echo "🔍 Analyzing changes..."
    echo "$RESPONSE" | jq -r '.diff.chunks[][] |
      if .lhs and .rhs then
        "Modified: line " + (.lhs.line_number | tostring)
      elif .lhs then
        "Removed: line " + (.lhs.line_number | tostring)
      elif .rhs then
        "Added: line " + (.rhs.line_number | tostring)
      else
        "Unknown change"
      end' | head -10

    echo ""
    echo -e "${GREEN}✅ Integration test passed!${NC}"
else
    echo -e "${RED}✗${NC} Failed to process diff"
    echo "Response: $RESPONSE"
    exit 1
fi
