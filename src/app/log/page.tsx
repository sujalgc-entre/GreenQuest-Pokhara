'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bike, Bus, Trash2, TreePine, Leaf } from 'lucide-react';

const ACTIONS = [
  { id: 'Biked', label: 'Biked', icon: Bike, unit: 'km', co2: 0.3 },
  { id: 'Public Transport', label: 'Public Transport', icon: Bus, unit: 'km', co2: 0.15 },
  { id: 'Recycled Plastic', label: 'Recycled Plastic', icon: Trash2, unit: 'items', co2: 0.1 },
  { id: 'Recycled Paper', label: 'Recycled Paper', icon: Trash2, unit: 'items', co2: 0.05 },
  { id: 'Planted Tree', label: 'Planted Tree', icon: TreePine, unit: 'trees', co2: 2 },
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

      toast.success(`Logged! You saved ${co2Saved.toFixed(2)}kg CO2`);
      setQuantity('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-4 max-w-md mx-auto space-y-6">
      <div className="pt-8 text-center space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900">Log Eco-Action</h1>
        <p className="text-zinc-500">Every small step counts for Pokhara</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => setSelectedAction(action.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              selectedAction === action.id
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-zinc-100 bg-white text-zinc-500'
            }`}
          >
            <action.icon className="w-8 h-8 mb-2" />
            <span className="text-xs font-semibold text-center">{action.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">
            Quantity ({ACTIONS.find(a => a.id === selectedAction)?.unit})
          </Label>
          <Input
            id="quantity"
            type="number"
            step="0.1"
            placeholder="Enter amount..."
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold rounded-xl shadow-md"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Submit Action'}
        </Button>

        <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
          <Leaf className="w-4 h-4" />
          <span>Help Pokhara breathe better</span>
        </div>
      </form>
    </div>
  );
}
