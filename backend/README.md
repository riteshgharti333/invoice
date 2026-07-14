# 🚀 Node.js + TypeScript + Express + Prisma Backend Boilerplate

A production-ready backend starter with clean architecture, authentication, validation, centralized error handling, and modular structure.

---

# 📁 Project Structure

```
src/
├── app.ts
├── server.ts
│
├── config/
│   ├── env.ts
│   └── logger.ts
│
├── common/
│   ├── constants/
│   ├── errors/
│   ├── middleware/
│   ├── types/
│   └── utils/
│
├── database/
│   └── client.ts
│
├── modules/
│   ├── auth/
│   └── users/
│
└── routes/
    └── index.ts

prisma/
└── schema.prisma
```

---

# 🛠️ Tech Stack

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Zod
- JWT
- bcryptjs
- Winston
- Helmet
- CORS

---

# 📦 Install Dependencies

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file.

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

---

# ▶️ Run Development Server

```bash
npm run dev
```

---

# 🏗️ Build Project

```bash
npm run build
```

---

# 🚀 Start Production

```bash
npm run start
```

---

# 🗄️ Prisma

Generate Prisma Client:

```bash
npx prisma generate
```

Create migration:

```bash
npx prisma migrate dev --name init
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# 🏛️ Architecture

```
Request
   │
   ▼
Routes
   │
   ▼
Middleware
   │
   ▼
Validation
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
Prisma
   │
   ▼
Database
```

---

# 📂 Responsibilities

## Controller

- Handle HTTP request/response
- Call service
- Return standardized response

## Service

- Business logic
- Authentication
- Authorization rules
- Validation beyond schema

## Repository

- Database operations only
- Prisma queries only

## Middleware

- Authentication
- Authorization
- Validation
- Logging
- 404 handling

---

# 🔑 Authentication

JWT-based authentication.

Protected routes require:

```
Authorization: Bearer <token>
```

---

# 🔒 Password Security

Passwords are:

- Hashed with bcrypt
- Never stored in plain text
- Compared using utility functions

---

# ✅ Validation

Uses Zod schemas.

Validation occurs before controllers execute.

---

# ❌ Error Handling

Centralized `AppError` class.

Global `errorHandler` middleware handles all errors.

No repeated `try/catch` blocks in controllers.

---

# 📊 Standard API Response

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

# 🧱 Coding Principles

- Feature-based modules
- Thin controllers
- Business logic in services
- Database logic in repositories
- Shared utilities in `common/utils`
- Shared middleware in `common/middleware`
- Centralized configuration
- No duplicated logic

---

# 📌 Folder Rules

Create files only when needed.

Do NOT create empty placeholders.

Examples:

✅ Create `date.ts` only when needed.

✅ Create `openapi.ts` only when API documentation is added.

✅ Create `cron.ts` only when scheduled jobs are implemented.

---

# 📁 Current Modules

- Auth
- Users

Future modules can follow the same pattern:

```
modules/
└── feature/
    ├── feature.controller.ts
    ├── feature.service.ts
    ├── feature.repository.ts
    ├── feature.routes.ts
    ├── feature.validation.ts
    └── feature.types.ts
```

---

# 📜 Best Practices

- Use `HTTP_STATUS` constants instead of raw numbers.
- Use centralized `MESSAGES` constants.
- Use `asyncHandler` for async controllers.
- Use `apiResponse` for success responses.
- Throw `AppError` for operational errors.
- Keep `errorHandler` as the last middleware.
- Keep controllers small and focused.
- Never access Prisma directly from controllers.
- Never store plain-text passwords.
- Keep `Request` type augmentation in `express.d.ts`.

---

# 📈 Recommended Middleware Order

```
helmet
↓
cors
↓
express.json
↓
requestIdMiddleware
↓
requestLogger
↓
routes
↓
notFoundMiddleware
↓
errorHandler
```

---

# 🔄 Development Workflow

1. Create Prisma model.
2. Run migration.
3. Create module folder.
4. Add validation schema.
5. Implement repository.
6. Implement service.
7. Implement controller.
8. Add routes.
9. Protect routes with authentication/authorization if needed.
10. Test with Postman.