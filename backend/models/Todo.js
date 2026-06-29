const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      default: 'personal',
      trim: true,
      lowercase: true
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    completed: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isTrashed: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    order: {
      type: Number,
      default: 0
    },
    recurring: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes to speed up filtering, sorting, and user-specific queries
TodoSchema.index({ user: 1, completed: 1, isTrashed: 1, isArchived: 1 });
TodoSchema.index({ user: 1, status: 1 });
TodoSchema.index({ user: 1, dueDate: 1 });
TodoSchema.index({ user: 1, order: 1 });
TodoSchema.index({ user: 1, title: 'text', description: 'text' }); // Text index for search

module.exports = mongoose.model('Todo', TodoSchema);
