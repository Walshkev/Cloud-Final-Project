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

# # 5 Delete student (teardown)
# print_section "5 Delete Student"
# DELETE_STUDENT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/users/$STUDENT_ID" \
#   -H "Authorization: Bearer $ADMIN_TOKEN")

# echo "Delete student status: $DELETE_STUDENT_RESPONSE"

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

# 7. Get courses (test pagination endpoint)
print_section "7 Get Courses (Pagination Test)"
GET_COURSES_RESPONSE=$(curl -s -X GET "$BASE_URL/courses?page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Courses response:"
echo "$GET_COURSES_RESPONSE"
echo

# 8. Get course by ID
print_section "8 Get Course By ID"
GET_COURSE_RESPONSE=$(curl -s -X GET "$BASE_URL/courses/$COURSE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Get course by ID response:"
echo "$GET_COURSE_RESPONSE"
echo

# 9. Update course (as admin)
print_section "9 Update Course"
UPDATE_COURSE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/courses/$COURSE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"subject\":\"CS\",\"number\":\"493\",\"title\":\"Cloud App Dev (Updated)\",\"term\":\"Fall 2025\",\"instructorId\":\"$INSTRUCTOR_USER_ID\"}")

echo "Update course response:"
echo "$UPDATE_COURSE_RESPONSE"
echo

# 10. Get course by ID again
print_section "10 Get Course By ID"
GET_COURSE_RESPONSE=$(curl -s -X GET "$BASE_URL/courses/$COURSE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Get course by ID response:"
echo "$GET_COURSE_RESPONSE"
echo

# 11. Add a student to the course
print_section "11 Add Student"
echo "DEBUG: STUDENT_ID is $STUDENT_ID"
echo "course ID is $COURSE_ID"
if [ -z "$STUDENT_ID" ]; then
  echo "ERROR: STUDENT_ID is empty. Skipping add student test."
else
  ADD_RESPONSE=$(curl -s -X POST "$BASE_URL/courses/$COURSE_ID/students" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"add\": [\"$STUDENT_ID\"], \"remove\": []}")

  echo "Add student response:"
  echo "$ADD_RESPONSE"
fi
echo

# 12. Get students in course
print_section "12 Get Students in Course"
GET_STUDENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/courses/$COURSE_ID/students" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Get students in course response:"
echo "$GET_STUDENTS_RESPONSE"
echo

# 13. Download course roster as CSV
print_section "13 Download Roster"
ROSTER_RESPONSE=$(curl -s -X GET "$BASE_URL/courses/$COURSE_ID/roster" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: text/csv")

echo "Roster CSV response:"
echo "$ROSTER_RESPONSE"
echo

# 14. Remove a student from the course
print_section "14 Remove Student"
REMOVE_RESPONSE=$(curl -s -X POST "$BASE_URL/courses/$COURSE_ID/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"add\": [], \"remove\": [\"$STUDENT_ID\"]}")

echo "Remove student response:"
echo "$REMOVE_RESPONSE"
echo

# 15. Get students in course
print_section "15 Get Students in Course"
GET_STUDENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/courses/$COURSE_ID/students" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Get students in course response:"
echo "$GET_STUDENTS_RESPONSE"
echo

# 16. Delete Course as Admin
print_section "16 Delete Course"
DELETE_COURSE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/courses/$COURSE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Delete course status: $DELETE_COURSE_RESPONSE"
echo

echo "All done."