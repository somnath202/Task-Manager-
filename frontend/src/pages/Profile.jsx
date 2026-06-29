import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '../utils/zodResolver';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { User, Mail, Lock, ShieldCheck, Palette, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Can only contain letters, numbers, and underscores'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  profileImage: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword']
});

const Profile = () => {
  const { user, updateProfile, changePassword, theme, selectTheme } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 1. Profile Form Setup
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      profileImage: user?.profileImage || ''
    }
  });

  // 2. Password Form Setup
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors }
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    const result = await updateProfile(data);
    setProfileLoading(false);
    if (result.success) {
      // success toast is handled in Context
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    const result = await changePassword(data.currentPassword, data.newPassword);
    setPasswordLoading(false);
    if (result.success) {
      resetPasswordForm();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200/80 dark:border-slate-800/50 pb-4">
        <h2 className="text-xl font-bold tracking-tight">Account & Application Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your profile, update credentials, or manage visual theme preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-white dark:bg-[#0c1220]/40 flex flex-col items-center text-center p-6">
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-indigo-500/15 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-550 font-bold text-3xl uppercase overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                  user?.username?.substring(0, 2)
                )}
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.username}</h3>
            <p className="text-xs text-slate-500 truncate w-full max-w-[200px]">{user?.email}</p>
            <div className="mt-4 py-1.5 px-3 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              Premium Account
            </div>
          </Card>

          {/* Theme custom selector card */}
          <Card className="bg-white dark:bg-[#0c1220]/40 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-indigo-500" />
              Theme Mode
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'system'].map((t) => {
                const isActive = theme === t;
                return (
                  <button
                    key={t}
                    onClick={() => selectTheme(t)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border capitalize cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-500 border-indigo-550/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Side: Inputs Forms Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Form 1: Edit Profile Details */}
          <Card className="bg-white dark:bg-[#0c1220]/40 p-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <User className="h-4.5 w-4.5 text-indigo-500" />
              Profile Details
            </h3>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  id="username"
                  icon={User}
                  error={profileErrors.username}
                  {...registerProfile('username')}
                />
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  icon={Mail}
                  error={profileErrors.email}
                  {...registerProfile('email')}
                />
              </div>

              <Input
                label="Profile Image URL"
                id="profileImage"
                placeholder="https://example.com/avatar.jpg"
                error={profileErrors.profileImage}
                {...registerProfile('profileImage')}
              />

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-850">
                <Button type="submit" variant="primary" size="sm" icon={Save} loading={profileLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Form 2: Change Password */}
          <Card className="bg-white dark:bg-[#0c1220]/40 p-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Lock className="h-4.5 w-4.5 text-indigo-500" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <Input
                label="Current Password"
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                error={passwordErrors.currentPassword}
                {...registerPassword('currentPassword')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  error={passwordErrors.newPassword}
                  {...registerPassword('newPassword')}
                />
                <Input
                  label="Confirm New Password"
                  id="confirmNewPassword"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  error={passwordErrors.confirmNewPassword}
                  {...registerPassword('confirmNewPassword')}
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-850">
                <Button type="submit" variant="primary" size="sm" icon={ShieldCheck} loading={passwordLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Profile;
