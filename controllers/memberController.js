const User = require("../models/User");
const Borrow = require("../models/Borrow");

const getAllMembers = async (req, res, next) => {
  try {
    const members = await User.find({ role: "member" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    if (member.role === "librarian") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete a librarian account.",
      });
    }

    const activeBorrows = await Borrow.findOne({
      memberId: req.params.id,
      status: "borrowed",
    });

    if (activeBorrows) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a member who has unreturned books.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Member deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getMyBorrowedBooks = async (req, res, next) => {
  try {
    const borrowedBooks = await Borrow.find({
      memberId: req.user._id,
      status: "borrowed",
    }).populate("bookId", "title author isbn category");

    res.status(200).json({
      success: true,
      total: borrowedBooks.length,
      data: borrowedBooks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllMembers, deleteMember, getMyBorrowedBooks };
