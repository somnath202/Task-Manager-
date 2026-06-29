import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  const { user } = useAuth();

  // If user is already logged in, redirect them to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      {/* Premium background radial and linear gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.1),transparent_50%)]"></div>
      
      {/* Decorative moving blur shapes */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-[80px] animate-pulse"></div>
      <div className="bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px] animate-pulse delay-75"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="z-10 w-full max-w-md"
      >
        {/* Main Logo & Title */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-lg shadow-indigo-500/20 mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TaskFlow</h1>
          <p className="mt-1 text-sm text-slate-400">Streamline your workflow in high definition</p>
        </div>

        {/* Auth Glass Card Panel */}
        <div className="glass-panel w-full rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
