import express from 'express';
import cors from 'cors';
import router from './src/routing/router.mjs';
import { errorHandler } from './src/util/middleware.mjs';
import { setupDatabase } from './src/db/database.mjs';

// Note:
// backend port: 6600
// frontend port: 6610

const corsOptions = {
  origin: 'http://localhost:6610',
};

const port = 6600;
const app = express();
app.use(cors(corsOptions));
app.use(router);
app.use(errorHandler);

// データベースを初期化してからサーバーを起動
setupDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
      console.log('Database initialized successfully');
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

export default app;
