# PG Management App Backend

This is the Node.js / Express / Prisma backend for the PG Management application.

## Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Update the `.env` file with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/pg_manager?schema=public"
   JWT_SECRET="your_jwt_secret"
   PORT=5000
   ```

3. **Database Setup**
   Push the schema to your database safely for development:
   ```bash
   npx prisma db push
   ```
   *Note: If you want to use migrations instead: `npx prisma migrate dev --name init`*

4. **Start the Server**
   ```bash
   npm run dev
   ```

## Available API Endpoints

### Authentication
- `POST /api/auth/register`: Register an owner
- `POST /api/auth/login`: Login to receive JWT

### Rooms & Beds
- `GET /api/rooms`: List rooms and beds
- `POST /api/rooms`: Create a room (auto-creates beds)
- `PUT /api/rooms/:id`: Update room details
- `DELETE /api/rooms/:id`: Delete a room (if vacant)

### Tenants
- `GET /api/tenants`: List all tenants
- `POST /api/tenants`: Add a tenant and map to a bed automatically
- `PUT /api/tenants/:id/vacate`: Vacate tenant, make bed available

### Payments & Expenses
- `GET /api/payments`: View payment history
- `POST /api/payments`: Record a payment
- `GET /api/expenses`: View all expenses
- `POST /api/expenses`: Record a new expense

### Maintenance
- `GET /api/maintenance`: View maintenance requests
- `POST /api/maintenance`: Create a maintenance request
- `PUT /api/maintenance/:id`: Update status to RESOLVED

### Dashboard Analytics
- `GET /api/reports/dashboard`: Fetch KPIs, total tenants, vacant beds, and revenue

## Automation (Cron Jobs)
The backend automatically runs a script every midnight:
1. **1st of the month**: Auto-generates `PENDING` rent payment records for all `ACTIVE` tenants.
2. **After the 5th**: Marks unpaid `PENDING` payments as `OVERDUE`.
