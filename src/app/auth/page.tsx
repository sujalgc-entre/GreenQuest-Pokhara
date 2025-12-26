'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { WardSelector } from '@/components/WardSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Leaf, Mail, Lock, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [ward, setWard] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
      } else {
        if (!username || !ward) {
          toast.error('Please fill in all fields');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              ward,
            },
          },
        });
        if (error) throw error;
        toast.success('Check your email for verification!');
        setIsLogin(true);
      }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Authentication failed');
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      <div className="mesh-gradient" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
      >
        <div className="solid-card p-10 bg-slate-900 border-teal-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 animate-shimmer" />
          
          <div className="flex flex-col items-center space-y-6 text-center mb-10">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-5 bg-teal-500/20 rounded-3xl border border-teal-500/40 shadow-[0_0_30px_rgba(20,184,166,0.3)]"
            >
              <Leaf className="w-12 h-12 text-teal-300" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white text-glow">
                GreenQuest <span className="text-teal-400">Pokhara</span>
              </h1>
              <p className="text-teal-100 font-bold mt-3 text-lg">
                {isLogin ? 'Welcome back, Eco-Warrior' : 'Join the quest for a greener Pokhara'}
              </p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {!isLogin && (
                  <div className="space-y-3">
                    <Label htmlFor="username" className="accessible-label ml-1">Username</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-teal-500/50 group-focus-within:text-teal-400 transition-colors" />
                      <Input
                        id="username"
                        placeholder="green_warrior"
                        className="bg-black/40 border-white/20 text-white pl-14 h-16 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="email" className="accessible-label ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-teal-500/50 group-focus-within:text-teal-400 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="bg-black/40 border-white/20 text-white pl-14 h-16 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="accessible-label ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-teal-500/50 group-focus-within:text-teal-400 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-black/40 border-white/20 text-white pl-14 h-16 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-3">
                    <Label className="accessible-label ml-1">Your Ward</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-teal-500/50 z-10 group-focus-within:text-teal-400 transition-colors" />
                      <WardSelector value={ward} onChange={setWard} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full h-16 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xl font-black rounded-2xl shadow-[0_15px_30px_rgba(20,184,166,0.4)] border-0 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Leaf className="w-8 h-8" />
                  </motion.div>
                ) : isLogin ? 'Enter Quest' : 'Start Journey'}
              </Button>
            </motion.div>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-base text-teal-300 hover:text-teal-200 transition-colors font-bold"
            >
                {isLogin ? (
                  <span>New Warrior? <span className="underline decoration-teal-500/50 decoration-2 underline-offset-4">Create account</span></span>
                ) : (
                  <span>Already a member? <span className="underline decoration-teal-500/50 decoration-2 underline-offset-4">Login here</span></span>
                )}
            </button>
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-10 text-teal-100/40 text-sm font-bold uppercase tracking-widest"
        >
          &copy; 2025 GreenQuest Pokhara
        </motion.p>
      </motion.div>
    </div>
  );
}
