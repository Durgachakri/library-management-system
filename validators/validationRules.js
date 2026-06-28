const { body, param } = require("express-validator");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Middleware to run after validators and return errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

// Auth validators
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),
  body("password").notEmpty().withMessage("Password is required."),
];

// Book validators
const bookValidation = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("author").trim().notEmpty().withMessage("Author is required."),
  body("isbn").trim().notEmpty().withMessage("ISBN is required."),
  body("category").trim().notEmpty().withMessage("Category is required."),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 0 })
    .withMessage("Quantity cannot be negative."),
  body("availableQuantity")
    .notEmpty()
    .withMessage("Available quantity is required.")
    .isInt({ min: 0 })
    .withMessage("Available quantity cannot be negative.")
    .custom((value, { req }) => {
      if (parseInt(value) > parseInt(req.body.quantity)) {
        throw new Error(
          "Available quantity cannot be greater than total quantity."
        );
      }
      return true;
    }),
];

const bookUpdateValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty."),
  body("author").optional().trim().notEmpty().withMessage("Author cannot be empty."),
  body("isbn").optional().trim().notEmpty().withMessage("ISBN cannot be empty."),
  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty."),
  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity cannot be negative."),
  body("availableQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Available quantity cannot be negative."),
];

// ID param validator
const mongoIdValidation = (paramName = "id") => [
  param(paramName).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid ID format.");
    }
    return true;
  }),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  bookValidation,
  bookUpdateValidation,
  mongoIdValidation,
};
