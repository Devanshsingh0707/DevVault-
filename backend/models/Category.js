const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null indicates system default category
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot create duplicate categories, and system categories are unique
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
