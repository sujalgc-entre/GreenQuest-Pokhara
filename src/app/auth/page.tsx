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
    } catch (error: any) {
      toast.error(error.message);
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
        className="w-full max-w-md z-10"
      >
        <div className="glass-dark p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
          
          <div className="flex flex-col items-center space-y-4 text-center mb-8">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-4 bg-teal-500/20 rounded-2xl border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.2)]"
            >
              <Leaf className="w-10 h-10 text-teal-400" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white text-glow">
                GreenQuest Pokhara
              </h1>
              <p className="text-teal-200/60 mt-2">
                {isLogin ? 'Welcome back, Eco-Warrior' : 'Join the quest for a greener Pokhara'}
              </p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-teal-100/80 ml-1">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-teal-500/50" />
                      <Input
                        id="username"
                        placeholder="green_warrior"
                        className="bg-black/20 border-white/10 text-white pl-10 h-12 rounded-xl focus:ring-teal-500/50 focus:border-teal-500/50"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-teal-100/80 ml-1">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-teal-500/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="bg-black/20 border-white/10 text-white pl-10 h-12 rounded-xl focus:ring-teal-500/50 focus:border-teal-500/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-teal-100/80 ml-1">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-teal-500/50" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-black/20 border-white/10 text-white pl-10 h-12 rounded-xl focus:ring-teal-500/50 focus:border-teal-500/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label className="text-teal-100/80 ml-1">Your Ward</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-teal-500/50 z-10" />
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
                className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] border-none"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Leaf className="w-5 h-5" />
                  </motion.div>
                ) : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              {isLogin ? (
                <span>Don't have an account? <span className="font-bold underline">Join the quest</span></span>
              ) : (
                <span>Already a member? <span className="font-bold underline">Login here</span></span>
              )}
            </button>
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-teal-100/30 text-xs"
        >
          &copy; 2025 GreenQuest Pokhara. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
