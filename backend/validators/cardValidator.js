const validateCard = (req, res, next) => {
  // Skip full validation for partial toggle updates (pin / favourite toggles)
  if (req.method === 'PUT' && (req.body.isPinned !== undefined || req.body.isFavourite !== undefined) && !req.body.title) {
    return next();
  }

  const { title, description, category, tags, language } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (title.length > 150) {
    return res.status(400).json({ message: 'Title cannot exceed 150 characters' });
  }

  if (!description || description.trim() === '') {
    return res.status(400).json({ message: 'Description is required' });
  }

  if (!category || category.trim() === '') {
    return res.status(400).json({ message: 'Category is required' });
  }

  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ message: 'Tags must be an array of strings' });
  }

  if (language && typeof language !== 'string') {
    return res.status(400).json({ message: 'Language must be a string value' });
  }

  next();
};

module.exports = {
  validateCard,
};
