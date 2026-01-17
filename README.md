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