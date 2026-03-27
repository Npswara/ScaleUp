import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignupProps {
  onSwitchToLogin: () => void;
  onLoginSuccess: (user: any, tokens: { accessToken: string }) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function Signup({ onSwitchToLogin, onLoginSuccess }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setMessage({ type: 'success', text: data.message });
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-black/5">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tighter mb-2">Create Account</h2>
        <p className="text-text-muted">Start your journey with Scaleup</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-bg border border-border-light rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-bg border border-border-light rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <p className="text-[10px] text-text-muted mt-1">
            Min 8 characters.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-bg border border-border-light rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-start gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-black text-white rounded-full font-bold hover:scale-[1.02] active:scale-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Sign Up
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-text-muted">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-black font-bold hover:underline">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
