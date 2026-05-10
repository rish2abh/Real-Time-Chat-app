const jwt = require("jsonwebtoken");
const { sendError } = require("../utils");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return sendError(res, 401, "No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("[Auth Middleware Error]", error.message);
    sendError(res, 401, "Invalid token");
  }
};

module.exports = auth;
