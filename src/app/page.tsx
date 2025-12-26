'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Wind, CloudSun, Thermometer, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const [aqi, setAqi] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch AQI
        const aqiRes = await fetch('https://api.waqi.info/feed/pokhara/?token=demo');
        const aqiData = await aqiRes.json();
        setAqi(aqiData.data);

        // Fetch User Profile
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
    
    // Subscribe to profile changes for real-time CO2 updates
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

  const getAqiColor = (val: number) => {
    if (val < 50) return 'bg-green-500';
    if (val < 100) return 'bg-yellow-500';
    if (val < 150) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAqiStatus = (val: number) => {
    if (val < 50) return 'Good';
    if (val < 100) return 'Moderate';
    if (val < 150) return 'Unhealthy for Sensitive Groups';
    return 'Unhealthy';
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Pokhara vibes...</div>;

  return (
    <div className="flex flex-col p-4 max-w-md mx-auto space-y-6">
      <header className="flex justify-between items-center pt-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Hello, {userData?.username || 'Eco-Warrior'}</h1>
          <p className="text-sm text-zinc-500">{userData?.ward}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => supabase.auth.signOut()}
          className="text-zinc-400 hover:text-red-500"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* AQI Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg ${getAqiColor(aqi?.aqi)}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium opacity-90">Pokhara Air Quality</p>
            <h2 className="text-4xl font-bold">{aqi?.aqi}</h2>
            <p className="text-lg font-semibold">{getAqiStatus(aqi?.aqi)}</p>
          </div>
          <Wind className="w-12 h-12 opacity-30" />
        </div>
        <div className="mt-4 flex gap-4 text-sm font-medium opacity-90">
          <div className="flex items-center gap-1">
            <Thermometer className="w-4 h-4" />
            <span>{aqi?.iaqi?.t?.v}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudSun className="w-4 h-4" />
            <span>Weather Icon</span>
          </div>
        </div>
      </div>

      {/* Impact Card */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-green-600">
          <div className="p-2 bg-green-50 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <span className="font-bold">Personal Impact</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
            <span className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Total CO2 Saved</span>
            <span className="text-4xl font-black text-zinc-900 mt-1">
              {userData?.total_co2_saved?.toFixed(2) || '0.00'}
              <span className="text-lg font-normal text-zinc-400 ml-1">kg</span>
            </span>
          </div>
        </div>
      </div>

      {/* Encouragement */}
      <div className="bg-green-600 rounded-2xl p-4 text-white flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-full">
          <LogOut className="w-6 h-6 rotate-180" />
        </div>
        <p className="text-sm font-medium">
          You've saved as much CO2 as {((userData?.total_co2_saved || 0) / 0.5).toFixed(1)} smartphone charges!
        </p>
      </div>
    </div>
  );
}
