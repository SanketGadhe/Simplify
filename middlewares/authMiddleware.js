// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorHandler");
const cookieParser = require("cookie-parser");

const protect = async (req, res, next) => {
 
  let token;

  // Check for token in Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // Bearer <token>
  } else if (req.cookies.userToken) {
    token = req.cookies.userToken;
  }

  // If token is not present
  if (!token) {
    return next(new ErrorResponse("Not authorized, no token", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user information to the request object
    req.user = decoded.id;

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized, invalid token", 401));
  }
};
module.exports =  protect ;
