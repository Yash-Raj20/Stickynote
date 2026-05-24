"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${params.token}`, { password });
      toast.success('Password updated successfully! Please login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="mb-8 flex flex-col items-center sm:items-start">
        <div className="flex items-center gap-1 mb-6">
          <Image
            src="/logo-new.png"
            alt="Sticky Notes Logo"
            width={44}
            height={44}
            className="h-11 w-11 object-cover shrink-0"
            priority
          />
          <span className="text-2xl font-black text-theme-primary tracking-tight">StickyNotes</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Reset Password</h1>
        <p className="text-sm text-foreground/60 mt-2 text-center sm:text-left">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-4 pr-11 py-3.5 rounded-lg border-none bg-input-bg text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-theme-primary/50 transition-all outline-none font-medium ${!showPassword && password ? 'tracking-widest' : ''}`}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || password.length < 6}
          className="w-full bg-theme-primary text-white font-semibold py-3.5 mt-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <p className="text-center text-sm text-foreground/50 mt-8 font-medium">
        Back to <Link href="/login" className="text-theme-primary hover:text-theme-secondary transition-colors">Sign In</Link>
      </p>
    </motion.div>
  );
}
