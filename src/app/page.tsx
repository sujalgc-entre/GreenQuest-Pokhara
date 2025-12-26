'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Wind, CloudSun, Thermometer, User, LogOut, ArrowUpRight, Leaf, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThreeScene } from '@/components/ThreeScene';
import { Counter, GlassCard } from '@/components/Animations';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
    const [weather, setWeather] = useState<any>(null);
    const [aqi, setAqi] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, 200]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const refreshIndicatorY = useTransform(scrollY, [-100, 0], [50, -50]);
    const refreshIndicatorOpacity = useTransform(scrollY, [-100, -50], [1, 0]);
    const refreshIndicatorRotate = useTransform(scrollY, [-100, 0], [360, 0]);

    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [aqiRes, weatherRes] = await Promise.all([
          fetch('https://api.waqi.info/feed/pokhara/?token=demo'),
          fetch('/api/weather')
        ]);

        if (aqiRes.ok) {
          const aqiData = await aqiRes.json();
          if (aqiData.status === 'ok') setAqi(aqiData.data);
        }

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          setWeather(weatherData);
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserData(profile);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setAqi({ aqi: 42, iaqi: { t: { v: 22 } } });
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
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

  const aqiValue = aqi?.aqi || 42;
  const aqiInfo = getAqiStatus(aqiValue);
    const temperature = weather?.main?.temp || aqi?.iaqi?.t?.v || 22;
    const weatherMain = weather?.weather?.[0]?.main || 'Cloudy';
    const windSpeed = weather?.wind?.speed ? `${(weather.wind.speed * 3.6).toFixed(1)} km/h` : '12 km/h';

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
        <ThreeScene userImpact={userData?.total_co2_saved || 0} />

        <motion.div
          style={{ y: refreshIndicatorY, opacity: refreshIndicatorOpacity, rotate: refreshIndicatorRotate }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 p-3 glass rounded-full shadow-2xl"
          onViewportLeave={() => {
            if (scrollY.get() < -80) {
              fetchData();
            }
          }}
        >
          <Leaf className="w-6 h-6 text-teal-400" />
        </motion.div>


      <main className="flex-1 px-6 pt-12 pb-32 max-w-2xl mx-auto w-full space-y-8">
        <header className="flex justify-between items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ y: heroY, opacity: heroOpacity }}
            >
              <h1 className="text-4xl font-black text-white tracking-tight text-glow">
                Quest <span className="text-teal-400">Update</span>
              </h1>
              <p className="text-teal-100 font-semibold text-lg">Hello, {userData?.username || 'Warrior'}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => supabase.auth.signOut()}
                className="glass-dark rounded-full text-white hover:text-red-400 transition-colors h-12 w-12"
                aria-label="Log Out"
              >
                <LogOut className="w-6 h-6" />
              </Button>
            </motion.div>
          </header>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-orange-500/20 border border-orange-500/40 rounded-2xl p-4 flex items-center gap-3 text-orange-100 text-base"
            >
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <span>Real-time AQI unavailable. Showing estimated data for Pokhara.</span>
            </motion.div>
          )}

          <div className="solid-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wind className="w-32 h-32 text-white" />
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold uppercase tracking-widest text-teal-300">Air Quality Pokhara</span>
                <div className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-bold text-white">
                  <div className={`w-3 h-3 rounded-full animate-pulse bg-teal-400`} />
                  LIVE
                </div>
              </div>
              
              <div className="flex items-end gap-4">
                <h2 className="text-8xl font-black text-white tracking-tighter">
                  <Counter value={aqiValue} decimals={0} />
                </h2>
                <div className="pb-2">
                  <p className={`text-2xl font-black ${aqiInfo.color} drop-shadow-md`}>{aqiInfo.label}</p>
                  <div className="flex items-center gap-2 text-white/80 text-base font-bold">
                    <Thermometer className="w-5 h-5" />
                    <span>{temperature}°C</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="glass bg-white/10 p-5 rounded-2xl flex items-center gap-3">
                  <CloudSun className="w-6 h-6 text-teal-300" />
                    <div>
                      <p className="text-xs uppercase font-black text-teal-200">Weather</p>
                      <p className="text-base font-bold text-white">{weatherMain}</p>
                    </div>
                  </div>
                  <div className="glass bg-white/10 p-5 rounded-2xl flex items-center gap-3">
                    <Wind className="w-6 h-6 text-teal-300" />
                    <div>
                      <p className="text-xs uppercase font-black text-teal-200">Wind</p>
                      <p className="text-base font-bold text-white">{windSpeed}</p>
                    </div>

                </div>
              </div>
            </div>
          </div>

          <div className="solid-card border-teal-500/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-500/30 rounded-2xl">
                  <Leaf className="w-8 h-8 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Carbon Savings</h3>
                  <p className="text-sm font-bold text-teal-200/60">Personal Impact</p>
                </div>
              </div>
              <ArrowUpRight className="w-8 h-8 text-teal-500/50" />
            </div>

            <div className="relative py-10 flex flex-col items-center justify-center">
              <motion.div 
                className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <span className="text-7xl font-black text-white tracking-tighter relative">
                <Counter value={userData?.total_co2_saved || 0} />
                <span className="text-3xl font-bold text-teal-400 ml-2">kg</span>
              </span>
              <p className="mt-6 text-base font-bold text-white/90 text-center max-w-[250px] leading-relaxed">
                You&apos;ve offset as much CO2 as <span className="text-teal-400 font-black">{((userData?.total_co2_saved || 0) / 0.5).toFixed(1)}</span> smartphone charges!
              </p>
            </div>

            <div className="mt-10">
              <div className="flex justify-between text-sm font-black text-teal-300 mb-3 uppercase tracking-widest">
                <span>Ward {userData?.ward} Progress</span>
                <span>72%</span>
              </div>
              <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '72%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                </motion.div>
              </div>
            </div>
          </div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          <Button 
            asChild
            className="h-24 glass-dark border-teal-500/30 text-teal-400 hover:bg-teal-500/10 rounded-2xl font-bold flex flex-col gap-1 neumorph border-0 shadow-none cursor-pointer"
          >
            <a href="/log">
              <PlusSquare className="w-6 h-6" />
              <span>Log Action</span>
            </a>
          </Button>
          <Button 
            asChild
            className="h-24 glass-dark border-zinc-500/30 text-zinc-300 hover:bg-white/5 rounded-2xl font-bold flex flex-col gap-1 neumorph border-0 shadow-none cursor-pointer"
          >
            <a href="/leaderboard">
              <Trophy className="w-6 h-6" />
              <span>Leaderboard</span>
            </a>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

import { PlusSquare, Trophy } from 'lucide-react';
