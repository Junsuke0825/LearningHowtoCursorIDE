const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

// データベースに接続
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  console.log('Type your SQL queries below. Type "exit" to quit.\n');
});

// 対話型インターフェースを作成
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'SQL> '
});

rl.prompt();

rl.on('line', (input) => {
  const query = input.trim();
  
  if (query.toLowerCase() === 'exit') {
    console.log('Goodbye!');
    db.close();
    rl.close();
    return;
  }
  
  if (query.toLowerCase() === 'help') {
    console.log('\n=== 利用可能なコマンド ===');
    console.log('help     - このヘルプを表示');
    console.log('tables   - テーブル一覧を表示');
    console.log('schema   - テーブル構造を表示');
    console.log('exit     - 終了');
    console.log('\n=== サンプルクエリ ===');
    console.log('SELECT * FROM users;');
    console.log('SELECT * FROM product_groups;');
    console.log('SELECT * FROM products;');
    console.log('SELECT p.name, pg.name as group_name FROM products p JOIN product_groups pg ON p.product_group_id = pg.id;');
    console.log('');
    rl.prompt();
    return;
  }
  
  if (query.toLowerCase() === 'tables') {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.log('\n=== テーブル一覧 ===');
        tables.forEach(table => {
          console.log(`- ${table.name}`);
        });
        console.log('');
      }
      rl.prompt();
    });
    return;
  }
  
  if (query.toLowerCase() === 'schema') {
    db.all("SELECT sql FROM sqlite_master WHERE type='table'", (err, schemas) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.log('\n=== テーブル構造 ===');
        schemas.forEach(schema => {
          console.log(schema.sql);
          console.log('');
        });
      }
      rl.prompt();
    });
    return;
  }
  
  if (query === '') {
    rl.prompt();
    return;
  }
  
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
    console.log('');
    rl.prompt();
  });
});

rl.on('close', () => {
  console.log('Database connection closed');
  process.exit(0);
});
