import express from 'express';
import bodyParser from 'body-parser';
import { getProductGroups, getProducts, getProduct, createProduct, createProductGroup } from '../db/domain_db.mjs';
import { NotFoundError } from '../util/errors.mjs';
import { validateUser } from '../db/users_db.mjs';
import { verifyToken } from '../util/middleware.mjs';

const router = express.Router();

router.use((req, res, next) => {
  // For debugging:
  // console.log('********** REQUEST ***********');
  // console.log(req);
  // console.log('********** RESPONSE ***********');
  // console.log(res);
  next();
});

// For debugging: http http://localhost:6600/hello
router.get('/hello', (req, res) => res.status(200).json({
  message: 'Hello Yeah!',
}));

// Create application/x-www-form-urlencoded parser.
// const urlencodedParser = bodyParser.urlencoded({ extended: false });
// http -f POST http://localhost:6600/login username=jee password=joo
// router.post('/login', urlencodedParser, (req, res) => {
//   const buf = JSON.stringify(req.body, null, 2);
//   console.log(`buf: ${buf}`);
//   res.send(`welcome, ${req.body.username}`);
// });

// Create application/json parser.
const jsonParser = bodyParser.json();

// http POST http://localhost:6600/login username=jee password=joo Content-Type:application/json
router.post('/login', jsonParser, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new NotFoundError('Invalid username or password');
    }
    const token = await validateUser(username, password);
    const ret = { ret: 'ok', token };
    res.status(200).json(ret);
  } catch (err) {
    next(err);
  }
});

router.get('/product-groups', verifyToken, async (req, res, next) => {
  try {
    const productGroups = await getProductGroups();
    const ret = { ret: 'ok', product_groups: productGroups };
    res.status(200).json(ret);
  } catch (err) {
    next(err);
  }
});

router.get('/products/:pgId', verifyToken, async (req, res, next) => {
  try {
    const buf = await getProducts(parseInt(req.params.pgId, 10));
    const ret = { ret: 'ok', products: buf };
    res.status(200).json(ret);
  } catch (err) {
    next(err);
  }
});

router.get('/product/:pgId/:pId', verifyToken, async (req, res, next) => {
  try {
    const buf = await getProduct(parseInt(req.params.pgId, 10), parseInt(req.params.pId, 10));
    const ret = { ret: 'ok', product: buf };
    res.status(200).json(ret);
  } catch (err) {
    next(err);
  }
});

// 新しい商品グループを作成
router.post('/product-groups', jsonParser, verifyToken, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      throw new NotFoundError('Product group name is required');
    }
    const newGroup = await createProductGroup({ name, description });
    const ret = { ret: 'ok', product_group: newGroup };
    res.status(201).json(ret);
  } catch (err) {
    if (err.message === 'Product group name already exists') {
      res.status(400).json({
        ret: 'error',
        message: '既に該当のグループ名は登録済みです。'
      });
    } else {
      next(err);
    }
  }
});

// 新しい商品を作成
router.post('/products', jsonParser, verifyToken, async (req, res, next) => {
  try {
    const { product_group_id, name, description, price, stock } = req.body;
    if (!product_group_id || !name) {
      throw new NotFoundError('Product group ID and name are required');
    }
    const newProduct = await createProduct({ 
      product_group_id, 
      name, 
      description, 
      price: price || 0, 
      stock: stock || 0 
    });
    const ret = { ret: 'ok', product: newProduct };
    res.status(201).json(ret);
  } catch (err) {
    next(err);
  }
});

export default router;
