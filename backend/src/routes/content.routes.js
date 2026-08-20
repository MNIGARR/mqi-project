const express = require('express');
const { listContent, getContentByKey, updateContent } = require('../controllers/content.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listContent);
router.get('/:key', getContentByKey);
router.put('/:key', requireAuth, updateContent);

module.exports = router;
