const sqlite3 = require('sqlite3').verbose();

// コマンドライン引数からSQLクエリを取得
const query = process.argv[2];

if (!query) {
  console.log('使用方法: node run-sql.js "SELECT * FROM users"');
  process.exit(1);
}

// データベースに接続
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  console.log(`Executing: ${query}\n`);
});

// SQLクエリを実行
db.all(query, (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    if (rows.length === 0) {
      console.log('No rows returned');
    } else {
      console.table(rows);
    }
  }
  
  // データベース接続を閉じる
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\nDatabase connection closed');
    }
  });
});
