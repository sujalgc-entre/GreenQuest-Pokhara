'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Medal, MapPin, Target, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Counter } from '@/components/Animations';
import { ThreeBarChart } from '@/components/ThreeBarChart';

export default function LeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('ward, total_co2_saved');

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      const wardTotals: Record<string, number> = {};
      profiles.forEach((p) => {
        wardTotals[p.ward] = (wardTotals[p.ward] || 0) + (p.total_co2_saved || 0);
      });

      const formattedData = Object.entries(wardTotals)
        .map(([ward, total]) => ({ ward, total }))
        .sort((a, b) => b.total - a.total);

      setData(formattedData);
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  const topWards = data.slice(0, 5);
  const chartData = data.slice(0, 10);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Trophy className="w-12 h-12 text-teal-500" />
      </motion.div>
    </div>
  );

  return (
    <div className="relative min-h-screen px-6 pt-12 pb-32 max-w-2xl mx-auto w-full space-y-8">
      <header className="space-y-2 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-4 glass rounded-full mb-4 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
        >
          <Trophy className="w-10 h-10 text-teal-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-white tracking-tight text-glow">
            Ward <span className="text-teal-400">Battle</span>
          </h1>
          <p className="text-teal-100/60 font-medium italic">Pokhara's Greenest Neighborhoods</p>
        </motion.div>
      </header>

      {/* Top 3 Podium (Visual) */}
      <div className="flex items-end justify-center gap-4 h-48 mb-8">
        <AnimatePresence>
            {topWards[1] && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '70%' }}
                className="flex-1 solid-card bg-slate-800 rounded-t-3xl border-teal-500/20 flex flex-col items-center justify-end p-4 relative shadow-2xl"
              >
                <div className="absolute -top-12 flex flex-col items-center">
                  <div className="p-3 glass rounded-full bg-slate-300/30 text-white shadow-lg">
                    <Medal className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-black text-white mt-2 drop-shadow-md">Ward {topWards[1].ward}</span>
                </div>
                <span className="text-2xl font-black text-slate-300">2nd</span>
              </motion.div>
            )}
            {topWards[0] && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '90%' }}
                className="flex-1 solid-card bg-teal-900/40 border-teal-400 shadow-[0_0_40px_rgba(20,184,166,0.3)] rounded-t-3xl flex flex-col items-center justify-end p-4 relative"
              >
                <div className="absolute -top-16 flex flex-col items-center">
                  <div className="p-4 glass rounded-full bg-yellow-400/30 text-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] border-yellow-400/50">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <span className="text-base font-black text-white mt-2 drop-shadow-md">Ward {topWards[0].ward}</span>
                </div>
                <span className="text-4xl font-black text-yellow-400">1st</span>
              </motion.div>
            )}
            {topWards[2] && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '55%' }}
                className="flex-1 solid-card bg-slate-800 rounded-t-3xl border-teal-500/20 flex flex-col items-center justify-end p-4 relative shadow-2xl"
              >
                <div className="absolute -top-12 flex flex-col items-center">
                  <div className="p-3 glass rounded-full bg-orange-400/30 text-white shadow-lg">
                    <Medal className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-black text-white mt-2 drop-shadow-md">Ward {topWards[2].ward}</span>
                </div>
                <span className="text-2xl font-black text-orange-400">3rd</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="solid-card border-teal-500/20">
          <h2 className="text-base font-bold uppercase tracking-widest text-teal-300 mb-8 flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            Impact Rankings
          </h2>
          <div className="space-y-4">
            {topWards.map((item, index) => (
              <motion.div
                key={item.ward}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <span className={`w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-black shadow-lg ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                    index === 1 ? 'bg-slate-300 text-slate-900' :
                    index === 2 ? 'bg-orange-400 text-orange-900' : 'bg-teal-500 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-lg font-black text-white">Ward {item.ward}</p>
                    <p className="text-xs uppercase font-bold text-teal-300/60 tracking-widest">Neighborhood</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">
                    <Counter value={item.total} />
                    <span className="text-sm ml-1 text-teal-400">KG</span>
                  </p>
                  <div className="flex items-center justify-end gap-2 text-[10px] font-black text-teal-200/40 uppercase tracking-widest">
                    <Target className="w-3 h-3" />
                    CO2 OFFSET
                  </div>
                </div>
              </motion.div>
            ))}
            {topWards.length === 0 && <p className="text-center text-white/40 py-12 italic text-lg">No data logged yet</p>}
          </div>
        </div>

        <div className="solid-card border-teal-500/20 overflow-hidden">
          <h2 className="text-base font-bold uppercase tracking-widest text-teal-300 mb-8 flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            3D Ward Impact
          </h2>
          <div className="h-96 w-full glass bg-black/40 rounded-3xl overflow-hidden shadow-inner">
            <ThreeBarChart data={chartData} />
          </div>
        </div>

    </div>
  );
}
