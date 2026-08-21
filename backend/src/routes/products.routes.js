const express = require('express');
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post('/', requireAuth, createProduct);
router.put('/:id', requireAuth, updateProduct);
router.delete('/:id', requireAuth, deleteProduct);

module.exports = router;
