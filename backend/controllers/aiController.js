const Card = require('../models/Card');
const Category = require('../models/Category');
const geminiService = require('../services/geminiService');

// @desc    Suggest category and tags based on title/description
// @route   POST /api/ai/suggest-category
// @access  Private
const suggestCategory = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required for suggestions' });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({ message: 'Description is required for suggestions' });
    }

    // Fetch all allowed categories for this user (defaults + custom)
    const categories = await Category.find({
      $or: [
        { userId: null },
        { userId: req.user._id }
      ]
    });

    const categoryNames = categories.map(c => c.name);

    const suggestion = await geminiService.suggestCategoryAndTags(
      title,
      description,
      categoryNames
    );

    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: `AI Suggestion failed: ${error.message}` });
  }
};

// @desc    Explain a knowledge card
// @route   POST /api/ai/explain
// @access  Private
const explainCard = async (req, res) => {
  try {
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required' });
    }

    const card = await Card.findOne({
      _id: cardId,
      $or: [
        { userId: req.user._id },
        { visibility: 'global' }
      ]
    });

    if (!card) {
      return res.status(404).json({ message: 'Knowledge card not found' });
    }

    const explanation = await geminiService.explainCardContent(
      card.title,
      card.description,
      card.codeSnippet,
      card.language
    );

    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ message: `AI Explanation failed: ${error.message}` });
  }
};

// @desc    Ask AI mentor a question about a card
// @route   POST /api/ai/mentor
// @access  Private
const askMentorOnCard = async (req, res) => {
  try {
    const { cardId, question } = req.body;

    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required' });
    }

    if (!question || question.trim() === '') {
      return res.status(400).json({ message: 'Question is required' });
    }

    const card = await Card.findOne({
      _id: cardId,
      $or: [
        { userId: req.user._id },
        { visibility: 'global' }
      ]
    });

    if (!card) {
      return res.status(404).json({ message: 'Knowledge card not found' });
    }

    const answer = await geminiService.askMentor(card, question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: `AI Mentor failed: ${error.message}` });
  }
};

module.exports = {
  suggestCategory,
  explainCard,
  askMentorOnCard
};
