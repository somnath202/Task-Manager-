import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '../utils/zodResolver';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Lock, ArrowLeft } from 'lucide-react';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await resetPassword(token, data.password);
    setLoading(false);
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white">Create New Password</h2>
        <p className="text-xs text-slate-400">Enter a secure, unique password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          id="password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
          className="text-white"
          {...register('password')}
        />

        <Input
          label="Confirm New Password"
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
          Update Password
        </Button>
        
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
