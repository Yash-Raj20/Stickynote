"use client";

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Get Reset Token from backend
      const res = await api.post('/auth/forgot-password', { email });
      const resetToken = res.data.data.resetToken;

      // 2. Generate Reset Link
      const resetLink = `${window.location.origin}/reset-password/${resetToken}`;

      // 3. Send Email using EmailJS
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        console.warn('EmailJS is not configured. Reset link:', resetLink);
        toast.success(`Mock Email Sent! Check console for link.`);
        setIsSent(true);
        setLoading(false);
        return;
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: email,
          reset_link: resetLink,
        },
        publicKey
      );

      toast.success('Password reset link sent to your email!');
      setIsSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
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
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Forgot Password</h1>
        <p className="text-sm text-foreground/60 mt-2 text-center sm:text-left">No worries, we'll send you reset instructions.</p>
      </div>

      {isSent ? (
        <div className="text-center space-y-6">
          <div className="p-4 bg-theme-primary/10 text-theme-primary rounded-xl text-sm font-medium">
            Check your email for a reset link. It might take a few minutes.
          </div>
          <Link href="/login" className="block w-full bg-theme-primary text-white font-semibold py-3.5 mt-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-theme-primary text-white font-semibold py-3.5 mt-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      {!isSent && (
        <p className="text-center text-sm text-foreground/50 mt-8 font-medium">
          Remember your password? <Link href="/login" className="text-theme-primary hover:text-theme-secondary transition-colors">Sign In</Link>
        </p>
      )}
    </motion.div>
  );
}
