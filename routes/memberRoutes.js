const express = require("express");
const router = express.Router();
const {
  getAllMembers,
  deleteMember,
  getMyBorrowedBooks,
} = require("../controllers/memberController");
const { protect } = require("../middleware/authMiddleware");
const { librarianOnly, memberOnly } = require("../middleware/roleMiddleware");
const { mongoIdValidation, validate } = require("../validators/validationRules");

// GET /api/members/me/books — Member: see their borrowed books
// NOTE: This must be defined BEFORE /:id routes to avoid "me" being parsed as an ID
router.get("/me/books", protect, memberOnly, getMyBorrowedBooks);

// GET /api/members — Librarian only
router.get("/", protect, librarianOnly, getAllMembers);

// DELETE /api/members/:id — Librarian only
router.delete(
  "/:id",
  protect,
  librarianOnly,
  mongoIdValidation("id"),
  validate,
  deleteMember
);

module.exports = router;
