const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for developer
  console.error(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error.message = message;
    error.statusCode = 400;
  }

  // Sequelize unique constraint error
  if (err. name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error.message = message;
    error.statusCode = 400;
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    const message = 'Database error';
    error.message = message;
    error.statusCode = 500;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error.message = message;
    error.statusCode = 401;
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error.message = message;
    error.statusCode = 401;
  }

  res. status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

module.exports = errorHandler;
