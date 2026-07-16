const Card = require('../models/Card');
const Category = require('../models/Category');

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get all user cards (supports search, category and language filters)
// @route   GET /api/cards
// @access  Private
const getCards = async (req, res) => {
  try {
    const { search, category, language } = req.query;
    const query = {
      $or: [
        { userId: req.user._id },
        { favouritedBy: req.user._id }
      ]
    };

    if (category) {
      query.category = category;
    }

    if (language) {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }

    let mongooseQuery = Card.find(query);

    if (search) {
      const searchRegex = new RegExp(escapeRegExp(search), 'i');
      mongooseQuery = mongooseQuery.and([
        {
          $or: [
            { title: searchRegex },
            { category: searchRegex },
            { tags: { $in: [searchRegex] } },
            { language: searchRegex }
          ]
        }
      ]);
    }

    const cards = await mongooseQuery.sort({ updatedAt: -1 }).populate('userId', 'name');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single card
// @route   GET /api/cards/:id
// @access  Private
const getCardById = async (req, res) => {
  try {
    const card = await Card.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { visibility: 'global' }
      ]
    }).populate('userId', 'name');

    if (!card) {
      return res.status(404).json({ message: 'Knowledge card not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a card
// @route   POST /api/cards
// @access  Private
const createCard = async (req, res) => {
  try {
    const { title, description, codeSnippet, language, category, tags, isFavourite, isPinned, visibility } = req.body;

    // Validate category exists in default or user custom categories
    const categoryExists = await Category.findOne({
      name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
      $or: [
        { userId: null },
        { userId: req.user._id }
      ]
    });

    if (!categoryExists) {
      return res.status(400).json({ message: `Category '${category}' is invalid. Please create it first.` });
    }

    // Clean tags - ensure array of lowercase trimmed strings
    const cleanTags = tags
      ? tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '')
      : [];

    const card = await Card.create({
      title,
      description,
      codeSnippet: codeSnippet || '',
      language: language || '',
      category: categoryExists.name, // Use the correct cased name from database
      tags: cleanTags,
      isFavourite: isFavourite || false,
      isPinned: isPinned || false,
      visibility: visibility || 'local',
      createdBy: req.user.name || 'Anonymous',
      userId: req.user._id,
      favouritedBy: isFavourite ? [req.user._id] : [],
      favouritedCount: isFavourite ? 1 : 0
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a card
// @route   PUT /api/cards/:id
// @access  Private
const updateCard = async (req, res) => {
  try {
    const { title, description, codeSnippet, language, category, tags, isFavourite, isPinned, visibility } = req.body;

    let card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Knowledge card not found' });
    }

    const isOwner = card.userId.toString() === req.user._id.toString();

    // Permissions check: non-owners can only toggle favorites on global cards
    if (!isOwner) {
      if (card.visibility !== 'global') {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (isFavourite !== undefined) {
        const userIdx = card.favouritedBy.indexOf(req.user._id);
        if (userIdx > -1) {
          card.favouritedBy.splice(userIdx, 1);
          card.favouritedCount = Math.max(0, card.favouritedCount - 1);
        } else {
          card.favouritedBy.push(req.user._id);
          card.favouritedCount += 1;
        }
        const updatedCard = await card.save();
        return res.json(updatedCard);
      } else {
        return res.status(403).json({ message: 'Only card owners can modify other fields.' });
      }
    }

    // If category is changing, validate it
    if (category && category !== card.category) {
      const categoryExists = await Category.findOne({
        name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
        $or: [
          { userId: null },
          { userId: req.user._id }
        ]
      });

      if (!categoryExists) {
        return res.status(400).json({ message: `Category '${category}' is invalid. Please create it first.` });
      }
      card.category = categoryExists.name;
    }

    if (title) card.title = title;
    if (description) card.description = description;
    if (codeSnippet !== undefined) card.codeSnippet = codeSnippet;
    if (language !== undefined) card.language = language;
    if (isPinned !== undefined) card.isPinned = isPinned;
    if (visibility !== undefined) card.visibility = visibility;
    
    if (isFavourite !== undefined && isFavourite !== card.isFavourite) {
      card.isFavourite = isFavourite;
      const userIdx = card.favouritedBy.indexOf(req.user._id);
      if (isFavourite) {
        if (userIdx === -1) {
          card.favouritedBy.push(req.user._id);
          card.favouritedCount += 1;
        }
      } else {
        if (userIdx > -1) {
          card.favouritedBy.splice(userIdx, 1);
          card.favouritedCount = Math.max(0, card.favouritedCount - 1);
        }
      }
    }

    if (tags) {
      card.tags = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');
    }

    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a card
// @route   DELETE /api/cards/:id
// @access  Private
const deleteCard = async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!card) {
      return res.status(404).json({ message: 'Knowledge card not found' });
    }

    res.json({ message: 'Knowledge card deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all community shared global cards (supports search, category, language, sorting filters)
// @route   GET /api/cards/global
// @access  Private
const getGlobalCards = async (req, res) => {
  try {
    const { search, category, language, sort } = req.query;
    const query = { visibility: 'global' };

    if (category) {
      query.category = category;
    }

    if (language) {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegExp(search), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: { $in: [searchRegex] } },
        { language: searchRegex }
      ];
    }

    let sortObj = { createdAt: -1 }; // Default: Newest

    if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'recently_updated') {
      sortObj = { updatedAt: -1 };
    } else if (sort === 'popular') {
      sortObj = { favouritedCount: -1, createdAt: -1 };
    }

    const cards = await Card.find(query).sort(sortObj).populate('userId', 'name');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getGlobalCards
};
