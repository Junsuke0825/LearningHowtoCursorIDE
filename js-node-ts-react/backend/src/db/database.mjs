import sqlite3 from 'sqlite3';
import logger from '../util/logger.mjs';

// データベース接続を作成
const db = new sqlite3.Database('./database.sqlite');

/**
 * データベースの初期化
 * テーブルが存在しない場合は作成する
 */
async function setupDatabase() {
  logger.debug('ENTER setupDatabase');
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // ユーザーテーブルを作成
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          logger.error('Error creating users table:', err.message);
          reject(err);
          return;
        }
        logger.debug('Users table created or already exists');
      });

      // セッションテーブルを作成
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          logger.error('Error creating sessions table:', err.message);
          reject(err);
          return;
        }
        logger.debug('Sessions table created or already exists');
      });

      // デフォルトユーザーを挿入（存在しない場合のみ）
      db.run(`
        INSERT OR IGNORE INTO users (username, password) VALUES 
        ('jartsa', 'joo'),
        ('rane', 'jee'),
        ('d', 'd')
      `, (err) => {
        if (err) {
          logger.error('Error inserting default users:', err.message);
          reject(err);
          return;
        }
        logger.debug('Default users inserted or already exist');
        
        // 期限切れのセッションをクリーンアップ
        db.run('DELETE FROM sessions WHERE expires_at < datetime("now")', (err) => {
          if (err) {
            logger.error('Error cleaning expired sessions:', err.message);
            reject(err);
            return;
          }
          logger.debug('Expired sessions cleaned up');
          logger.debug('EXIT setupDatabase');
          resolve();
        });
      });
    });
  });
}

/**
 * データベース接続を閉じる
 */
function closeDatabase() {
  logger.debug('Closing database connection');
  db.close((err) => {
    if (err) {
      logger.error('Error closing database:', err.message);
    } else {
      logger.debug('Database connection closed');
    }
  });
}

// プロセス終了時にデータベース接続を閉じる
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

export { db, setupDatabase, closeDatabase };
