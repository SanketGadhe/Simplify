const { body } = require("express-validator");

const postValidation = [
  // Title is required and should not exceed 100 characters
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title should not exceed 100 characters")
    .trim(),

  // Content is required
  body("content")
    .notEmpty()
    .withMessage("Content is required"),

  // Tags should be an array of strings
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (!tags.every((tag) => typeof tag === "string"))
        throw new Error("Each tag must be a string");
      return true;
    }),

  // Visibility must be one of the enum values
  body("visibility")
    .optional()
    .isIn(["Public", "Private", "Connections Only"])
    .withMessage(
      "Visibility must be one of the following: Public, Private, or Connections Only"
    ),
];

module.exports = postValidation;
