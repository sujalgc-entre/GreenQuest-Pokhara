'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bike, Bus, Trash2, TreePine, Leaf, CheckCircle2, AlertCircle } from 'lucide-react';
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

const MAX_QUANTITY = 10000;

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
    const qty = parseFloat(quantity);

    // Validation
    if (!user || loading) return;
    if (isNaN(qty) || qty <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    if (qty > MAX_QUANTITY) {
      toast.error(`Quantity cannot exceed ${MAX_QUANTITY}`);
      return;
    }

    setLoading(true);
    const action = ACTIONS.find(a => a.id === selectedAction)!;
    const co2Saved = action.co2 * qty;

    try {
      const { error } = await supabase.from('actions').insert({
        user_id: user.id,
        action_type: selectedAction,
        quantity: qty,
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
      // Small delay to prevent rapid-fire clicks
      setTimeout(() => setLoading(false), 500);
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
              className={`relative flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 min-h-[100px] min-w-[100px] ${
                selectedAction === action.id
                  ? 'bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.4)] border-teal-400'
                  : 'solid-card bg-slate-800 border-white/10'
              }`}
            >
              <action.icon className={`w-10 h-10 mb-3 ${selectedAction === action.id ? 'text-white' : 'text-teal-400'}`} />
              <span className={`text-sm font-black uppercase tracking-wider text-center ${selectedAction === action.id ? 'text-white' : 'text-slate-300'}`}>
                {action.label}
              </span>
              {selectedAction === action.id && (
                <motion.div
                  layoutId="selected-indicator"
                  className="absolute -top-2 -right-2"
                >
                  <CheckCircle2 className="w-8 h-8 text-white fill-teal-600" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="solid-card border-teal-500/30">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="quantity" className="accessible-label">
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
                  className="h-20 bg-black/40 border-white/20 rounded-2xl text-2xl font-black text-white placeholder:text-white/20 focus:ring-4 focus:ring-teal-500/40 transition-all text-center"
                />
              </div>
              <p className="helper-text italic text-center">
                This will save approx. <span className="text-teal-400 font-black">{(ACTIONS.find(a => a.id === selectedAction)?.co2 || 0) * (parseFloat(quantity) || 0)}kg</span> of CO2 emissions.
              </p>
              {parseFloat(quantity) > MAX_QUANTITY && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm font-bold flex items-center justify-center gap-2 bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                >
                  <AlertCircle className="w-5 h-5" /> That&apos;s a bit too much for one quest!
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-20 bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xl font-black rounded-2xl shadow-[0_15px_40px_rgba(20,184,166,0.4)] transition-all hover:scale-[1.02] active:scale-0.95 disabled:opacity-50 border-0"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Leaf className="w-6 h-6" />
                  </motion.div>
                  Processing...
                </div>
              ) : (
                'Log This Quest'
              )}
            </Button>

            <p className="text-center text-sm font-bold text-teal-200/40 uppercase tracking-widest">
              Adding impact to Ward {userWard}
            </p>
          </form>
        </div>


      <div className="flex justify-center">
        <div className="glass px-6 py-3 rounded-full flex items-center gap-3 border-teal-500/20">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="text-xs font-bold text-teal-100/80 uppercase tracking-widest">Global Live Impact</span>
        </div>
      </div>
    </div>
  );
}
