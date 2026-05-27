"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { Eye, EyeOff } from 'lucide-react';

function RegisterContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardId = searchParams.get('boardId');
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      toast.success('Account created successfully!');
      login(res.data.data, res.data.data.token);
      router.push(boardId ? `/board?boardId=${boardId}` : '/board');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
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
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Create Account</h1>
        <p className="text-sm text-foreground/60 mt-2">Join us and organize your thoughts, beautifully.</p>
      </div>

      {/* Segmented Control */}
      <div className="flex bg-input-bg p-1 rounded-lg mb-8">
        <Link href={boardId ? `/login?boardId=${boardId}` : "/login"} className="flex-1 text-center py-2 text-sm font-semibold rounded-md text-foreground/50 hover:text-foreground transition-colors">
          Login
        </Link>
        <div className="flex-1 text-center py-2 text-sm font-semibold rounded-md bg-surface text-theme-primary shadow-sm cursor-default">
          Register
        </div>
      </div>

      {error && <div className="bg-theme-tertiary/10 text-theme-tertiary p-3 rounded-lg text-sm mb-6 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Your Name"
            className="w-full px-4 py-3.5 rounded-lg border-none bg-input-bg text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-theme-primary/50 transition-all outline-none font-medium"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Your Email"
            className="w-full px-4 py-3.5 rounded-lg border-none bg-input-bg text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-theme-primary/50 transition-all outline-none font-medium"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-foreground/80 mb-2 uppercase tracking-wider">Password</label>
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
          disabled={loading}
          className="w-full bg-theme-primary text-white font-semibold py-3.5 mt-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-foreground/50 mt-8 font-medium">
        Already have an account? <Link href={boardId ? `/login?boardId=${boardId}` : "/login"} className="text-theme-primary hover:text-theme-secondary transition-colors">Sign In</Link>
      </p>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
