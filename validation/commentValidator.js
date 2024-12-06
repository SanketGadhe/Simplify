const { body } = require("express-validator");

const validateComment = [
  // Validate content (should not be empty and should be between 1 and 500 characters)
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 500 })  // You can define a max length for comments
    .withMessage('Comment must be between 1 and 500 characters'),
];

const validateEditComment = [
  // Validate content for editing (same as creation validation)
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
];

module.exports = { validateComment, validateEditComment };
