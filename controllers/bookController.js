const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

// @desc    Add a new book
// @route   POST /api/books
// @access  Librarian only
const addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, quantity, availableQuantity } =
      req.body;

    // Check duplicate ISBN
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists.",
      });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      quantity,
      availableQuantity,
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully.",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all books with search, filter, and pagination
// @route   GET /api/books?search=&category=&page=1&limit=10
// @access  Authenticated users (members & librarians)
const getAllBooks = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search by title or author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single book by ID
// @route   GET /api/books/:id
// @access  Authenticated users
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Librarian only
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    // If updating quantity, ensure availableQuantity remains consistent
    const updatedData = { ...req.body };

    const newQuantity =
      updatedData.quantity !== undefined ? updatedData.quantity : book.quantity;
    const newAvailable =
      updatedData.availableQuantity !== undefined
        ? updatedData.availableQuantity
        : book.availableQuantity;

    if (newAvailable > newQuantity) {
      return res.status(400).json({
        success: false,
        message: "Available quantity cannot exceed total quantity.",
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Book updated successfully.",
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Librarian only
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    // Prevent deleting if book is currently borrowed
    const activeBorrow = await Borrow.findOne({
      bookId: req.params.id,
      status: "borrowed",
    });

    if (activeBorrow) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a book that is currently borrowed by a member.",
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Borrow a book
// @route   POST /api/books/:id/borrow
// @access  Member only
const borrowBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    // Check availability
    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is currently unavailable.",
      });
    }

    // Check if member already has this book borrowed
    const existingBorrow = await Borrow.findOne({
      memberId: req.user._id,
      bookId: req.params.id,
      status: "borrowed",
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message: "You already have this book borrowed. Please return it first.",
      });
    }

    // Create borrow record
    const borrowRecord = await Borrow.create({
      memberId: req.user._id,
      bookId: req.params.id,
    });

    // Decrease available quantity
    book.availableQuantity -= 1;
    await book.save();

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully.",
      data: borrowRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return a borrowed book
// @route   POST /api/books/:id/return
// @access  Member only
const returnBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    // Find active borrow record for this member and book
    const borrowRecord = await Borrow.findOne({
      memberId: req.user._id,
      bookId: req.params.id,
      status: "borrowed",
    });

    if (!borrowRecord) {
      return res.status(400).json({
        success: false,
        message: "You have not borrowed this book.",
      });
    }

    // Update borrow record
    borrowRecord.status = "returned";
    borrowRecord.returnDate = new Date();
    await borrowRecord.save();

    // Increase available quantity
    book.availableQuantity += 1;
    await book.save();

    res.status(200).json({
      success: true,
      message: "Book returned successfully.",
      data: borrowRecord,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
};
