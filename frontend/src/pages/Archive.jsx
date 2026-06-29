import React, { useEffect } from 'react';
import { useTodo } from '../context/TodoContext';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { TodoSkeleton } from '../components/Skeleton';
import { ArchiveRestore, Trash2, FolderPlus, Inbox } from 'lucide-react';

const Archive = () => {
  const { todos, loading, filters, setFilters, updateTodo, deleteTodo, refreshTodos } = useTodo();

  // Enforce archived tab filtering on mount
  useEffect(() => {
    setFilters({ tab: 'archived', page: 1 });
  }, []);

  if (loading && todos.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <TodoSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/50 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Task Archive</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review completed projects or inactive workflows stored here.
          </p>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <div className="h-14 w-14 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-550 border border-indigo-500/15">
            <Inbox className="h-7 w-7 text-indigo-550" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Archive is empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Move tasks to archive from your main board to clean up your workspace.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <motion.div
              key={todo._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/55 bg-white/40 dark:bg-[#0c1220]/45 backdrop-blur-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
                  {todo.title}
                </h4>
                {todo.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-455 line-clamp-1 mt-0.5">
                    {todo.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                  <span className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-semibold">
                    {todo.category.toUpperCase()}
                  </span>
                  {todo.dueDate && (
                    <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Button
                  onClick={() => updateTodo(todo._id, { isArchived: false })}
                  variant="outline"
                  size="sm"
                  icon={ArchiveRestore}
                  className="!px-3 !py-2"
                >
                  Unarchive
                </Button>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="p-2 border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-slate-400 hover:text-red-550 rounded-xl transition-colors"
                  title="Move to Trash"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Archive;
