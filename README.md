📚 Library Management System – Backend API
A RESTful backend for managing books, members, and borrowing activities in a library. Built with Node.js, Express.js, and MongoDB.
---
🛠 Tech Stack
Layer	Technology
Runtime	Node.js (v18+)
Framework	Express.js
Database	MongoDB + Mongoose
Authentication	JWT (JSON Web Token)
Password Hashing	bcrypt
Validation	express-validator
---
📁 Project Structure
```
library-management-system/
│
├── config/
│   └── db.js                  # MongoDB connection
│
├── controllers/
│   ├── authController.js      # Register & Login logic
│   ├── bookController.js      # Book CRUD + Borrow/Return
│   └── memberController.js    # Member management
│
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   ├── roleMiddleware.js      # Role-based access control
│   └── errorMiddleware.js     # Global error handler
│
├── models/
│   ├── User.js                # User schema (member & librarian)
│   ├── Book.js                # Book schema
│   └── Borrow.js              # Borrow record schema
│
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── bookRoutes.js          # /api/books
│   └── memberRoutes.js        # /api/members
│
├── validators/
│   └── validationRules.js     # All validation rules
│
├── .env.example               # Environment variable template
├── .gitignore
├── package.json
├── server.js                  # App entry point
└── README.md
```
---
⚙️ Installation & Setup
1. Clone the repository
```bash
git clone https://github.com/your-username/library-management-system.git
cd library-management-system
```
2. Install dependencies
```bash
npm install
```
3. Configure environment variables
Copy the example file and fill in your values:
```bash
cp .env.example .env
```
Edit `.env`:
```
PORT=5000
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/library-db
JWT_SECRET=your_super_secret_jwt_key_here
```
4. Add a Librarian to the Database
Since librarians cannot register via the API, insert one directly using MongoDB Compass or the MongoDB shell:
```js
db.users.insertOne({
  name: "Admin Librarian",
  email: "librarian@library.com",
  password: "<bcrypt-hashed-password>",
  role: "librarian",
  createdAt: new Date(),
  updatedAt: new Date()
})
```
> **Tip:** Use [bcrypt-generator.com](https://bcrypt-generator.com) to generate a hashed password for testing, or run a quick script:
> ```js
> const bcrypt = require('bcrypt');
> console.log(await bcrypt.hash('yourpassword', 10));
> ```
5. Run the server
Development:
```bash
npm run dev
```
Production:
```bash
npm start
```
Server runs at: `http://localhost:5000`
---
🗄️ Database Design
User Collection
Field	Type	Description
_id	ObjectId	Auto-generated
name	String	Full name
email	String	Unique email
password	String	Hashed password
role	String	`member` or `librarian`
createdAt	Date	Auto-generated
Book Collection
Field	Type	Description
_id	ObjectId	Auto-generated
title	String	Book title
author	String	Author name
isbn	String	Unique ISBN
category	String	Genre/category
quantity	Number	Total copies
availableQuantity	Number	Available copies
createdAt	Date	Auto-generated
Borrow Collection
Field	Type	Description
_id	ObjectId	Auto-generated
memberId	ObjectId	Reference to User
bookId	ObjectId	Reference to Book
borrowDate	Date	When borrowed
returnDate	Date	When returned (null if active)
status	String	`borrowed` or `returned`
---
🔐 Authentication Flow
```
Register → POST /api/auth/register  →  JWT not required
Login    → POST /api/auth/login     →  Returns JWT token
All other routes require: Authorization: Bearer <token>
```
---
📡 API Endpoints
Auth
Method	Endpoint	Access	Description
POST	`/api/auth/register`	Public	Register a new member
POST	`/api/auth/login`	Public	Login and receive JWT
---
Books
Method	Endpoint	Access	Description
GET	`/api/books`	All authenticated	Get all books (search + filter + pagination)
GET	`/api/books/:id`	All authenticated	Get a book by ID
POST	`/api/books`	Librarian	Add a new book
PUT	`/api/books/:id`	Librarian	Update a book
DELETE	`/api/books/:id`	Librarian	Delete a book
POST	`/api/books/:id/borrow`	Member	Borrow a book
POST	`/api/books/:id/return`	Member	Return a book
Bonus: Search, Filter & Pagination
```
GET /api/books?search=harry&category=Fiction&page=1&limit=10
```
Query Param	Description	Example
`search`	Search by title or author	`?search=harry`
`category`	Filter by category	`?category=Fiction`
`page`	Page number	`?page=2`
`limit`	Results per page	`?limit=5`
---
Members
Method	Endpoint	Access	Description
GET	`/api/members`	Librarian	Get all members
DELETE	`/api/members/:id`	Librarian	Delete a member
GET	`/api/members/me/books`	Member	Get my currently borrowed books
---
📋 Request & Response Examples
Register
POST `/api/auth/register`
```json
{
  "name": "Rohith Kumar",
  "email": "rohith@markanthony.com",
  "password": "password123"
}
```
Response 201:
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "id": "664abc...",
    "name": "Rohith Kumar",
    "email": "rohith@markanthony.com",
    "role": "member"
  }
}
```
---
Login
POST `/api/auth/login`
```json
{
  "email": "rohith@markanthony.com",
  "password": "password123"
}
```
Response 200:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "664abc...",
      "name": "Rohith Kumar",
      "email": "rohith@markanthony.com",
      "role": "member"
    }
  }
}
```
---
Add Book (Librarian)
POST `/api/books`  
Header: `Authorization: Bearer <token>`
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "category": "Programming",
  "quantity": 5,
  "availableQuantity": 5
}
```
---
Borrow Book (Member)
POST `/api/books/:id/borrow`  
Header: `Authorization: Bearer <token>`
Response 201:
```json
{
  "success": true,
  "message": "Book borrowed successfully.",
  "data": {
    "memberId": "664abc...",
    "bookId": "664xyz...",
    "borrowDate": "2024-06-01T10:00:00.000Z",
    "status": "borrowed"
  }
}
```
---
❌ Error Responses
```json
{ "success": false, "message": "Book is currently unavailable." }
{ "success": false, "message": "You already have this book borrowed. Please return it first." }
{ "success": false, "message": "Access denied. Librarians only." }
{ "success": false, "message": "Token is invalid or expired." }
{ "success": false, "message": "Email already exists. Please use a different email." }
```
---
✅ Authorization Rules
Action	Member	Librarian
Register / Login	✅	✅
View Books	✅	✅
Add / Edit / Delete Books	❌	✅
Borrow / Return Books	✅	❌
View All Members	❌	✅
Delete Members	❌	✅
View My Borrowed Books	✅	❌
---
🌟 Bonus Features
🔍 Search books by title or author: `?search=clean`
🏷️ Filter by category: `?category=Programming`
📄 Pagination: `?page=1&limit=10`
---
🚀 Deployment
The API is deployed on Render / Railway.
Live URL: `https://your-deployed-url.com`
Steps to deploy on Render:
Push code to GitHub
Go to render.com → New Web Service
Connect your GitHub repo
Set environment variables (`PORT`, `DATABASE_URL`, `JWT_SECRET`)
Set start command: `npm start`
Deploy!
---
🧪 API Testing
Use Postman to test all endpoints.
Postman Collection: [Link to your Postman collection export]
Testing Checklist
[ ] Register a new member
[ ] Login as member and librarian
[ ] Add, update, delete books (as librarian)
[ ] Borrow a book (as member)
[ ] Return a book (as member)
[ ] Try borrowing same book twice (should fail)
[ ] Try adding a book as member (should fail with 403)
[ ] Try borrowing as librarian (should fail with 403)
[ ] Test search, filter, pagination
---
👨‍💻 Author
Built for the Mark Anthony Backend Assignment — Library Management System.