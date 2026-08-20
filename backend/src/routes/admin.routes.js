const express = require('express');
const { getStats } = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAuth, getStats);

module.exports = router;
