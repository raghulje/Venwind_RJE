const { check } = require("express-validator");
const Type = require("../utils/userTypes");

const validation = {
  createUserSchema: [
    check("username")
      .exists()
      .withMessage("Username is required")
      .notEmpty()
      .withMessage("Username should not be empty"),
    check("firstName").optional().notEmpty().withMessage("First Name should not be empty"),
    check("lastName").optional().notEmpty().withMessage("Last Name should not be empty"),
    check("mobileNumber").optional().notEmpty().withMessage("Mobile Number should not be empty"),
    check("email")
      .optional()
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    check("userType")
      .optional()
      .isIn([Type.Admin, Type.Investors])
      .withMessage("Invalid Role type"),
  ],
  validateLogin: [
    check("username")
      .exists()
      .withMessage("Username is required")
      .notEmpty()
      .withMessage("Username must be filled"),
    check("password")
      .exists()
      .withMessage("Password is required")
      .notEmpty()
      .withMessage("Password must be filled"),
  ],
};

module.exports = validation;
