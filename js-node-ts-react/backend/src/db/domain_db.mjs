import logger from '../util/logger.mjs';
import { NotFoundError } from '../util/errors.mjs';
import { db } from './database.mjs';

/**
 * 商品グループ一覧を取得
 * @returns {Promise<Array>}
 */
async function getProductGroups() {
  logger.debug('ENTER getProductGroups');
  
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM product_groups ORDER BY id';
    db.all(query, [], (err, rows) => {
      if (err) {
        logger.error('Database error in getProductGroups:', err.message);
        reject(new NotFoundError('Failed to fetch product groups'));
      } else {
        logger.debug(`Found ${rows.length} product groups`);
        resolve(rows);
      }
    });
  });
}

/**
 * 特定の商品グループの商品一覧を取得
 * @param {number} productGroupId
 * @returns {Promise<Array>}
 */
async function getProducts(productGroupId) {
  logger.debug(`ENTER getProducts, productGroupId: ${productGroupId}`);
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.*, pg.name as group_name 
      FROM products p 
      JOIN product_groups pg ON p.product_group_id = pg.id 
      WHERE p.product_group_id = ? 
      ORDER BY p.id
    `;
    
    db.all(query, [productGroupId], (err, rows) => {
      if (err) {
        logger.error('Database error in getProducts:', err.message);
        reject(new NotFoundError('Failed to fetch products'));
      } else {
        logger.debug(`Found ${rows.length} products for group ${productGroupId}`);
        resolve(rows);
      }
    });
  });
}

/**
 * 特定の商品の詳細を取得
 * @param {number} productGroupId
 * @param {number} productId
 * @returns {Promise<Object>}
 */
async function getProduct(productGroupId, productId) {
  logger.debug(`ENTER getProduct, productGroupId: ${productGroupId}, productId: ${productId}`);
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.*, pg.name as group_name 
      FROM products p 
      JOIN product_groups pg ON p.product_group_id = pg.id 
      WHERE p.product_group_id = ? AND p.id = ?
    `;
    
    db.get(query, [productGroupId, productId], (err, row) => {
      if (err) {
        logger.error('Database error in getProduct:', err.message);
        reject(new NotFoundError('Failed to fetch product'));
      } else if (!row) {
        reject(new NotFoundError(`Product not found: groupId=${productGroupId}, productId=${productId}`));
      } else {
        logger.debug(`Found product: ${row.name}`);
        resolve(row);
      }
    });
  });
}

/**
 * 新しい商品を追加
 * @param {Object} productData
 * @returns {Promise<Object>}
 */
async function createProduct(productData) {
  logger.debug(`ENTER createProduct, productData:`, productData);
  
  const { product_group_id, name, description, price, stock } = productData;
  
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO products (product_group_id, name, description, price, stock)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [product_group_id, name, description, price, stock], function(err) {
      if (err) {
        logger.error('Database error in createProduct:', err.message);
        reject(new NotFoundError('Failed to create product'));
      } else {
        const newProduct = {
          id: this.lastID,
          product_group_id,
          name,
          description,
          price,
          stock
        };
        logger.debug(`Created product with ID: ${this.lastID}`);
        resolve(newProduct);
      }
    });
  });
}

/**
 * 商品を更新
 * @param {number} productId
 * @param {Object} productData
 * @returns {Promise<Object>}
 */
async function updateProduct(productId, productData) {
  logger.debug(`ENTER updateProduct, productId: ${productId}, productData:`, productData);
  
  const { name, description, price, stock } = productData;
  
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE products 
      SET name = ?, description = ?, price = ?, stock = ?
      WHERE id = ?
    `;
    
    db.run(query, [name, description, price, stock, productId], function(err) {
      if (err) {
        logger.error('Database error in updateProduct:', err.message);
        reject(new NotFoundError('Failed to update product'));
      } else if (this.changes === 0) {
        reject(new NotFoundError(`Product not found: ${productId}`));
      } else {
        logger.debug(`Updated product with ID: ${productId}`);
        resolve({ id: productId, ...productData });
      }
    });
  });
}

/**
 * 商品を削除
 * @param {number} productId
 * @returns {Promise<boolean>}
 */
async function deleteProduct(productId) {
  logger.debug(`ENTER deleteProduct, productId: ${productId}`);
  
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM products WHERE id = ?';
    
    db.run(query, [productId], function(err) {
      if (err) {
        logger.error('Database error in deleteProduct:', err.message);
        reject(new NotFoundError('Failed to delete product'));
      } else if (this.changes === 0) {
        reject(new NotFoundError(`Product not found: ${productId}`));
      } else {
        logger.debug(`Deleted product with ID: ${productId}`);
        resolve(true);
      }
    });
  });
}

/**
 * 商品グループ名の重複チェック
 * @param {string} name
 * @returns {Promise<boolean>}
 */
async function checkProductGroupNameExists(name) {
  logger.debug(`ENTER checkProductGroupNameExists, name: ${name}`);
  
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) as count FROM product_groups WHERE name = ?';
    
    db.get(query, [name], (err, row) => {
      if (err) {
        logger.error('Database error in checkProductGroupNameExists:', err.message);
        reject(new NotFoundError('Failed to check product group name'));
      } else {
        const exists = row.count > 0;
        logger.debug(`Product group name exists: ${exists}`);
        resolve(exists);
      }
    });
  });
}

/**
 * 商品グループを追加
 * @param {Object} groupData
 * @returns {Promise<Object>}
 */
async function createProductGroup(groupData) {
  logger.debug(`ENTER createProductGroup, groupData:`, groupData);
  
  const { name, description } = groupData;
  
  // 重複チェック
  const nameExists = await checkProductGroupNameExists(name);
  if (nameExists) {
    throw new NotFoundError('Product group name already exists');
  }
  
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO product_groups (name, description)
      VALUES (?, ?)
    `;
    
    db.run(query, [name, description], function(err) {
      if (err) {
        logger.error('Database error in createProductGroup:', err.message);
        reject(new NotFoundError('Failed to create product group'));
      } else {
        const newGroup = {
          id: this.lastID,
          name,
          description
        };
        logger.debug(`Created product group with ID: ${this.lastID}`);
        resolve(newGroup);
      }
    });
  });
}

export {
  getProductGroups,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductGroup,
  checkProductGroupNameExists,
};
