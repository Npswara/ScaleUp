import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface VerifyProps {
  onBackToLogin: () => void;
}

export default function Verify({ onBackToLogin }: VerifyProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token found.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        setMessage(data.message);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message);
      }
    };

    verifyToken();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-12 bg-white rounded-3xl shadow-xl border border-black/5 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
          <h2 className="text-2xl font-bold tracking-tighter">Verifying Account...</h2>
          <p className="text-text-muted">Please wait while we activate your account.</p>
        </div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tighter mb-2">Verified!</h2>
            <p className="text-text-muted">{message}</p>
          </div>
          <button
            onClick={onBackToLogin}
            className="w-full py-4 bg-black text-white rounded-full font-bold hover:scale-[1.02] active:scale-90 transition-all flex items-center justify-center gap-2"
          >
            Go to Login
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tighter mb-2">Verification Failed</h2>
            <p className="text-text-muted">{message}</p>
          </div>
          <button
            onClick={onBackToLogin}
            className="w-full py-4 bg-black text-white rounded-full font-bold hover:scale-[1.02] active:scale-90 transition-all flex items-center justify-center gap-2"
          >
            Back to Login
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
