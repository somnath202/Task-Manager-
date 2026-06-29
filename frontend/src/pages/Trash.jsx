import React, { useEffect } from 'react';
import { useTodo } from '../context/TodoContext';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { TodoSkeleton } from '../components/Skeleton';
import { RotateCcw, Trash2, ShieldAlert } from 'lucide-react';

const Trash = () => {
  const { todos, loading, setFilters, updateTodo, deleteTodo, refreshTodos } = useTodo();

  // Enforce trashed tab filtering on mount
  useEffect(() => {
    setFilters({ tab: 'trashed', page: 1 });
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
          <h2 className="text-xl font-bold tracking-tight">Trash Bin</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tasks in the trash can be restored or permanently removed.
          </p>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <div className="h-14 w-14 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-550 border border-indigo-500/15">
            <Trash2 className="h-7 w-7 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Trash is empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your workspace is tidy! Trashed items will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-amber-500/10 border border-amber-550/20 p-4 text-xs text-amber-500 font-semibold flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4.5 w-4.5 text-amber-550 shrink-0" />
            Warning: Deleting tasks here will permanently erase them from database records.
          </div>

          {todos.map((todo) => (
            <motion.div
              key={todo._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/55 bg-white/40 dark:bg-[#0c1220]/45 backdrop-blur-xl hover:border-slate-350 dark:hover:border-slate-700/80 transition-all shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold truncate text-slate-400 line-through">
                  {todo.title}
                </h4>
                {todo.description && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {todo.description}
                  </p>
                )}
                <div className="text-[10px] text-slate-500 mt-1">
                  Category: {todo.category.toUpperCase()}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Button
                  onClick={() => updateTodo(todo._id, { isTrashed: false })}
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  className="!px-3 !py-2"
                >
                  Restore
                </Button>
                <Button
                  onClick={() => deleteTodo(todo._id)}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  className="!px-3 !py-2 shadow-none"
                >
                  Delete Forever
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trash;
