const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    console.error(`[ERROR] ${statusCode} - ${message}`);
  
    res.status(statusCode).json({
      success: false,
      message,
      errors: err.details || null, // Include field-specific errors if available
    });
  };
  
  module.exports = errorMiddleware;
  