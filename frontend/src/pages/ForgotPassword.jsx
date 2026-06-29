import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '../utils/zodResolver';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, ArrowLeft } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address')
});

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await forgotPassword(data.email);
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white">Reset Password</h2>
        <p className="text-xs text-slate-400">Request a recovery link to access your account</p>
      </div>

      {submitted ? (
        <div className="space-y-4 text-center">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
            A password recovery link has been simulated in the backend logs. In a real deployment, an email would be delivered.
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      ) : (
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

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={loading}
          >
            Send Link
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
      )}
    </div>
  );
};

export default ForgotPassword;
