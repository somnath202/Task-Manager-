import React, { useState, useEffect } from 'react';
import { useTodo } from '../context/TodoContext';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Tag, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const CalendarView = () => {
  const { todos, setFilters, updateTodo, refreshTodos } = useTodo();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Reset filter tab to standard when loading calendar view so we only show active todos
  useEffect(() => {
    setFilters({ tab: 'standard', page: 1 });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper calculations for calendar cells
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const startDayIndex = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get todos due on specific day (date is 1-indexed)
  const getTodosForDay = (day) => {
    return todos.filter((todo) => {
      if (!todo.dueDate || todo.isTrashed || todo.isArchived) return false;
      const todoDate = new Date(todo.dueDate);
      return (
        todoDate.getFullYear() === year &&
        todoDate.getMonth() === month &&
        todoDate.getDate() === day
      );
    });
  };

  // Drag-and-drop to reschedule due date
  const handleDragStart = (e, todoId) => {
    e.dataTransfer.setData('text/plain', todoId);
  };

  const handleDropOnDay = async (e, day) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('text/plain');
    if (todoId) {
      const newDueDate = new Date(year, month, day, 12, 0, 0).toISOString();
      const result = await updateTodo(todoId, { dueDate: newDueDate });
      if (result.success) {
        toast.success(`Task rescheduled to ${monthNames[month]} ${day}`);
      }
    }
  };

  // Build calendar matrix
  const cells = [];
  // Add empty slots for offset days of previous month
  for (let i = 0; i < startDayIndex; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-slate-100/20 dark:bg-[#0c1220]/15 min-h-[90px] border border-slate-150/40 dark:border-slate-850/30 rounded-2xl" />);
  }

  // Add days of the month
  for (let d = 1; d <= totalDays; d++) {
    const dayTodos = getTodosForDay(d);
    const isToday =
      d === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    cells.push(
      <div
        key={`day-${d}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDropOnDay(e, d)}
        className={`min-h-[100px] border p-2 flex flex-col justify-between transition-colors rounded-2xl bg-white/40 dark:bg-[#0c1220]/45 backdrop-blur-xl ${
          isToday
            ? 'border-indigo-500 ring-2 ring-indigo-550/10'
            : 'border-slate-200/80 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700/80'
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span
            className={`text-xs font-bold flex h-6 w-6 items-center justify-center rounded-full ${
              isToday ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-405'
            }`}
          >
            {d}
          </span>
          {dayTodos.length > 0 && (
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
              {dayTodos.length}
            </span>
          )}
        </div>

        {/* List items for this day */}
        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[70px] pr-0.5 scrollbar-thin">
          {dayTodos.map((todo) => {
            const priorityColors = {
              high: 'bg-red-500',
              medium: 'bg-amber-500',
              low: 'bg-emerald-500'
            };

            return (
              <div
                key={todo._id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo._id)}
                className={`p-1 text-[9px] font-semibold rounded-md flex items-center gap-1.5 cursor-grab active:cursor-grabbing border ${
                  todo.completed
                    ? 'bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500 border-transparent line-through'
                    : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border-slate-150 dark:border-slate-800/60 shadow-sm'
                }`}
                title={todo.title}
              >
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${priorityColors[todo.priority]}`} />
                <span className="truncate flex-1">{todo.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fill in trailing empty cells to align last row nicely
  const totalCells = cells.length;
  const remainingCells = 7 - (totalCells % 7);
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      cells.push(<div key={`empty-end-${i}`} className="bg-slate-100/20 dark:bg-[#0c1220]/15 min-h-[90px] border border-slate-150/40 dark:border-slate-850/30 rounded-2xl" />);
    }
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0c1220]/45 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/50 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/15 rounded-2xl flex items-center justify-center text-indigo-500">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Calendar Planner</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Drag tasks between cells to reschedule them.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={prevMonth} variant="outline" size="sm" icon={ChevronLeft} className="!p-2.5" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <Button onClick={nextMonth} variant="outline" size="sm" icon={ChevronRight} className="!p-2.5" />
        </div>
      </div>

      {/* Calendar Grid wrapper */}
      <Card className="bg-white dark:bg-[#0c1220]/40 p-4 border border-slate-200/80 dark:border-slate-800/50 shadow-sm">
        
        {/* Days of week headings */}
        <div className="grid grid-cols-7 gap-2.5 mb-2 text-center">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Monthly grid matrix */}
        <div className="grid grid-cols-7 gap-2.5 select-none">
          {cells}
        </div>
      </Card>
    </div>
  );
};

export default CalendarView;
