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
              className="flex-1 glass-dark rounded-t-3xl border-teal-500/20 flex flex-col items-center justify-end p-4 relative"
            >
              <div className="absolute -top-10 flex flex-col items-center">
                <div className="p-2 glass rounded-full bg-zinc-300/20 text-zinc-300">
                  <Medal className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-white mt-1">{topWards[1].ward}</span>
              </div>
              <span className="text-lg font-black text-teal-400">2nd</span>
            </motion.div>
          )}
          {topWards[0] && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '90%' }}
              className="flex-1 glass border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.2)] rounded-t-3xl flex flex-col items-center justify-end p-4 relative"
            >
              <div className="absolute -top-14 flex flex-col items-center">
                <div className="p-3 glass rounded-full bg-yellow-400/20 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                  <Trophy className="w-8 h-8" />
                </div>
                <span className="text-xs font-black text-white mt-1">{topWards[0].ward}</span>
              </div>
              <span className="text-2xl font-black text-teal-400">1st</span>
            </motion.div>
          )}
          {topWards[2] && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '50%' }}
              className="flex-1 glass-dark rounded-t-3xl border-teal-500/20 flex flex-col items-center justify-end p-4 relative"
            >
              <div className="absolute -top-10 flex flex-col items-center">
                <div className="p-2 glass rounded-full bg-orange-400/20 text-orange-400">
                  <Medal className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-white mt-1">{topWards[2].ward}</span>
              </div>
              <span className="text-lg font-black text-teal-400">3rd</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GlassCard className="border-teal-500/10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-teal-400/80 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Impact Rankings
        </h2>
        <div className="space-y-3">
          {topWards.map((item, index) => (
            <motion.div
              key={item.ward}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 glass bg-white/5 rounded-2xl border-white/5 group hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black ${
                  index === 0 ? 'bg-yellow-400/20 text-yellow-400' : 
                  index === 1 ? 'bg-zinc-300/20 text-zinc-300' :
                  index === 2 ? 'bg-orange-400/20 text-orange-400' : 'bg-teal-500/10 text-teal-400'
                }`}>
                  #{index + 1}
                </span>
                <div>
                  <p className="font-black text-white">{item.ward}</p>
                  <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Neighborhood</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-teal-400">
                  <Counter value={item.total} />
                  <span className="text-[10px] ml-1">KG</span>
                </p>
                <div className="flex items-center justify-end gap-1 text-[8px] font-bold text-white/30 uppercase tracking-tighter">
                  <Target className="w-2 h-2" />
                  CO2 OFFSET
                </div>
              </div>
            </motion.div>
          ))}
          {topWards.length === 0 && <p className="text-center text-white/40 py-8 italic">No data logged yet</p>}
        </div>
      </GlassCard>

      <GlassCard className="border-teal-500/10 overflow-hidden">
        <h2 className="text-sm font-bold uppercase tracking-widest text-teal-400/80 mb-8 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          3D Ward Impact
        </h2>
        <div className="h-80 w-full glass bg-black/20 rounded-3xl overflow-hidden">
          <ThreeBarChart data={chartData} />
        </div>
      </GlassCard>
    </div>
  );
}
