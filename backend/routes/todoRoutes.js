const express = require('express');
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  patchStatus,
  reorderTodos,
  getCategories
} = require('../controllers/todoController');

const { protect } = require('../middlewares/auth');
const { validate } = require('../validators/validator');
const { todoRules } = require('../validators/schemas');

const router = express.Router();

// Apply auth protection to all todo routes
router.use(protect);

router.route('/')
  .get(getTodos)
  .post(todoRules, validate, createTodo);

router.put('/reorder', reorderTodos);
router.get('/categories', getCategories);

router.route('/:id')
  .put(todoRules, validate, updateTodo)
  .delete(deleteTodo);

router.patch('/:id/status', patchStatus);

module.exports = router;
