# Splitwise MVP Backend

A RESTful API backend for a Splitwise-like expense sharing application.

## Features Implemented

### Users
- ✅ Create account with email & password
- ✅ Login (simulated - user ID in request)
- ✅ Set default currency
- ✅ View profile
- ✅ Update email and currency
- ✅ Delete account

### Expenses
- ✅ Add expense (name, amount, currency, members, date)
- ✅ View expenses with filters (current month, last month, custom range)
- ✅ View single expense
- ✅ Update expense
- ✅ Delete expense

### Balances
- ✅ View balances with all users
- ✅ View balance with specific user
- ✅ Settle balances
- ✅ Monthly email report (API endpoint)

## Tech Stack

- Node.js
- Express.js
- Sequelize ORM
- SQLite/MySQL
- Nodemailer (for emails)

## Installation

1. Clone the repository
```bash
git clone <https://github.com/vikash380771/splitwise-backend-api.git>`
cd splitwise-backend
Install dependencies

bash
npm install
Create .env file

bash
cp .env.example .env
# Edit .env with your configuration
Start the server

bash
# Development
npm run dev

# Production
npm start