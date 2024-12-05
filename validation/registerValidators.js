const { body, validationResult } = require('express-validator');
const ErrorResponse = require("../utils/errorHandler");
const registerValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('userName').notEmpty().withMessage('User Name is required'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));

    // Pass a structured error to the middleware
    return next(new ErrorResponse("Validation Error", 400, formattedErrors));
  }
  next();
};

module.exports={registerValidation,handleValidationErrors}