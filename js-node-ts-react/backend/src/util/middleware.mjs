import logger from './logger.mjs';
import { production } from './config.mjs';
import { NotFoundError, ValidationError } from './errors.mjs';
import { validateToken } from '../db/users_db.mjs';

// ErrorHandler.js
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  logger.debug('Middleware Error Handling triggered');
  const errStatus = err.statusCode || 500;
  const errMsg = production() ? 'Not found' : err.message || 'Something went wrong';
  logger.error(`Error: ${errStatus} - ${errMsg}`);
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: production() ? {} : err.stack,
  });
};

const verifyToken = async (req, _res, next) => {
  const token = req.headers['x-token'];
  logger.debug('Received token:', token ? `${token.substring(0, 20)}...` : 'undefined');
  logger.debug('Token type:', typeof token);
  
  if (!token) {
    throw new NotFoundError('A token is required for authentication');
  }
  
  // トークンが文字列でない場合はエラー
  if (typeof token !== 'string') {
    logger.debug('Token is not a string:', token);
    throw new NotFoundError('Invalid token format');
  }
  
  try {
    await validateToken(token);
    return next();
  } catch (error) {
    logger.debug('Token validation failed:', error.message);
    if (error instanceof ValidationError) {
      throw error;
    } else {
      throw new NotFoundError('Invalid token');
    }
  }
};

// export default errorHandler;
export { errorHandler, verifyToken };
