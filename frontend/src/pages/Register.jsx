import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '../utils/zodResolver';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Lock, User } from 'lucide-react';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Can only contain letters, numbers, and underscores'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const Register = () => {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await signUp(data.username, data.email, data.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white">Create Account</h2>
        <p className="text-xs text-slate-400">Sign up to unlock premium tracking widgets</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          id="username"
          placeholder="johndoe"
          icon={User}
          error={errors.username}
          className="text-white"
          {...register('username')}
        />

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

        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword}
          className="text-white"
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
        >
          Sign Up
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
