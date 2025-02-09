export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };