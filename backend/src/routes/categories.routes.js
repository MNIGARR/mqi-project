const express = require('express');
const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categories.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listCategories);
router.get('/:id', getCategoryById);
router.post('/', requireAuth, createCategory);
router.put('/:id', requireAuth, updateCategory);
router.delete('/:id', requireAuth, deleteCategory);

module.exports = router;
