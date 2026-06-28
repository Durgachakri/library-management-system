// Restrict access to librarians only
const librarianOnly = (req, res, next) => {
  if (req.user.role !== "librarian") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Librarians only.",
    });
  }
  next();
};

// Restrict access to members only
const memberOnly = (req, res, next) => {
  if (req.user.role !== "member") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Members only.",
    });
  }
  next();
};

module.exports = { librarianOnly, memberOnly };
