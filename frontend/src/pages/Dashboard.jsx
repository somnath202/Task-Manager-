import React, { useEffect, useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import { DashboardSkeleton } from '../components/Skeleton';
import {
  ListTodo,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Dashboard = () => {
  const { todos, stats, activities, loading, refreshTodos, refreshActivities } = useTodo();
  const [todayTasksCount, setTodayTasksCount] = useState(0);

  useEffect(() => {
    refreshTodos();
    refreshActivities();
  }, [refreshTodos, refreshActivities]);

  // Compute today's tasks
  useEffect(() => {
    if (todos) {
      const today = new Date().toDateString();
      const count = todos.filter((todo) => {
        if (!todo.dueDate) return false;
        return new Date(todo.dueDate).toDateString() === today && !todo.isTrashed;
      }).length;
      setTodayTasksCount(count);
    }
  }, [todos]);

  if (loading && todos.length === 0) {
    return <DashboardSkeleton />;
  }

  // Format charts data
  const getCategoryData = () => {
    const counts = {};
    todos.forEach((todo) => {
      if (!todo.isTrashed && !todo.isArchived) {
        const cat = todo.category || 'personal';
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }));
  };

  const getPriorityData = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    todos.forEach((todo) => {
      if (!todo.isTrashed && !todo.isArchived) {
        counts[todo.priority] = (counts[todo.priority] || 0) + 1;
      }
    });

    return [
      { name: 'High', count: counts.high, fill: '#ef4444' },
      { name: 'Medium', count: counts.medium, fill: '#f59e0b' },
      { name: 'Low', count: counts.low, fill: '#10b981' }
    ];
  };

  const categoryData = getCategoryData();
  const priorityData = getPriorityData();

  const statCards = [
    {
      title: 'Total Active Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'text-indigo-500 bg-indigo-550/10 dark:bg-indigo-500/10',
      description: 'Tasks in active pipelines'
    },
    {
      title: 'Completed Tasks',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-emerald-505 bg-emerald-500/10 dark:bg-emerald-500/10',
      description: `${stats.completionRate}% completion rate`
    },
    {
      title: 'Pending / In Progress',
      value: stats.pending + stats.inProgress,
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/10',
      description: `${stats.pending} pending, ${stats.inProgress} in progress`
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'text-red-500 bg-red-500/10 dark:bg-red-500/10',
      description: 'Requires urgent action'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-550 to-indigo-600 dark:from-indigo-950/40 dark:to-indigo-900/30 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-950/20 text-indigo-950 dark:text-indigo-200 shadow-sm"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 dark:text-white">
            Hello Planner! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm mt-1 opacity-80">
            You have <span className="font-bold">{todayTasksCount}</span> tasks scheduled for today, and your current completion rate is <span className="font-bold">{stats.completionRate}%</span>.
          </p>
        </div>
        <Link to="/tasks">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-white dark:bg-indigo-500 text-indigo-650 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-indigo-600 transition-colors shrink-0"
          >
            Manage Tasks
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card hover className="flex flex-col justify-between h-full bg-white dark:bg-[#0c1220]/40">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{card.value}</h3>
                <p className="text-[10px] sm:text-xs text-slate-550 dark:text-slate-400 mt-1">{card.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Completion Percentage Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-[#0c1220]/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
              Productivity Target
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats.completionRate}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full"
            />
          </div>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-white dark:bg-[#0c1220]/40 h-80 flex flex-col">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <CalendarDays className="h-4.5 w-4.5 text-indigo-500" />
              Category Breakdown
            </h3>
            <div className="flex-1 w-full flex items-center justify-center">
              {categoryData.length === 0 ? (
                <div className="text-xs text-slate-500 py-10">No categories found in active tasks.</div>
              ) : (
                <ResponsiveContainer width="100%" height="95%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-[#0c1220]/40 h-80 flex flex-col">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
              Priority Task Count
            </h3>
            <div className="flex-1 w-full">
              {todos.filter((t) => !t.isArchived && !t.isTrashed).length === 0 ? (
                <div className="text-xs text-slate-500 py-10 flex items-center justify-center h-full">No priority tasks to chart.</div>
              ) : (
                <ResponsiveContainer width="100%" height="95%">
                  <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="bg-white dark:bg-[#0c1220]/40">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Activity className="h-4.5 w-4.5 text-indigo-500" />
            Recent Activity Feed
          </h3>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 pl-1">No activities logged yet.</p>
            ) : (
              activities.slice(0, 10).map((log, idx) => (
                <div key={log._id || idx} className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 animate-ping"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-slate-200">{log.details || log.action}</p>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
