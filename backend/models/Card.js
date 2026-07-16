const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select or add a category'],
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['local', 'global'],
      default: 'local',
      index: true,
    },
    createdBy: {
      type: String,
      default: '',
    },
    favouritedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    favouritedCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound text index for search functionality, disabling the default language override behavior
cardSchema.index(
  { title: 'text', description: 'text', category: 'text', tags: 'text' },
  { language_override: 'dummy_field' }
);

module.exports = mongoose.model('Card', cardSchema);
