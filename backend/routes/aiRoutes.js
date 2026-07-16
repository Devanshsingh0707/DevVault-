const express = require('express');
const router = express.Router();
const { suggestCategory, explainCard, askMentorOnCard } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/suggest-category', protect, suggestCategory);
router.post('/explain', protect, explainCard);
router.post('/mentor', protect, askMentorOnCard);

module.exports = router;
