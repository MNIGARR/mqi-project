const express = require('express');
const {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/events.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listEvents);
router.get('/:id', getEventById);
router.post('/', requireAuth, createEvent);
router.put('/:id', requireAuth, updateEvent);
router.delete('/:id', requireAuth, deleteEvent);

module.exports = router;
