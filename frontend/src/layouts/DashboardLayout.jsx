import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Archive,
  Trash2,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  User,
  Plus
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, theme, selectTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Active Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Archive', path: '/archive', icon: Archive },
    { name: 'Trash Bin', path: '/trash', icon: Trash2 },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="h-5 w-5 text-amber-500" />;
    if (theme === 'dark') return <Moon className="h-5 w-5 text-indigo-400" />;
    return <Monitor className="h-5 w-5 text-slate-400" />;
  };

  const cycleTheme = () => {
    if (theme === 'light') selectTheme('dark');
    else if (theme === 'dark') selectTheme('system');
    else selectTheme('light');
  };

  return (
    <div className="relative flex min-h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      
      {/* Background decoration elements */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.03),transparent_50%)] pointer-events-none"></div>

      {/* 1. Sidebar - Desktop view */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-slate-200/80 dark:border-slate-800/50 bg-white/70 dark:bg-[#0c1220]/60 backdrop-blur-xl h-screen sticky top-0 z-20">
        <div className="flex h-16 items-center px-6 border-b border-slate-200/80 dark:border-slate-800/50">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-md shadow-indigo-500/10">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">TaskFlow</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card inside Sidebar */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/50 bg-slate-100/30 dark:bg-[#080d16]/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/20 font-bold uppercase overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                user?.username?.substring(0, 2)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{user?.username}</p>
              <p className="text-xs truncate text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-850 py-2.5 text-sm font-medium text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0c1220] border-r border-slate-250 dark:border-slate-800 flex flex-col shadow-xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white font-bold text-lg">TF</div>
                  <span className="font-bold text-lg">TaskFlow</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-slate-400" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 font-bold uppercase">
                    {user?.username?.substring(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{user?.username}</p>
                    <p className="text-xs truncate text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header/Navbar */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/50 bg-white/50 dark:bg-[#0c1220]/45 backdrop-blur-xl shrink-0 sticky top-0 z-10">
          
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Desktop dynamic heading */}
            <h2 className="hidden sm:block text-lg font-bold capitalize bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {location.pathname.substring(1).replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-4">
            
            {/* Dynamic theme switcher button */}
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60 hover:bg-slate-150 dark:hover:bg-slate-800/50 transition-colors shadow-sm"
              title={`Theme: ${theme}`}
            >
              {getThemeIcon()}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 cursor-pointer uppercase overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    user?.username?.substring(0, 2)
                  )}
                </div>
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setUserDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-30 flex flex-col"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-150 dark:border-slate-800 mb-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{user?.username}</p>
                      </div>
                      
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-650 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Actual page content */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
