'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { authApi } from '@/lib/api/auth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { SEED_CREDENTIALS } from '@/constants';

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      const result = await authApi.login(data.email, data.password);
      setUser(result);
      // Set cookie for middleware
      document.cookie = `gstp-auth=${encodeURIComponent(JSON.stringify({ state: { user: result } }))}; path=/; max-age=28800`;
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Login failed. Please try again.');
    }
  };

  const quickFill = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.15)' }}>G</div>
            <span className="text-white font-bold text-lg">GSTP Enterprise</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Drive Performance.<br />
            <span style={{ color: '#a5b4fc' }}>Track Excellence.</span>
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
            Enterprise-grade goal setting and tracking platform.
            Set SMART goals, track quarterly progress, and unlock team potential.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Active Employees', value: '1,240+' },
            { label: 'Goals Tracked', value: '8,500+' },
            { label: 'Avg. Completion', value: '87%' },
            { label: 'Departments', value: '12' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-indigo-300 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>G</div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>GSTP Enterprise</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-300 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder="you@company.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center mt-2"
            >
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick login buttons for demo */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Zap size={10} /> Demo Accounts
              </span>
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SEED_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => quickFill(cred.email, cred.password)}
                  className="btn-secondary text-xs py-1.5 justify-center"
                >
                  {cred.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
