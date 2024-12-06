const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into an array of messages
    const formattedErrors = errors.array().map((err) => ({
      field: err.param, // The field that caused the error
      message: err.msg, // The error message
    }));

    // Send a structured response with errors
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = handleValidationErrors;
