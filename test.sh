#!/bin/bash

BASE_URL="http://localhost:8080"
echo "🚀 Starting API Tests..."
echo "─────────────────────────────────────"

# ── 1. REGISTER ───────────────────────────────────────────
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "companyDescription": "Test Description",
    "name": "John Doe",
    "email": "john@test.com",
    "password": "password123"
  }')

echo "Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
COMPANY_ID=$(echo $REGISTER_RESPONSE | grep -o '"companyName":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Token: $TOKEN"
echo "─────────────────────────────────────"

# ── 2. LOGIN ──────────────────────────────────────────────
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"
echo "✅ Login successful"
echo "─────────────────────────────────────"

# ── 3. GET CURRENT USER ───────────────────────────────────
echo "3. Getting current user..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $ME_RESPONSE"
echo "✅ Got current user"
echo "─────────────────────────────────────"

# ── 4. GET ALL USERS ──────────────────────────────────────
echo "4. Getting all users in company..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/users" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $USERS_RESPONSE"
echo "✅ Got all users"
echo "─────────────────────────────────────"

# ── 5. UPDATE USER ────────────────────────────────────────
echo "5. Updating current user..."
UPDATE_USER_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated"
  }')

echo "Response: $UPDATE_USER_RESPONSE"
echo "✅ User updated"
echo "─────────────────────────────────────"

# ── 6. GET COMPANY ────────────────────────────────────────
echo "6. Getting company..."
COMPANY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/companies/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $COMPANY_RESPONSE"
COMPANY_ID=$(echo $COMPANY_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Got company: $COMPANY_ID"
echo "─────────────────────────────────────"

# ── 7. UPDATE COMPANY ─────────────────────────────────────
echo "7. Updating company..."
UPDATE_COMPANY_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/companies/$COMPANY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company",
    "description": "Updated Description"
  }')

echo "Response: $UPDATE_COMPANY_RESPONSE"
echo "✅ Company updated"
echo "─────────────────────────────────────"

# ── 8. CREATE WORKSPACE ───────────────────────────────────
echo "8. Creating workspace..."
WORKSPACE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/workspaces" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workspace",
    "description": "Test Workspace Description"
  }')

echo "Response: $WORKSPACE_RESPONSE"
WORKSPACE_ID=$(echo $WORKSPACE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Workspace created: $WORKSPACE_ID"
echo "─────────────────────────────────────"

# ── 9. GET ALL WORKSPACES ─────────────────────────────────
echo "9. Getting all workspaces..."
WORKSPACES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/workspaces" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $WORKSPACES_RESPONSE"
echo "✅ Got all workspaces"
echo "─────────────────────────────────────"

# ── 10. GET WORKSPACE BY ID ───────────────────────────────
echo "10. Getting workspace by id..."
GET_WORKSPACE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/workspaces/$WORKSPACE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $GET_WORKSPACE_RESPONSE"
echo "✅ Got workspace"
echo "─────────────────────────────────────"

# ── 11. UPDATE WORKSPACE ──────────────────────────────────
echo "11. Updating workspace..."
UPDATE_WORKSPACE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/workspaces/$WORKSPACE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Workspace",
    "description": "Updated Description"
  }')

echo "Response: $UPDATE_WORKSPACE_RESPONSE"
echo "✅ Workspace updated"
echo "─────────────────────────────────────"

# ── 12. UPLOAD DOCUMENT ───────────────────────────────────
echo "12. Uploading document..."
echo "test content" > /tmp/test.txt
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.txt" \
  -F "workspaceId=$WORKSPACE_ID")

echo "Response: $UPLOAD_RESPONSE"
DOCUMENT_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Document uploaded: $DOCUMENT_ID"
echo "─────────────────────────────────────"

# ── 13. GET ALL DOCUMENTS ─────────────────────────────────
echo "13. Getting all documents..."
DOCUMENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/documents/workspace/$WORKSPACE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $DOCUMENTS_RESPONSE"
echo "✅ Got all documents"
echo "─────────────────────────────────────"

# ── 14. GET DOCUMENT BY ID ────────────────────────────────
echo "14. Getting document by id..."
GET_DOCUMENT_RESPONSE=$(curl -s -X GET "$BASE_URL/api/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $GET_DOCUMENT_RESPONSE"
echo "✅ Got document"
echo "─────────────────────────────────────"

# ── 15. UPDATE DOCUMENT STATUS ────────────────────────────
echo "15. Updating document status..."
UPDATE_STATUS_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/documents/$DOCUMENT_ID/status?status=READY" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $UPDATE_STATUS_RESPONSE"
echo "✅ Document status updated"
echo "─────────────────────────────────────"

# ── 16. DELETE DOCUMENT ───────────────────────────────────
echo "16. Deleting document..."
curl -s -X DELETE "$BASE_URL/api/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $TOKEN"
echo "✅ Document deleted"
echo "─────────────────────────────────────"

# ── 17. DELETE WORKSPACE ──────────────────────────────────
echo "17. Deleting workspace..."
curl -s -X DELETE "$BASE_URL/api/workspaces/$WORKSPACE_ID" \
  -H "Authorization: Bearer $TOKEN"
echo "✅ Workspace deleted"
echo "─────────────────────────────────────"

echo "─────────────────────────────────────"
echo "✅ All tests completed!"
echo "─────────────────────────────────────"
