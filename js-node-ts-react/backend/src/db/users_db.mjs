import jwt from 'jsonwebtoken';
import logger from '../util/logger.mjs';
import { ValidationError } from '../util/errors.mjs';
import { db } from './database.mjs';

const EXPRIRES_IN = 1800; // 30分
const SECRET = 'mysecret';

/**
 * パスワードをチェック
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>}
 */
function checkPassword(username, password) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT password FROM users WHERE username = ?';
    db.get(query, [username], (err, row) => {
      if (err) {
        logger.error('Database error in checkPassword:', err.message);
        reject(err);
      } else if (!row) {
        resolve(false);
      } else {
        resolve(row.password === password);
      }
    });
  });
}

/**
 * JWTトークンを生成
 * @param {string} username
 * @returns {string}
 */
function generateToken(username) {
  return jwt.sign({ username }, SECRET, { expiresIn: EXPRIRES_IN });
}

/**
 * JWTトークンを検証
 * @param {string} token
 * @returns {Promise<object>}
 */
function validateToken(token) {
  return new Promise((resolve, reject) => {
    try {
      logger.debug('validateToken - received token:', token);
      logger.debug('validateToken - token type:', typeof token);
      logger.debug('validateToken - token length:', token ? token.length : 'undefined');
      
      const decodedToken = jwt.verify(token, SECRET);
      logger.debug('validateToken - decoded token:', decodedToken);
      
      // データベースでセッションを確認
      const query = 'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")';
      db.get(query, [token], (err, session) => {
        if (err) {
          logger.error('Database error in validateToken:', err.message);
          reject(new ValidationError('Database error'));
        } else if (!session) {
          logger.debug('No session found for token');
          reject(new ValidationError('Token not found in session database or expired'));
        } else if (session.username !== decodedToken.username) {
          logger.debug('Username mismatch:', session.username, 'vs', decodedToken.username);
          reject(new ValidationError('Token username does not match session username'));
        } else {
          logger.debug('Token validation successful');
          resolve(decodedToken);
        }
      });
    } catch (error) {
      logger.debug('JWT verification failed:', error.message);
      reject(new ValidationError('Invalid token'));
    }
  });
}

/**
 * ユーザーを認証し、トークンを生成
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>}
 */
async function validateUser(username, password) {
  logger.debug(`ENTER validateUser, username: ${username}, password: ${password}`);
  
  const valid = await checkPassword(username, password);
  if (!valid) {
    throw new ValidationError('Invalid username or password');
  }
  
  const token = generateToken(username);
  const expiresAt = new Date(Date.now() + EXPRIRES_IN * 1000).toISOString();
  
  // セッションをデータベースに保存
  const insertSession = `
    INSERT OR REPLACE INTO sessions (username, token, expires_at)
    VALUES (?, ?, ?)
  `;
  
  return new Promise((resolve, reject) => {
    db.run(insertSession, [username, token, expiresAt], function(err) {
      if (err) {
        logger.error('Database error in validateUser:', err.message);
        reject(new ValidationError('Failed to create session'));
      } else {
        logger.debug(`Session created for user: ${username}`);
        resolve(token);
      }
    });
  });
}

/**
 * セッションを削除（ログアウト）
 * @param {string} token
 * @returns {Promise<void>}
 */
function clearSession(token) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM sessions WHERE token = ?';
    db.run(query, [token], function(err) {
      if (err) {
        logger.error('Database error in clearSession:', err.message);
        reject(new ValidationError('Failed to clear session'));
      } else {
        logger.debug(`Session cleared for token: ${token}`);
        resolve();
      }
    });
  });
}

/**
 * 期限切れのセッションをクリア
 * @returns {Promise<void>}
 */
function clearExpiredSessions() {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM sessions WHERE expires_at < datetime("now")';
    db.run(query, function(err) {
      if (err) {
        logger.error('Database error in clearExpiredSessions:', err.message);
        reject(err);
      } else {
        logger.debug(`Cleared ${this.changes} expired sessions`);
        resolve();
      }
    });
  });
}

/**
 * 全セッションを取得（デバッグ用）
 * @returns {Promise<Array>}
 */
function getAllSessions() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM sessions';
    db.all(query, [], (err, rows) => {
      if (err) {
        logger.error('Database error in getAllSessions:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export {
  validateToken,
  validateUser,
  clearSession,
  clearExpiredSessions,
  getAllSessions,
};

