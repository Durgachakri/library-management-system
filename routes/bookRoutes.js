const express = require("express");
const router = express.Router();
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
} = require("../controllers/bookController");
const { protect } = require("../middleware/authMiddleware");
const { librarianOnly, memberOnly } = require("../middleware/roleMiddleware");
const {
  bookValidation,
  bookUpdateValidation,
  mongoIdValidation,
  validate,
} = require("../validators/validationRules");

// GET /api/books — All authenticated users (members + librarians)
router.get("/", protect, getAllBooks);

// POST /api/books — Librarian only
router.post("/", protect, librarianOnly, bookValidation, validate, addBook);

// GET /api/books/:id — All authenticated users
router.get("/:id", protect, mongoIdValidation("id"), validate, getBookById);

// PUT /api/books/:id — Librarian only
router.put(
  "/:id",
  protect,
  librarianOnly,
  mongoIdValidation("id"),
  bookUpdateValidation,
  validate,
  updateBook
);

// DELETE /api/books/:id — Librarian only
router.delete(
  "/:id",
  protect,
  librarianOnly,
  mongoIdValidation("id"),
  validate,
  deleteBook
);

// POST /api/books/:id/borrow — Member only
router.post(
  "/:id/borrow",
  protect,
  memberOnly,
  mongoIdValidation("id"),
  validate,
  borrowBook
);

// POST /api/books/:id/return — Member only
router.post(
  "/:id/return",
  protect,
  memberOnly,
  mongoIdValidation("id"),
  validate,
  returnBook
);

module.exports = router;
