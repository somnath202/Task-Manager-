const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  todoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// TTL index to automatically remove logs older than 30 days to keep database clean
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
