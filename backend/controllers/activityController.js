const ActivityLog = require('../models/ActivityLog');

// @desc    Get user's recent activity logs
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 15;
    
    const logs = await ActivityLog.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('todoId', 'title')
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};
