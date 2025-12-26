'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aqi, setAqi] = useState<number>(0);

  useEffect(() => {
    async function fetchAqi() {
      try {
        const res = await fetch('https://api.waqi.info/feed/pokhara/?token=demo');
        const data = await res.json();
        setAqi(data.data.aqi);
      } catch (e) {
        console.error('AQI fetch error', e);
      }
    }
    fetchAqi();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aqi }),
      });
      const data = await res.json();

      if (data.tip) {
        setMessages(prev => [...prev, { role: 'bot', text: data.tip }]);
      } else {
        throw new Error(data.error || 'Failed to get tip');
      }
    } catch (error: any) {
      toast.error('AI is a bit sleepy right now. Try again later!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 max-w-md mx-auto">
      <div className="pt-8 text-center space-y-2 mb-6">
        <div className="flex justify-center">
          <div className="p-3 bg-green-100 rounded-full">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Eco-Tips AI</h1>
        <p className="text-zinc-500">Personalized tips for Pokhara</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center text-zinc-400 mt-10 space-y-2">
            <Bot className="w-12 h-12 mx-auto opacity-20" />
            <p className="text-sm">Ask me for a daily eco-tip!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-zinc-200 text-zinc-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-none' 
                  : 'bg-white text-zinc-700 border border-zinc-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-zinc-200" />
              <div className="h-10 w-32 bg-zinc-100 rounded-2xl rounded-tl-none" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative mt-auto">
        <Input
          placeholder="Ask for eco-tips..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="pr-12 py-6 rounded-2xl border-zinc-200 focus-visible:ring-green-500"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 w-10"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
