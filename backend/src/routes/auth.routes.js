const express = require('express');
const { login, getCurrentAdmin } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', requireAuth, getCurrentAdmin);

module.exports = router;
