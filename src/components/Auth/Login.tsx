import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, tokens: { accessToken: string }) => void;
  onSwitchToSignup: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function Login({ onLoginSuccess, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.user, { 
        accessToken: data.accessToken
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-black/5">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tighter mb-2">Welcome Back</h2>
        <p className="text-text-muted">Log in to your Scaleup account</p>
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
              placeholder="••••••••••••"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-black text-white rounded-full font-bold hover:scale-[1.02] active:scale-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Log In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-text-muted">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-black font-bold hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
