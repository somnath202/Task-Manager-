const Todo = require('../models/Todo');
const ActivityLog = require('../models/ActivityLog');

// Helper to log user activities
const logActivity = async (userId, action, details, todoId) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
      todoId
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

// @desc    Get all user todos with filtering, sorting, pagination & search
// @route   GET /api/todos
// @access  Private
exports.getTodos = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      dueDate,
      sortBy,
      page = 1,
      limit = 10,
      tab = 'standard' // standard, archived, trashed, favorites, pinned
    } = req.query;

    const query = { user: req.user.id };

    // Apply Tab filtering
    if (tab === 'archived') {
      query.isArchived = true;
      query.isTrashed = false;
    } else if (tab === 'trashed') {
      query.isTrashed = true;
    } else if (tab === 'favorites') {
      query.isFavorite = true;
      query.isTrashed = false;
    } else if (tab === 'pinned') {
      query.isPinned = true;
      query.isTrashed = false;
    } else {
      // standard tab
      query.isArchived = false;
      query.isTrashed = false;
    }

    // Apply search filter
    if (search) {
      // Use text search or regex
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply basic filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (category) {
      query.category = category.toLowerCase();
    }

    // Apply Due Date filter
    if (dueDate) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (dueDate === 'today') {
        query.dueDate = { $gte: startOfToday, $lte: endOfToday };
      } else if (dueDate === 'tomorrow') {
        const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        const endOfTomorrow = new Date(endOfToday.getTime() + 24 * 60 * 60 * 1000);
        query.dueDate = { $gte: startOfTomorrow, $lte: endOfTomorrow };
      } else if (dueDate === 'this_week') {
        // Find end of current week (Saturday or Sunday depending on calendar, let's say next 7 days)
        const next7Days = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
        query.dueDate = { $gte: startOfToday, $lte: next7Days };
      } else if (dueDate === 'overdue') {
        query.dueDate = { $lt: startOfToday };
        query.status = { $ne: 'completed' };
      }
    }

    // Pagination calculations
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting definition
    let sortOptions = { order: 1, createdAt: -1 }; // default: order first, then newest
    if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'priority') {
      // Custom priority sort (requires mapping logic or sorting high, medium, low)
      // Since Mongoose sort is alphabetical by string, high/medium/low will sort as high, low, medium.
      // We can sort by priority index or handle locally. To sort in DB, we'll sort by priority.
      // High comes first.
      sortOptions = { priority: 1, createdAt: -1 };
    } else if (sortBy === 'dueDate') {
      sortOptions = { dueDate: 1, createdAt: -1 };
    } else if (sortBy === 'alphabetical') {
      sortOptions = { title: 1 };
    }

    // Execute query
    const todos = await Todo.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Todo.countDocuments(query);

    // Compute aggregation data for dashboard if page === 1 and standard tab (or always)
    // To make it efficient, we can compute stats. Let's do it in a separate route or return with the response.
    // Returning stats with the response makes it very convenient! Let's return counts.
    const statsQuery = { user: req.user.id, isTrashed: false, isArchived: false };
    
    // We'll run a quick count for stats
    const totalActive = await Todo.countDocuments(statsQuery);
    const completedCount = await Todo.countDocuments({ ...statsQuery, completed: true });
    const pendingCount = await Todo.countDocuments({ ...statsQuery, status: 'pending' });
    const inProgressCount = await Todo.countDocuments({ ...statsQuery, status: 'in_progress' });
    const overdueCount = await Todo.countDocuments({
      ...statsQuery,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) }
    });

    res.status(200).json({
      success: true,
      count: todos.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      stats: {
        total: totalActive,
        completed: completedCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        overdue: overdueCount,
        completionRate: totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0
      },
      todos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private
exports.createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, category, dueDate, recurring } = req.body;

    // Get the maximum order value to place this new todo at the end
    const lastTodo = await Todo.findOne({ user: req.user.id, isTrashed: false, isArchived: false })
      .sort({ order: -1 })
      .select('order');
    const order = lastTodo ? lastTodo.order + 1 : 0;

    const todo = await Todo.create({
      title,
      description,
      priority,
      category: category ? category.toLowerCase() : 'personal',
      dueDate,
      recurring,
      order,
      user: req.user.id
    });

    await logActivity(req.user.id, 'created_todo', `Created task: "${todo.title}"`, todo._id);

    res.status(201).json({
      success: true,
      todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = async (req, res, next) => {
  try {
    let todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    const fieldsToUpdate = [
      'title',
      'description',
      'priority',
      'category',
      'dueDate',
      'status',
      'recurring',
      'completed',
      'isFavorite',
      'isPinned',
      'isArchived',
      'isTrashed'
    ];

    let changes = [];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Track changes for activity log
        if (todo[field] !== req.body[field]) {
          changes.push(`${field} changed to ${req.body[field]}`);
        }
        
        todo[field] = req.body[field];

        // Ensure synchronization between completed boolean and completed status
        if (field === 'completed') {
          todo.status = req.body.completed ? 'completed' : 'pending';
        } else if (field === 'status') {
          todo.completed = req.body.status === 'completed';
        }

        // Handle soft deletion date
        if (field === 'isTrashed') {
          todo.deletedAt = req.body.isTrashed ? new Date() : undefined;
        }
      }
    });

    await todo.save();

    if (changes.length > 0) {
      await logActivity(
        req.user.id,
        'updated_todo',
        `Updated task "${todo.title}": ${changes.join(', ')}`,
        todo._id
      );
    }

    res.status(200).json({
      success: true,
      todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a todo (permanently or soft delete depending on trash state)
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    // If it's already in the trash, delete it permanently
    if (todo.isTrashed) {
      await Todo.deleteOne({ _id: todo._id });
      await logActivity(req.user.id, 'deleted_todo_permanent', `Permanently deleted task: "${todo.title}"`);
      return res.status(200).json({
        success: true,
        message: 'Todo permanently deleted',
        todoId: todo._id
      });
    }

    // Otherwise, move to trash (soft delete)
    todo.isTrashed = true;
    todo.deletedAt = new Date();
    await todo.save();

    await logActivity(req.user.id, 'trashed_todo', `Moved task to trash: "${todo.title}"`, todo._id);

    res.status(200).json({
      success: true,
      message: 'Todo moved to trash',
      todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick status change (Mark complete / undo complete)
// @route   PATCH /api/todos/:id/status
// @access  Private
exports.patchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required' });
    }

    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    todo.status = status;
    todo.completed = status === 'completed';
    await todo.save();

    const activityAction = status === 'completed' ? 'completed_todo' : 'updated_todo_status';
    await logActivity(
      req.user.id,
      activityAction,
      `Marked task "${todo.title}" as ${status}`,
      todo._id
    );

    res.status(200).json({
      success: true,
      todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder todos (for Drag-and-Drop)
// @route   PUT /api/todos/reorder
// @access  Private
exports.reorderTodos = async (req, res, next) => {
  try {
    const { todoIds } = req.body; // Array of IDs in the new order

    if (!Array.isArray(todoIds)) {
      return res.status(400).json({ success: false, message: 'Array of todo IDs is required' });
    }

    // Perform bulk writes or update in sequence
    // Since drag and drop is user-specific, we'll update their order fields
    const bulkOps = todoIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user: req.user.id },
        update: { order: index }
      }
    }));

    await Todo.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Todos reordered successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories breakdown for current user
// @route   GET /api/todos/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Todo.distinct('category', {
      user: req.user.id,
      isTrashed: false,
      isArchived: false
    });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};
