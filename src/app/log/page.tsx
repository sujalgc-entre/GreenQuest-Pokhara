'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bike, Bus, Trash2, TreePine, Leaf, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/Animations';
import confetti from 'canvas-confetti';

const ACTIONS = [
  { id: 'Biked', label: 'Biked', icon: Bike, unit: 'km', co2: 0.3, color: 'text-blue-400' },
  { id: 'Public Transport', label: 'Public Transport', icon: Bus, unit: 'km', co2: 0.15, color: 'text-indigo-400' },
  { id: 'Recycled Plastic', label: 'Recycled Plastic', icon: Trash2, unit: 'items', co2: 0.1, color: 'text-orange-400' },
  { id: 'Recycled Paper', label: 'Recycled Paper', icon: Trash2, unit: 'items', co2: 0.05, color: 'text-amber-400' },
  { id: 'Planted Tree', label: 'Planted Tree', icon: TreePine, unit: 'trees', co2: 2, color: 'text-emerald-400' },
];

export default function LogActionPage() {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0].id);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [userWard, setUserWard] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('ward')
        .eq('id', user.id)
        .single();
      if (data) setUserWard(data.ward);
    }
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !quantity || loading) return;

    setLoading(true);
    const action = ACTIONS.find(a => a.id === selectedAction)!;
    const co2Saved = action.co2 * parseFloat(quantity);

    try {
      const { error } = await supabase.from('actions').insert({
        user_id: user.id,
        action_type: selectedAction,
        quantity: parseFloat(quantity),
        co2_saved: co2Saved,
        ward: userWard,
      });

      if (error) throw error;

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#0f766e', '#ffffff']
      });

      toast.success(`Quest Completed! You saved ${co2Saved.toFixed(2)}kg CO2`);
      setQuantity('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen px-6 pt-12 pb-32 max-w-2xl mx-auto w-full space-y-8">
      <header className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-white tracking-tight text-glow">
            Log <span className="text-teal-400">Action</span>
          </h1>
          <p className="text-teal-100/60 font-medium italic">Every small step counts for Pokhara</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ACTIONS.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAction(action.id)}
            className={`relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 ${
              selectedAction === action.id
                ? 'glass bg-teal-500/20 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                : 'glass-dark hover:bg-white/5 border-white/10'
            }`}
          >
            <action.icon className={`w-8 h-8 mb-2 ${selectedAction === action.id ? 'text-teal-400' : 'text-zinc-500'}`} />
            <span className={`text-[10px] font-black uppercase tracking-wider text-center ${selectedAction === action.id ? 'text-white' : 'text-zinc-500'}`}>
              {action.label}
            </span>
            {selectedAction === action.id && (
              <motion.div
                layoutId="selected-indicator"
                className="absolute -top-1 -right-1"
              >
                <CheckCircle2 className="w-5 h-5 text-teal-400 fill-background" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <GlassCard className="border-teal-500/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-bold uppercase tracking-widest text-teal-400/80">
              Quantity ({ACTIONS.find(a => a.id === selectedAction)?.unit})
            </Label>
            <div className="relative group">
              <Input
                id="quantity"
                type="number"
                step="0.1"
                placeholder="Enter amount..."
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-teal-500/50 transition-all"
              />
              <div className="absolute inset-0 bg-teal-500/5 blur-xl rounded-2xl -z-10 group-focus-within:bg-teal-500/10 transition-all" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-400 hover:to-teal-600 text-white text-lg font-black rounded-2xl shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition-all hover:scale-[1.02] active:scale-0.95 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Leaf className="w-5 h-5" />
                </motion.div>
                Processing...
              </div>
            ) : (
              'Complete Quest'
            )}
          </Button>

          <p className="text-center text-xs font-medium text-white/40 italic">
            Your contribution will be added to Ward {userWard}'s total impact
          </p>
        </form>
      </GlassCard>

      <div className="flex justify-center">
        <div className="glass px-6 py-3 rounded-full flex items-center gap-3 border-teal-500/20">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="text-xs font-bold text-teal-100/80 uppercase tracking-widest">Global Live Impact</span>
        </div>
      </div>
    </div>
  );
}
