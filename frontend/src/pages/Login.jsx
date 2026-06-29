import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '../utils/zodResolver';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // Calculate redirect route after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  // Check if session expired toast indicator is needed
  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white">Welcome Back</h2>
        <p className="text-xs text-slate-400">Log in to manage your productivity dashboard</p>
      </div>

      {isExpired && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-550/20 p-3 text-xs text-amber-400 text-center font-medium">
          Your session expired. Please log in again.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          error={errors.email}
          className="text-white"
          {...register('email')}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password}
            className="text-white"
            {...register('password')}
          />
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Login;
