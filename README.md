# Splitwise Backend API

A backend API that allows users to split expenses and track balances between participants, similar to the Splitwise application.

This project is built using **Node.js, Express.js, Sequelize ORM, and SQLite**.

---

# Features

# Users
- ✅ Create account with email & password
- ✅ Login (simulated - user ID in request)
- ✅ Set default currency
- ✅ View profile
- ✅ Update email and currency
- ✅ Delete account

# Expenses
- ✅ Add expense (name, amount, currency, members, date)
- ✅ View expenses with filters (current month, last month, custom range)
- ✅ View single expense
- ✅ Update expense
- ✅ Delete expense

# Balances
- ✅ View balances with all users
- ✅ View balance with specific user
- ✅ Settle balances
- ✅ Monthly email report (API endpoint)

---

# Tech Stack

Backend:

* Node.js
* Express.js

Database:

* SQLite
* Sequelize ORM

Nodemailer (for emails)

API Testing:

* Postman

---

# Project Structure

```
splitwise-mvp
│
├── backend
│   ├── config        # Database configuration
│   ├── controllers   # API request handlers
│   ├── middleware    # Custom middleware
│   ├── models        # Sequelize models
│   ├── routes        # API routes
│   ├── services      # Business logic layer
│   ├── utils         # Helper functions
│   └── app.js        # Express app configuration
│
├── postman           # Postman API collection
│
├── server.js         # Application entry point
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---


# Installation

Clone the repository

```
git clone https://github.com/vikash380771/splitwise-backend-api.git
```

Navigate to project folder

```
cd splitwise-backend-api
```

Install dependencies

```
npm install
```

Start the server

```
node server.js
```

Server will run at:

```
http://localhost:3000
```

---

# API Endpoints

## User APIs

Create User

```
POST /api/users/register
```
Login User 
(Note: Authentication is simplified for this project. 
User authentication is simulated by passing the userId in requests instead of using JWT tokens.)

```
POST /api/users/login
```

Get User

```
GET /api/users/:userId
```

Update User

```
PUT /api/users/:userId
```

Delete User

```
DELETE /api/users/:userId
```

---

## Expense APIs

Add Expense

```
POST /api/expenses
```

Get Expenses

```
(single expense)
GET /api/expenses/:expenseId
(grouped by current month, last month & custom date range  )
GET /api/expenses/user/:userId?filter=current-month
GET /api/expenses/user/:userId?startDate=2024-01-01&endDate=2024-01-31

```

Update Expense

```
PUT /api/expenses/:expenseId
```

Delete Expense

```
DELETE /api/expenses/:expenseId
```

---

## Balance APIs

Get all balances for a user

```
GET /api/balances/user/:userId
```

Get balance between two users

```
GET /api/balances/:userId/with/:otherUserId
```

Settle balance

```
POST /api/balances/:userId/settle/:otherUserId
```

---

# API Testing

Import the Postman collection located in the **postman/splitwise-backend-api.postman_collection.json** .

Steps:

1. Open Postman
2. Click Import
3. Select the collection file
4. Start testing the APIs

---

# Environment Variables

Create a `.env` file and configure required variables.

Example:

```
NODE_ENV=development
PORT=3000

# Database
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# MySQL (disabled)
# DB_DIALECT=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=splitwise
# DB_USER=root
# DB_PASSWORD=password

# Email (for monthly reports)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=app_password
```

---

# Author

Vikash Bharti


