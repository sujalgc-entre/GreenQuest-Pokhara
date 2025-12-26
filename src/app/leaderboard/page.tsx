'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Medal, MapPin } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

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

      // Aggregate by ward
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

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Ward Standings...</div>;

  return (
    <div className="flex flex-col p-4 max-w-md mx-auto space-y-8 pb-24">
      <div className="pt-8 text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Ward Leaderboard</h1>
        <p className="text-zinc-500">Pokhara's Greenest Neighborhoods</p>
      </div>

      {/* Top 5 List */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Medal className="w-5 h-5 text-green-600" />
          Top 5 Wards
        </h2>
        <div className="space-y-3">
          {topWards.map((item, index) => (
            <div key={item.ward} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-yellow-400 text-white' : 
                  index === 1 ? 'bg-zinc-300 text-zinc-700' :
                  index === 2 ? 'bg-orange-300 text-white' : 'bg-zinc-200 text-zinc-500'
                }`}>
                  {index + 1}
                </span>
                <span className="font-semibold text-zinc-700">{item.ward}</span>
              </div>
              <span className="font-bold text-green-600">{item.total.toFixed(1)}kg</span>
            </div>
          ))}
          {topWards.length === 0 && <p className="text-center text-zinc-400">No data yet</p>}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          CO2 Saved by Ward
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                dataKey="ward" 
                type="category" 
                width={70} 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-zinc-100 shadow-md rounded-lg text-xs font-bold">
                        {payload[0].value}kg Saved
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" radius={[0, 10, 10, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#22c55e' : '#86efac'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
