import React, { useState, useEffect } from 'react';
import { useTodo } from '../context/TodoContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '../utils/zodResolver';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Dialog from '../components/Dialog';
import { TodoSkeleton } from '../components/Skeleton';
import {
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Pin,
  Star,
  Trash2,
  Archive,
  Edit2,
  Calendar,
  AlertCircle,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Circle,
  HelpCircle,
  HelpCircle as Tag,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.string().optional().or(z.literal('')),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly'])
});

const TodoBoard = () => {
  const {
    todos,
    categories,
    loading,
    pagination,
    filters,
    setFilters,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    addCustomCategory,
    refreshTodos
  } = useTodo();

  const [viewMode, setViewMode] = useState('list'); // list or board
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [customCatOpen, setCustomCatOpen] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      category: 'personal',
      dueDate: '',
      recurring: 'none'
    }
  });

  // Listen to keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Press 'n' (without input focus) to open new task modal
      if (
        e.key.toLowerCase() === 'n' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        document.activeElement.tagName !== 'SELECT' &&
        !modalOpen
      ) {
        e.preventDefault();
        openCreateModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  const openCreateModal = () => {
    setEditingTodo(null);
    reset({
      title: '',
      description: '',
      priority: 'medium',
      category: 'personal',
      dueDate: '',
      recurring: 'none'
    });
    setModalOpen(true);
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    reset({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority || 'medium',
      category: todo.category || 'personal',
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
      recurring: todo.recurring || 'none'
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined
    };

    let result;
    if (editingTodo) {
      result = await updateTodo(editingTodo._id, formattedData);
    } else {
      result = await createTodo(formattedData);
    }

    if (result.success) {
      setModalOpen(false);
    }
  };

  const handleCustomCategoryAdd = () => {
    const cat = customCatName.trim().toLowerCase();
    if (!cat) return;
    addCustomCategory(cat);
    setValue('category', cat);
    setCustomCatName('');
    setCustomCatOpen(false);
    toast.success(`Custom category "${cat}" added!`);
  };

  // Drag and Drop (HTML5 Standard)
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      await reorderTodos(draggedId, targetId);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  // Render priority badges
  const getPriorityBadge = (prio) => {
    const styles = {
      high: 'bg-red-500/10 text-red-500 border border-red-500/20',
      medium: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      low: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${styles[prio]}`}>
        {prio}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Filter, Search and Actions Header Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#0c1220]/45 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/50 shadow-sm backdrop-blur-xl">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-11 pr-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
              showFilters
                ? 'bg-indigo-500/10 text-indigo-500 border-indigo-550/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            title="Filters"
          >
            <Filter className="h-4.5 w-4.5" />
          </button>

          {/* Toggle list/board view */}
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900/40">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#0f172a] shadow-sm text-indigo-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-[#0f172a] shadow-sm text-indigo-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={openCreateModal}
            variant="primary"
            size="sm"
            icon={Plus}
            className="hidden sm:inline-flex"
          >
            New Task <kbd className="hidden lg:inline ml-1 text-[10px] opacity-60">N</kbd>
          </Button>
        </div>
      </div>

      {/* 2. Expanded Filter Options Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-white dark:bg-[#0c1220]/45 p-5 border border-slate-200/80 dark:border-slate-800/50 shadow-inner grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                label="Status"
                placeholder="All Statuses"
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value })}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' }
                ]}
              />
              <Select
                label="Priority"
                placeholder="All Priorities"
                value={filters.priority}
                onChange={(e) => setFilters({ priority: e.target.value })}
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]}
              />
              <Select
                label="Category"
                placeholder="All Categories"
                value={filters.category}
                onChange={(e) => setFilters({ category: e.target.value })}
                options={categories.map((c) => ({ value: c, label: c.toUpperCase() }))}
              />
              <Select
                label="Due Date"
                placeholder="Any Due Date"
                value={filters.dueDate}
                onChange={(e) => setFilters({ dueDate: e.target.value })}
                options={[
                  { value: 'today', label: 'Today' },
                  { value: 'tomorrow', label: 'Tomorrow' },
                  { value: 'this_week', label: 'This Week' },
                  { value: 'overdue', label: 'Overdue' }
                ]}
              />
              <Select
                label="Sort By"
                value={filters.sortBy}
                onChange={(e) => setFilters({ sortBy: e.target.value })}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'priority', label: 'Priority Sort' },
                  { value: 'dueDate', label: 'Due Date Sort' },
                  { value: 'alphabetical', label: 'Alphabetical (A-Z)' }
                ]}
              />
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilters({
                      search: '',
                      status: '',
                      priority: '',
                      category: '',
                      dueDate: '',
                      sortBy: 'newest',
                      page: 1
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Tasks Content */}
      {loading && todos.length === 0 ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <TodoSkeleton key={i} />)}
        </div>
      ) : todos.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center space-y-4"
        >
          <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-550 border border-indigo-500/15">
            <CheckCircle2 className="h-8 w-8 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No active tasks found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Create a new task to get started, or clear filters if you are searching for specific parameters.
            </p>
          </div>
          <Button onClick={openCreateModal} variant="primary" size="sm" icon={Plus}>
            Create Task
          </Button>
        </motion.div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3 select-none">
          {todos.map((todo) => {
            const isTargetOver = dragOverId === todo._id;
            return (
              <div
                key={todo._id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo._id)}
                onDragOver={(e) => handleDragOver(e, todo._id)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, todo._id)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing bg-white/40 dark:bg-[#0c1220]/45 backdrop-blur-xl ${
                  isTargetOver ? 'border-indigo-500 border-2 scale-[0.99] translate-y-1' : 'border-slate-200/80 dark:border-slate-800/50'
                } hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-sm`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Status complete checkbox */}
                  <button
                    onClick={() => updateTodo(todo._id, { completed: !todo.completed })}
                    className="mt-0.5 hover:scale-105 transition-transform text-slate-400 hover:text-indigo-550 shrink-0 cursor-pointer"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-semibold truncate ${todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                        {todo.title}
                      </h4>
                      {todo.isPinned && <Pin className="h-3 w-3 text-indigo-500 fill-indigo-500" />}
                      {todo.isFavorite && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                    </div>
                    {todo.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {todo.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 flex-wrap pt-1">
                      {todo.category && (
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-semibold">
                          <Tag className="h-2.5 w-2.5" />
                          {todo.category.toUpperCase()}
                        </span>
                      )}
                      {todo.dueDate && (
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-semibold">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {todo.recurring !== 'none' && (
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-semibold">
                          🔄 {todo.recurring}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Operations Side */}
                <div className="flex items-center gap-2 mt-4 sm:mt-0 justify-end border-t border-slate-100 dark:border-slate-800/50 pt-3 sm:pt-0 sm:border-0">
                  {getPriorityBadge(todo.priority)}

                  <button
                    onClick={() => updateTodo(todo._id, { isPinned: !todo.isPinned })}
                    className={`p-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors ${
                      todo.isPinned ? 'border-indigo-100 dark:border-indigo-950/20 text-indigo-500 bg-indigo-50/20' : 'border-transparent'
                    }`}
                  >
                    <Pin className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => updateTodo(todo._id, { isFavorite: !todo.isFavorite })}
                    className={`p-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors ${
                      todo.isFavorite ? 'border-amber-100 dark:border-amber-950/20 text-amber-500 bg-amber-50/20' : 'border-transparent'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(todo)}
                    className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent text-slate-400 hover:text-indigo-550 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => updateTodo(todo._id, { isArchived: true })}
                    className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent text-slate-400 hover:text-indigo-550 transition-colors"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => deleteTodo(todo._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent text-slate-400 hover:text-red-550 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Board View (Kanban Board by Status) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
          {['pending', 'in_progress', 'completed'].map((statusKey) => {
            const statusTodos = todos.filter((t) => t.status === statusKey);
            const statusNames = {
              pending: 'Pending',
              in_progress: 'In Progress',
              completed: 'Completed'
            };
            const columnColor = {
              pending: 'border-t-indigo-500 bg-indigo-500/5',
              in_progress: 'border-t-amber-500 bg-amber-500/5',
              completed: 'border-t-emerald-500 bg-emerald-500/5'
            };

            return (
              <div
                key={statusKey}
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData('text/plain');
                  if (sourceId) {
                    await updateTodo(sourceId, { status: statusKey });
                  }
                }}
                className={`rounded-3xl border border-slate-200 dark:border-slate-800 p-4 border-t-4 ${columnColor[statusKey]} flex flex-col min-h-[500px] bg-white/30 dark:bg-[#0c1220]/25 backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {statusNames[statusKey]}
                  </h4>
                  <span className="text-xs bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                    {statusTodos.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {statusTodos.map((todo) => (
                    <div
                      key={todo._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, todo._id)}
                      onDragOver={(e) => handleDragOver(e, todo._id)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, todo._id)}
                      className={`p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 bg-white/80 dark:bg-[#0f172a]/60 shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-350 dark:hover:border-slate-700/80 transition-all ${
                        dragOverId === todo._id ? 'border-indigo-500 border-2 translate-y-1' : ''
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                            {todo.title}
                          </h5>
                          <div className="flex gap-0.5 shrink-0">
                            {todo.isPinned && <Pin className="h-3 w-3 text-indigo-500 fill-indigo-500" />}
                            {todo.isFavorite && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                          </div>
                        </div>

                        {todo.description && (
                          <p className="text-[10px] sm:text-xs text-slate-550 dark:text-slate-400 line-clamp-2">
                            {todo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {todo.category && (
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded font-semibold text-slate-400">
                              {todo.category.toUpperCase()}
                            </span>
                          )}
                          {todo.dueDate && (
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded font-semibold text-slate-400">
                              {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-2">
                          {getPriorityBadge(todo.priority)}

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(todo)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTodo(todo._id)}
                              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-550 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Pagination Footer Controls (only show in list view) */}
      {viewMode === 'list' && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            onClick={() => setFilters({ page: pagination.page - 1 })}
            disabled={pagination.page <= 1}
            variant="outline"
            size="sm"
            icon={ChevronLeft}
          >
            Prev
          </Button>
          <span className="text-xs font-semibold text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            onClick={() => setFilters({ page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.totalPages}
            variant="outline"
            size="sm"
            icon={ChevronRight}
          >
            Next
          </Button>
        </div>
      )}

      {/* 5. Floating Action Button (FAB) for quick task adding */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-xl shadow-indigo-550/20 flex items-center justify-center z-30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-indigo-400/20 hover:bg-indigo-600 transition-colors"
        title="Add Task (Shortcut: N)"
      >
        <Plus className="h-7 w-7" />
      </motion.button>

      {/* 6. Dialog Modal for Create / Edit Todo */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTodo ? 'Edit Task Details' : 'Create New Task'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Task Title"
            id="title"
            placeholder="Complete final project deliverables"
            error={errors.title}
            {...register('title')}
          />

          <div className="flex flex-col text-left gap-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
              Task Description
            </label>
            <textarea
              id="description"
              placeholder="Provide context, references, or links..."
              rows={3}
              className="w-full px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0c1220]/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              id="priority"
              options={[
                { value: 'low', label: 'Low (emerald)' },
                { value: 'medium', label: 'Medium (amber)' },
                { value: 'high', label: 'High (red)' }
              ]}
              error={errors.priority}
              {...register('priority')}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="category" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setCustomCatOpen(true)}
                  className="text-[10px] text-indigo-500 font-bold hover:underline inline-flex items-center gap-0.5"
                >
                  <FolderPlus className="h-3 w-3" /> New
                </button>
              </div>
              <select
                id="category"
                className="w-full py-2.5 px-4.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0c1220]/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white"
                {...register('category')}
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#0f172a]">
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              id="dueDate"
              type="date"
              error={errors.dueDate}
              {...register('dueDate')}
            />

            <Select
              label="Recurring Action"
              id="recurring"
              options={[
                { value: 'none', label: 'None' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ]}
              error={errors.recurring}
              {...register('recurring')}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Button onClick={() => setModalOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingTodo ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Mini dialog for creating custom categories */}
      <Dialog
        isOpen={customCatOpen}
        onClose={() => setCustomCatOpen(false)}
        title="Add Custom Category"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="Marketing, Fitness, Cooking"
            value={customCatName}
            onChange={(e) => setCustomCatName(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button onClick={() => setCustomCatOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button onClick={handleCustomCategoryAdd} variant="primary" size="sm">
              Add Category
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default TodoBoard;
