import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';

// Layouts & Guard
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TodoBoard = React.lazy(() => import('./pages/TodoBoard'));
const CalendarView = React.lazy(() => import('./pages/CalendarView'));
const Archive = React.lazy(() => import('./pages/Archive'));
const Trash = React.lazy(() => import('./pages/Trash'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="flex h-full w-full min-h-[40vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      <p className="text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500 animate-pulse">Loading view...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TodoProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                fontSize: '13px'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff'
                }
              }
            }}
          />
          <React.Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>

              {/* Protected Dashboard/App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<TodoBoard />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/trash" element={<Trash />} />
                <Route path="/settings" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </React.Suspense>
        </TodoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
