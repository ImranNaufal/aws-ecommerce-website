// Placeholder auth middleware
const authMiddleware = (req, res, next) => {
  // For now, just pass through
  next();
};

module.exports = authMiddleware;
