const sqlite3 = require('sqlite3').verbose();

// データベースに接続
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

// テーブル一覧を表示
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error getting tables:', err.message);
    return;
  }
  console.log('\n=== テーブル一覧 ===');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
});

// ユーザーテーブルの内容を表示
db.all("SELECT * FROM users", (err, rows) => {
  if (err) {
    console.error('Error getting users:', err.message);
    return;
  }
  console.log('\n=== ユーザーテーブル ===');
  console.table(rows);
});

// 商品グループテーブルの内容を表示
db.all("SELECT * FROM product_groups", (err, rows) => {
  if (err) {
    console.error('Error getting product_groups:', err.message);
    return;
  }
  console.log('\n=== 商品グループテーブル ===');
  console.table(rows);
});

// 商品テーブルの内容を表示
db.all("SELECT * FROM products", (err, rows) => {
  if (err) {
    console.error('Error getting products:', err.message);
    return;
  }
  console.log('\n=== 商品テーブル ===');
  console.table(rows);
});

// セッションテーブルの内容を表示
db.all("SELECT * FROM sessions", (err, rows) => {
  if (err) {
    console.error('Error getting sessions:', err.message);
    return;
  }
  console.log('\n=== セッションテーブル ===');
  console.table(rows);
  
  // データベース接続を閉じる
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\nDatabase connection closed');
    }
  });
});
