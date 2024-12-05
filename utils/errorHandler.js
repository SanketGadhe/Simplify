class ErrorResponse extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // Optional field for detailed errors
  }
}

module.exports = ErrorResponse;
