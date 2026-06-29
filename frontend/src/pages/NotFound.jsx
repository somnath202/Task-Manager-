import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Floating 404 Text */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="relative"
      >
        <h1 className="text-8xl sm:text-9xl font-extrabold tracking-widest text-indigo-500/10 dark:text-indigo-400/5 select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertCircle className="h-16 w-16 text-indigo-500 animate-pulse" />
        </div>
      </motion.div>

      {/* Helper message */}
      <h2 className="text-xl sm:text-2xl font-bold mt-6 text-slate-800 dark:text-slate-100">
        Page Not Found
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
        The route you are trying to access doesn't exist, or you might not have authorization to view it.
      </p>

      {/* Button to go home */}
      <Link to="/dashboard" className="mt-8">
        <Button variant="primary" size="md" icon={Home}>
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
