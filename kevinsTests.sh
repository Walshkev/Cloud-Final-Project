#!/bin/bash

# Configurable variables
BASE_URL="http://localhost:8080"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password"
INSTRUCTOR_EMAIL="instructor@example.com"
INSTRUCTOR_PASSWORD="password"
STUDENT_EMAIL="student@example.com"
STUDENT_PASSWORD="password"

# Helper function for section headers
print_section() {
  echo
  echo "==================== Test $1 ===================="
}

# 1. Login admin
print_section "1 Admin Login"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.token')
ADMIN_ID=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.user.id')
ADMIN_ROLE=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.user.role')

echo "Admin Token: $ADMIN_TOKEN"

# 2. Create instructor (must be done as admin)
print_section "2 Create Instructor"
CREATE_INSTRUCTOR_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"name\":\"Test Instructor\",\"email\":\"$INSTRUCTOR_EMAIL\",\"password\":\"$INSTRUCTOR_PASSWORD\",\"role\":\"instructor\"}")

INSTRUCTOR_ID=$(echo "$CREATE_INSTRUCTOR_RESPONSE" | jq -r '.id')
INSTRUCTOR_ROLE=$(echo "$CREATE_INSTRUCTOR_RESPONSE" | jq -r '.role')
echo "Instructor ID: $INSTRUCTOR_ID"
echo "Instructor Role: $INSTRUCTOR_ROLE"

# 2b. Login as instructor
print_section "2b Instructor Login"
INSTRUCTOR_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/users/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$INSTRUCTOR_EMAIL\",\"password\":\"$INSTRUCTOR_PASSWORD\"}")

INSTRUCTOR_TOKEN=$(echo "$INSTRUCTOR_LOGIN_RESPONSE" | jq -r '.token')
INSTRUCTOR_USER_ID=$(echo "$INSTRUCTOR_LOGIN_RESPONSE" | jq -r '.id')

echo "Instructor User ID: $INSTRUCTOR_USER_ID"
echo "Instructor Role (from login): $INSTRUCTOR_ROLE"

# 3. Create student
print_section "3 Create Student"
CREATE_STUDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Student\",\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\",\"role\":\"student\"}")

STUDENT_ID=$(echo "$CREATE_STUDENT_RESPONSE" | jq -r '.id')
STUDENT_ROLE=$(echo "$CREATE_STUDENT_RESPONSE" | jq -r '.role')
echo "Student ID: $STUDENT_ID"
echo "Student Role: $STUDENT_ROLE"

# 5 Delete student (teardown)
print_section "5 Delete Student"
DELETE_STUDENT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/users/$STUDENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Delete student status: $DELETE_STUDENT_RESPONSE"

# 6. Create course (as admin, assign instructor)
print_section "6 Create Course"

TMP_BODY=$(mktemp)
COURSE_STATUS=$(curl -s -o "$TMP_BODY" -w "%{http_code}" -X POST "$BASE_URL/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"subject\":\"CS\",\"number\":\"493\",\"title\":\"Cloud Application Development\",\"term\":\"Spring 2025\",\"instructorId\":\"$INSTRUCTOR_USER_ID\"}")

COURSE_BODY=$(cat "$TMP_BODY")
rm "$TMP_BODY"
COURSE_ID=$(echo "$COURSE_BODY" | jq -r '.id')

echo "Course creation status: $COURSE_STATUS"
echo "Course ID: $COURSE_ID"






echo
echo "All done."