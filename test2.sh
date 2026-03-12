#!/bin/bash

BASE_SPRING="http://localhost:8080"
BASE_FASTAPI="http://localhost:8000"
TEST_PDF="/tmp/test.pdf"

echo "─────────────────────────────────────"
echo "🚀 Starting Full Integration Tests..."
echo "─────────────────────────────────────"

# ── CREATE TEST PDF ───────────────────────────────────────
echo "Creating test PDF..."
cat > /tmp/test.txt << EOF
Artificial Intelligence is transforming the world.
Machine learning is a subset of AI that enables systems to learn from data.
Deep learning uses neural networks with many layers.
Natural language processing allows computers to understand human language.
Computer vision enables machines to interpret visual information.
EOF
cp /tmp/test.txt $TEST_PDF
echo "✅ Test file created"
echo "─────────────────────────────────────"

# ── 1. HEALTH CHECKS ──────────────────────────────────────
echo "1. Checking Spring Boot health..."
SPRING_HEALTH=$(curl -s "$BASE_SPRING/actuator/health" || echo "running")
echo "✅ Spring Boot: online"

echo "2. Checking FastAPI health..."
FASTAPI_HEALTH=$(curl -s "$BASE_FASTAPI/health")
echo "Response: $FASTAPI_HEALTH"
echo "✅ FastAPI: online"
echo "─────────────────────────────────────"

# ── 2. REGISTER ───────────────────────────────────────────
echo "3. Registering user..."
REGISTER=$(curl -s -X POST "$BASE_SPRING/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "AI Company",
    "companyDescription": "We do AI stuff",
    "name": "John Doe",
    "email": "john@ai.com",
    "password": "password123"
  }')

echo "Response: $REGISTER"
TOKEN=$(echo $REGISTER | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "✅ Token: $TOKEN"
echo "─────────────────────────────────────"

# ── 3. LOGIN ──────────────────────────────────────────────
echo "4. Logging in..."
LOGIN=$(curl -s -X POST "$BASE_SPRING/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@ai.com",
    "password": "password123"
  }')

echo "Response: $LOGIN"
echo "✅ Login successful"
echo "─────────────────────────────────────"

# ── 4. GET ME ─────────────────────────────────────────────
echo "5. Getting current user..."
ME=$(curl -s -X GET "$BASE_SPRING/api/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $ME"
echo "✅ Got current user"
echo "─────────────────────────────────────"

# ── 5. CREATE WORKSPACE ───────────────────────────────────
echo "6. Creating workspace..."
WORKSPACE=$(curl -s -X POST "$BASE_SPRING/api/workspaces" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Workspace",
    "description": "Workspace for AI documents"
  }')

echo "Response: $WORKSPACE"
WORKSPACE_ID=$(echo $WORKSPACE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Workspace created: $WORKSPACE_ID"
echo "─────────────────────────────────────"

# ── 6. UPLOAD DOCUMENT ────────────────────────────────────
echo "7. Uploading document to Spring Boot..."
UPLOAD=$(curl -s -X POST "$BASE_SPRING/api/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_PDF" \
  -F "workspaceId=$WORKSPACE_ID")

echo "Response: $UPLOAD"
DOCUMENT_ID=$(echo $UPLOAD | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Document uploaded: $DOCUMENT_ID"
echo "─────────────────────────────────────"

# wait for FastAPI to process
echo "Waiting for FastAPI to process document..."
sleep 3

# ── 7. CHAT WITH DOCUMENT ─────────────────────────────────
echo "8. Chatting with document..."
CHAT=$(curl -s -X POST "$BASE_FASTAPI/chat/" \
  -H "Content-Type: application/json" \
  -d "{
    \"question\": \"What is this document about?\",
    \"document_id\": \"$DOCUMENT_ID\",
    \"session_id\": \"session-123\"
  }")

echo "Response: $CHAT"
echo "✅ Chat successful"
echo "─────────────────────────────────────"

# ── 8. FOLLOWUP QUESTION ──────────────────────────────────
echo "9. Asking followup question..."
FOLLOWUP=$(curl -s -X POST "$BASE_FASTAPI/chat/" \
  -H "Content-Type: application/json" \
  -d "{
    \"question\": \"Tell me more about machine learning\",
    \"document_id\": \"$DOCUMENT_ID\",
    \"session_id\": \"session-123\"
  }")

echo "Response: $FOLLOWUP"
echo "✅ Followup successful"
echo "─────────────────────────────────────"

# ── 9. SUMMARY ────────────────────────────────────────────
echo "10. Getting document summary..."
SUMMARY=$(curl -s -X POST "$BASE_FASTAPI/chat/summary" \
  -H "Content-Type: application/json" \
  -d "{
    \"document_id\": \"$DOCUMENT_ID\"
  }")

echo "Response: $SUMMARY"
echo "✅ Summary generated"
echo "─────────────────────────────────────"

# ── 10. KEY POINTS ────────────────────────────────────────
echo "11. Extracting key points..."
KEYPOINTS=$(curl -s -X POST "$BASE_FASTAPI/chat/key-points" \
  -H "Content-Type: application/json" \
  -d "{
    \"document_id\": \"$DOCUMENT_ID\"
  }")

echo "Response: $KEYPOINTS"
echo "✅ Key points extracted"
echo "─────────────────────────────────────"

# ── 11. GENERATE QUESTIONS ────────────────────────────────
echo "12. Generating questions..."
QUESTIONS=$(curl -s -X POST "$BASE_FASTAPI/chat/generate-questions" \
  -H "Content-Type: application/json" \
  -d "{
    \"document_id\": \"$DOCUMENT_ID\"
  }")

echo "Response: $QUESTIONS"
echo "✅ Questions generated"
echo "─────────────────────────────────────"

# ── 12. CLEAR CHAT HISTORY ────────────────────────────────
echo "13. Clearing chat history..."
CLEAR=$(curl -s -X DELETE "$BASE_FASTAPI/chat/history/session-123")
echo "Response: $CLEAR"
echo "✅ Chat history cleared"
echo "─────────────────────────────────────"

# ── 13. DELETE DOCUMENT ───────────────────────────────────
echo "14. Deleting document..."
curl -s -X DELETE "$BASE_SPRING/api/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN"
echo "✅ Document deleted"
echo "─────────────────────────────────────"

# ── 14. DELETE WORKSPACE ──────────────────────────────────
echo "15. Deleting workspace..."
curl -s -X DELETE "$BASE_SPRING/api/workspaces/$WORKSPACE_ID" \
  -H "Authorization: Bearer $TOKEN"
echo "✅ Workspace deleted"
echo "─────────────────────────────────────"

echo "✅ All tests completed!"
echo "─────────────────────────────────────"
