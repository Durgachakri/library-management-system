# 📚 Library Management System

A RESTful backend API for managing books, members, and borrowing activities in a library.

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

## 📁 Project Structure

```
library-management-system/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── bookController.js
│   └── memberController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   ├── Book.js
│   └── Borrow.js
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   └── memberRoutes.js
├── validators/
│   └── validationRules.js
├── .env.example
├── server.js
└── package.json
```

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Durgachakri/library-management-system.git
cd library-management-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
```
PORT=5000
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/library-db
JWT_SECRET=your_secret_key
```

### 4. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

## 🗄️ Database Setup

### Collections (Auto-created by Mongoose)
- `users` — stores members and librarians
- `books` — stores library books
- `borrows` — stores borrow records

### Add Librarian (Insert directly into MongoDB)
```bash
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  await mongoose.connection.collection('users').insertOne({
    name: 'Admin Librarian',
    email: 'librarian@library.com',
    password: hash,
    role: 'librarian',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('Librarian created!');
  mongoose.disconnect();
});
"
```

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <token>
```

Get token by logging in via `POST /api/auth/login`

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register as member |
| POST | `/api/auth/login` | Public | Login and get token |

### Books
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/books` | All users | Get all books |
| GET | `/api/books/:id` | All users | Get book by ID |
| POST | `/api/books` | Librarian | Add new book |
| PUT | `/api/books/:id` | Librarian | Update book |
| DELETE | `/api/books/:id` | Librarian | Delete book |
| POST | `/api/books/:id/borrow` | Member | Borrow a book |
| POST | `/api/books/:id/return` | Member | Return a book |

### Members
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/members` | Librarian | Get all members |
| DELETE | `/api/members/:id` | Librarian | Delete a member |
| GET | `/api/members/me/books` | Member | My borrowed books |

### Bonus Features
```
GET /api/books?search=clean        # Search by title or author
GET /api/books?category=Programming # Filter by category
GET /api/books?page=1&limit=10     # Pagination
```

## 🔒 Authorization Rules

| Action | Member | Librarian |
|--------|--------|-----------|
| Register / Login | ✅ | ✅ |
| View Books | ✅ | ✅ |
| Add / Edit / Delete Books | ❌ | ✅ |
| Borrow / Return Books | ✅ | ❌ |
| View All Members | ❌ | ✅ |
| Delete Members | ❌ | ✅ |
| My Borrowed Books | ✅ | ❌ |

## ❌ Error Response Format

```json
{
  "success": false,
  "message": "Book is currently unavailable."
}
```

## ✅ Success Response Format

```json
{
  "success": true,
  "message": "Book borrowed successfully.",
  "data": {}
}
```

## 🚀 Deployment

- **Platform:** Render
- **Live URL:** https://library-management-system-g4gz.onrender.com

## 📌 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |

## 👨‍💻 Author

**Durga Chakri**
GitHub: [@Durgachakri](https://github.com/Durgachakri)