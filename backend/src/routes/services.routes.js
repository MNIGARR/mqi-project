const express = require('express');
const {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/services.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listServices);
router.get('/:id', getServiceById);
router.post('/', requireAuth, createService);
router.put('/:id', requireAuth, updateService);
router.delete('/:id', requireAuth, deleteService);

module.exports = router;
