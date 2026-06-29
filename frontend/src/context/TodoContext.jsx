import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const TodoContext = createContext(null);

export const TodoProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [todos, setTodos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState(['work', 'personal', 'study', 'shopping', 'health']);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [filters, setFiltersState] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    dueDate: '',
    sortBy: 'newest',
    page: 1,
    tab: 'standard' // standard, archived, trashed, favorites, pinned
  });

  // Keep a reference to original todos in case we need to rollback optimistic updates
  const previousTodosRef = useRef([]);

  const setFilters = (newFilters) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      // If setting a filter that changes content, reset page to 1
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  };

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, val);
        }
      });

      const response = await api.get(`/todos?${queryParams.toString()}`);
      if (response.success) {
        setTodos(response.todos);
        setStats(response.stats);
        setPagination(response.pagination);
        previousTodosRef.current = response.todos; // update rollback reference
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Fetch todos failed:', error.message);
      }
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/activities?limit=15');
      if (response.success) {
        setActivities(response.logs);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Fetch activities failed:', error.message);
      }
    }
  }, [user]);

  // Fetch unique categories
  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/todos/categories');
      if (response.success) {
        // Merge default categories with custom categories from database
        const defaultCats = ['work', 'personal', 'study', 'shopping', 'health'];
        const uniqueCats = Array.from(new Set([...defaultCats, ...response.categories]));
        setCategories(uniqueCats);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Fetch categories failed:', error.message);
      }
    }
  }, [user]);

  // Trigger data loads when filters or user changes
  useEffect(() => {
    if (user) {
      fetchTodos();
      fetchActivities();
      fetchCategories();
    } else {
      setTodos([]);
      setActivities([]);
      setPagination({ page: 1, limit: 10, totalPages: 1 });
    }
  }, [user, filters, fetchTodos, fetchActivities, fetchCategories]);

  // Create Todo
  const createTodo = async (todoData) => {
    try {
      const response = await api.post('/todos', todoData);
      if (response.success) {
        toast.success('Task created successfully');
        fetchTodos();
        fetchActivities();
        fetchCategories();
        return { success: true, todo: response.todo };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
      return { success: false, error: error.message };
    }
  };

  // Update Todo with Optimistic UI updates
  const updateTodo = async (id, updateData) => {
    // 1. Optimistic Update (local state mutation)
    const originalTodos = [...todos];
    setTodos((prevTodos) =>
      prevTodos.map((todo) => {
        if (todo._id === id) {
          const updatedTodo = { ...todo, ...updateData };
          
          // Sync complete status variables if they exist in updates
          if (updateData.completed !== undefined) {
            updatedTodo.status = updateData.completed ? 'completed' : 'pending';
          } else if (updateData.status !== undefined) {
            updatedTodo.completed = updateData.status === 'completed';
          }
          
          return updatedTodo;
        }
        return todo;
      })
    );

    // Dynamic stats computation for immediate feedback
    if (updateData.completed !== undefined || updateData.status !== undefined) {
      setStats((prevStats) => {
        const wasCompleted = originalTodos.find((t) => t._id === id)?.completed;
        const isCompleted = updateData.completed !== undefined ? updateData.completed : updateData.status === 'completed';
        
        if (wasCompleted === isCompleted) return prevStats;
        
        const completedChange = isCompleted ? 1 : -1;
        const pendingChange = isCompleted ? -1 : 1;
        const completed = prevStats.completed + completedChange;
        
        return {
          ...prevStats,
          completed,
          pending: prevStats.pending + pendingChange,
          completionRate: prevStats.total > 0 ? Math.round((completed / prevStats.total) * 100) : 0
        };
      });
    }

    try {
      const response = await api.put(`/todos/${id}`, updateData);
      if (response.success) {
        // Sync state with server-returned data (for timestamps, etc.)
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo._id === id ? response.todo : todo))
        );
        fetchActivities(); // Refresh activity log
        fetchCategories(); // Refresh categories
        return { success: true, todo: response.todo };
      }
    } catch (error) {
      // 2. Rollback on failure
      setTodos(originalTodos);
      fetchTodos(); // fully sync again
      toast.error(error.message || 'Failed to update task');
      return { success: false, error: error.message };
    }
  };

  // Quick helper to patch status
  const patchStatus = async (id, status) => {
    return updateTodo(id, { status });
  };

  // Delete Todo (soft or permanent) with Optimistic UI updates
  const deleteTodo = async (id) => {
    const originalTodos = [...todos];
    const targetTodo = todos.find((t) => t._id === id);
    
    if (!targetTodo) return { success: false, error: 'Task not found' };

    const isPermanentDelete = targetTodo.isTrashed;

    // 1. Optimistic Update (remove from UI list or mark as trashed)
    setTodos((prevTodos) => {
      if (isPermanentDelete) {
        return prevTodos.filter((t) => t._id !== id);
      } else {
        // Soft delete: filter out if we are not in the trashed tab
        if (filters.tab !== 'trashed') {
          return prevTodos.filter((t) => t._id !== id);
        } else {
          // If in trashed tab, update flags (shouldn't happen directly but for safety)
          return prevTodos.map((t) => (t._id === id ? { ...t, isTrashed: true } : t));
        }
      }
    });

    // Update stats count locally for immediate response
    if (!isPermanentDelete) {
      setStats((prevStats) => {
        const total = prevStats.total - 1;
        const completed = targetTodo.completed ? prevStats.completed - 1 : prevStats.completed;
        const pending = !targetTodo.completed ? prevStats.pending - 1 : prevStats.pending;
        return {
          ...prevStats,
          total,
          completed,
          pending,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      });
    }

    try {
      const response = await api.delete(`/todos/${id}`);
      if (response.success) {
        toast.success(isPermanentDelete ? 'Task permanently deleted' : 'Task moved to trash');
        fetchActivities();
        return { success: true };
      }
    } catch (error) {
      // 2. Rollback on failure
      setTodos(originalTodos);
      fetchTodos();
      toast.error(error.message || 'Failed to delete task');
      return { success: false, error: error.message };
    }
  };

  // Local reorder helper + API synchronization for drag and drop
  const reorderTodos = async (draggedId, targetId) => {
    const originalTodos = [...todos];
    
    // Find index of dragged and target elements
    const draggedIndex = todos.findIndex((t) => t._id === draggedId);
    const targetIndex = todos.findIndex((t) => t._id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Rearrange locally
    const updatedTodos = [...todos];
    const [draggedItem] = updatedTodos.splice(draggedIndex, 1);
    updatedTodos.splice(targetIndex, 0, draggedItem);

    // Recompute order values locally
    const reorderedList = updatedTodos.map((todo, idx) => ({
      ...todo,
      order: idx
    }));

    setTodos(reorderedList);

    try {
      const todoIds = reorderedList.map((t) => t._id);
      const response = await api.put('/todos/reorder', { todoIds });
      if (response.success) {
        previousTodosRef.current = reorderedList;
      }
    } catch (error) {
      setTodos(originalTodos);
      toast.error('Failed to save todo order');
    }
  };

  // Add custom category locally so it can be selected in dropdowns
  const addCustomCategory = (categoryName) => {
    const formattedCat = categoryName.trim().toLowerCase();
    if (!formattedCat) return;
    if (!categories.includes(formattedCat)) {
      setCategories((prev) => [...prev, formattedCat]);
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        activities,
        categories,
        loading,
        stats,
        pagination,
        filters,
        setFilters,
        createTodo,
        updateTodo,
        patchStatus,
        deleteTodo,
        reorderTodos,
        addCustomCategory,
        refreshTodos: fetchTodos,
        refreshActivities: fetchActivities
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};
