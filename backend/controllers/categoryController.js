const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  'DSA',
  'JavaScript',
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'SQL',
  'Git',
  'Debugging',
  'Interview',
  'Backend',
  'Frontend',
  'System Design'
];

// Helper to seed categories
const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments({ userId: null });
    if (count === 0) {
      console.log('Seeding default categories...');
      const categoriesToCreate = DEFAULT_CATEGORIES.map(name => ({ name, userId: null }));
      await Category.insertMany(categoriesToCreate);
      console.log('Default categories seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding default categories:', error.message);
  }
};

// Run seed check
seedDefaultCategories();

// @desc    Get all categories (system defaults + user custom)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { userId: null },
        { userId: req.user._id }
      ]
    }).sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a custom category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if category already exists for this user or as default (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      $or: [
        { userId: null },
        { userId: req.user._id }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: trimmedName,
      userId: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id // Ensure user can only delete their own custom categories
    });

    if (!category) {
      return res.status(404).json({ message: 'Custom category not found or unauthorized' });
    }

    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  seedDefaultCategories
};
