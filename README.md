# [Car Rental System Backend (PostgreSQL + JWT)](https://brindle-goal-102.notion.site/Car-Rental-System-Backend-PostgreSQL-JWT-2a846b36b2e980009dbac0ebe0e9b9a7)

## Objective

Build a backend for a **Car Rental System** using **Express**, **PostgreSQL**, and **JWT authentication**.

This assignment focuses on:

- Database modeling
- JWT authentication
- Authorization & ownership checks
- Clean API contracts
- Proper error handling
- Test-driven development readiness

---

## Tech Stack

- Node.js + Express
- PostgreSQL
- JWT (JSON Web Token)
- bcrypt (recommended)

---

## Database Schema

### `users` table will have below fields

```sql
  id
  username
  password
  created_at
```

### `bookings` table will have below fields

```sql
  id
  user_id
  car_name
  days
  rent_per_day
  status  // ('booked', 'completed', 'cancelled')
  created_at
```

- Nothing above can be null

---

## ERROR Rules

```json
{
success:false,
error:"bleh"
}
```

## JWT Rules

- JWT is issued **only on login**
- JWT payload:

```json
{
"userId":1,
"username":"rahul"
}
```

- Token must be sent in header:

```
Authorization: Bearer <JWT_TOKEN>
```

- All `/bookings` routes are **protected**

---

## Middleware: `authMiddleware`

### Responsibilities

1. Read `Authorization` header
2. Validate token
3. Attach user info to request

```jsx
req.user = {
userId:1,
username:"rahul"
};
```

### Middleware Errors

| Status | Error |
| --- | --- |
| 401 | Authorization header missing |
| 401 | Token missing after `Bearer` |
| 401 | Token invalid |

---

# Routes

---

## 1. POST `/auth/signup`

### Description

Create a new user

### Request Body

```json
{
"username":"rahul",
"password":"123"
}
```

### Success Response — `201`

```json
{
success: true
data: {
"message":"User created successfully",
"userId":1
}
}
```

### Edge Cases & Errors

| Status | Error |
| --- | --- |
| 400 | invalid inputs |
| 409 | username already exists |

---

## 2. POST `/auth/login`

### Description

Authenticate user and issue JWT

### Request Body

```json
{
"username":"rahul",
"password":"123"
}
```

### Success Response — `200`

```json
{
success: true,
data: {
"message":"Login successful",
"token":"<jwt_token>"
}
}
```

### Edge Cases & Errors

| Status | Error |
| --- | --- |
| 400 | invalid inputs |
| 401 | user does not exist |
| 401 | incorrect password |

---

## 3. POST `/bookings`

### Description

Create a booking only for the loggedin user

### Request Body

```json
{
"carName":"Honda City",
"days":3,
"rentPerDay":1500
}
```

### Success Response — `201`

```json
{
success: true
data: {
"message":"Booking created successfully",
"bookingId":101,
"totalCost":4500
}
}
```

### Business Rules

- `status` is always `"booked"` on creation
- `totalCost = days × rentPerDay`
- days should be less than 365 else “invalid inputs” error with 400
- rent per day cannot be more than 2000 else same as above

### Edge Cases & Errors

| Status | Error |
| --- | --- |
| 400 | invalid inputs |

---

## 4. GET `/bookings`

### Description

Fetch bookings only for logged in user

### Query Parameters

- `bookingId` → fetch single booking
- `summary=true` → fetch booking summary

---

### Normal Response — `200`

```json
{
success: true
data: [
{
"id":101,
"car_name":"Honda City",
"days":3,
"rent_per_day":1500,
"status":"booked",
"totalCost":4500
}
]
}
```

---

### Summary Response — `200`

```json
{
success: true
data: {
"userId":1,
"username":"rahul",
"totalBookings":3,
"totalAmountSpent":6300
}
}
```

### Rules

- Count only `booked` and `completed`
- Ignore `cancelled`

### Edge Cases & Errors

| Status | Error |
| --- | --- |
| 404 | bookingId not found |

---

## 5. PUT `/bookings/:bookingId`

### Description

Update booking details or status

(Only **owner** can update)

---

### Request Body (Update Details)

```json
{
"carName":"Verna",
"days":4,
"rentPerDay":1600
}
```

### OR (Update Status Only)

```json
{
"status":"completed"
}
```

---

### Success Response — `200`

```json
{
success: true,
data: {
"message":"Booking updated successfully",
"booking":{
"id":101,
"car_name":"Verna",
"days":4,
"rent_per_day":1600,
"status":"completed",
"totalCost":6400
}
}
}
```

### Edge Cases & Errors

| Status | Error |
| --- | --- |
| 403 | booking does not belong to user |
| 404 | booking not found |
| 400 | invalid inputs |

---

## 6. DELETE `/bookings/:bookingId`

### Description

Delete a booking owned by the logged-in user

### Success Response — `200`

```json
{
success: true,
data: {
"message":"Booking deleted successfully"
}
}
```

### Edge Cases & Errors

| Status | Error |
| --- | --- |
| 403 | booking does not belong to user |
| 404 | booking not found |