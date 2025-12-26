'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Wind, CloudSun, Thermometer, User, LogOut, ArrowUpRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThreeScene } from '@/components/ThreeScene';
import { Counter, GlassCard } from '@/components/Animations';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const [aqi, setAqi] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const aqiRes = await fetch('https://api.waqi.info/feed/pokhara/?token=demo');
        const aqiData = await aqiRes.json();
        setAqi(aqiData.data);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserData(profile);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    const subscription = supabase
      .channel('profile_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` }, 
        (payload) => setUserData(payload.new)
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getAqiStatus = (val: number) => {
    if (val < 50) return { label: 'Good', color: 'text-emerald-400', glow: 'shadow-emerald-500/50' };
    if (val < 100) return { label: 'Moderate', color: 'text-yellow-400', glow: 'shadow-yellow-500/50' };
    if (val < 150) return { label: 'Unhealthy', color: 'text-orange-400', glow: 'shadow-orange-500/50' };
    return { label: 'Hazardous', color: 'text-red-400', glow: 'shadow-red-500/50' };
  };

  const aqiInfo = getAqiStatus(aqi?.aqi || 0);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Leaf className="w-12 h-12 text-teal-500" />
      </motion.div>
    </div>
  );

  return (
    <div className="relative flex flex-col min-h-screen">
      <ThreeScene />

      <main className="flex-1 px-6 pt-12 pb-32 max-w-2xl mx-auto w-full space-y-8">
        {/* Header */}
        <header className="flex justify-between items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <h1 className="text-3xl font-black text-white tracking-tight text-glow">
              Quest <span className="text-teal-400">Update</span>
            </h1>
            <p className="text-teal-100/60 font-medium">Hello, {userData?.username || 'Warrior'}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => supabase.auth.signOut()}
              className="glass-dark rounded-full text-zinc-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </motion.div>
        </header>

        {/* AQI Glass Card */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wind className="w-32 h-32 text-white" />
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-widest text-teal-400/80">Air Quality Pokhara</span>
              <div className="flex items-center gap-2 glass px-3 py-1 rounded-full text-xs font-bold text-white">
                <div className={`w-2 h-2 rounded-full animate-pulse bg-teal-400`} />
                LIVE
              </div>
            </div>
            
            <div className="flex items-end gap-4">
              <h2 className="text-7xl font-black text-white tracking-tighter">
                <Counter value={aqi?.aqi || 0} decimals={0} />
              </h2>
              <div className="pb-2">
                <p className={`text-xl font-bold ${aqiInfo.color} drop-shadow-md`}>{aqiInfo.label}</p>
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                  <Thermometer className="w-4 h-4" />
                  <span>{aqi?.iaqi?.t?.v}°C</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="glass bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                <CloudSun className="w-5 h-5 text-teal-300" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/40">Weather</p>
                  <p className="text-sm font-bold text-white">Cloudy</p>
                </div>
              </div>
              <div className="glass bg-white/5 p-4 rounded-2xl flex items-center gap-3">
                <Wind className="w-5 h-5 text-teal-300" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/40">Wind</p>
                  <p className="text-sm font-bold text-white">12 km/h</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Impact Counter Card */}
        <GlassCard className="border-teal-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-xl">
                <Leaf className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Carbon Savings</h3>
                <p className="text-xs text-white/40">Personal Impact</p>
              </div>
            </div>
            <ArrowUpRight className="w-6 h-6 text-teal-500/50" />
          </div>

          <div className="relative py-8 flex flex-col items-center justify-center">
            <motion.div 
              className="absolute inset-0 bg-teal-500/10 blur-3xl rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <span className="text-6xl font-black text-white tracking-tighter relative">
              <Counter value={userData?.total_co2_saved || 0} />
              <span className="text-2xl font-medium text-teal-500/60 ml-2">kg</span>
            </span>
            <p className="mt-4 text-sm font-medium text-white/60 text-center max-w-[200px]">
              You've offset as much CO2 as <span className="text-teal-400 font-bold">{((userData?.total_co2_saved || 0) / 0.5).toFixed(1)}</span> smartphone charges!
            </p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-xs font-bold text-teal-400/80 mb-2 uppercase tracking-wider">
              <span>Ward {userData?.ward} Progress</span>
              <span>72%</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '72%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-teal-600 to-teal-400 relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
              </motion.div>
            </div>
          </div>
        </GlassCard>

        {/* Action Button Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          <Button className="h-20 glass-dark border-teal-500/30 text-teal-400 hover:bg-teal-500/10 rounded-2xl font-bold flex flex-col gap-1 neumorph border-0 shadow-none">
            <PlusSquare className="w-6 h-6" />
            <span>Log Action</span>
          </Button>
          <Button className="h-20 glass-dark border-zinc-500/30 text-zinc-300 hover:bg-white/5 rounded-2xl font-bold flex flex-col gap-1 neumorph border-0 shadow-none">
            <Trophy className="w-6 h-6" />
            <span>Leaderboard</span>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

import { PlusSquare, Trophy } from 'lucide-react';
