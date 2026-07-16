const express = require('express');
const router = express.Router();
const { getCards, getCardById, createCard, updateCard, deleteCard, getGlobalCards } = require('../controllers/cardController');
const { validateCard } = require('../validators/cardValidator');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCards)
  .post(protect, validateCard, createCard);

router.route('/global')
  .get(protect, getGlobalCards);

router.route('/:id')
  .get(protect, getCardById)
  .put(protect, validateCard, updateCard)
  .delete(protect, deleteCard);

module.exports = router;
