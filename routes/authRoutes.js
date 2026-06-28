const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
  validate,
} = require("../validators/validationRules");

// POST /api/auth/register
router.post("/register", registerValidation, validate, register);

// POST /api/auth/login
router.post("/login", loginValidation, validate, login);

module.exports = router;
