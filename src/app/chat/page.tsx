'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function Typewriter({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; isNew?: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aqi, setAqi] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        setMessages(prev => [...prev, { role: 'bot', text: data.tip, isNew: true }]);
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
    <div className="relative flex flex-col h-screen max-w-2xl mx-auto w-full pt-12 pb-32 px-6">
      <header className="space-y-4 text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-5 solid-card bg-teal-900/40 rounded-full mb-4 shadow-[0_0_30px_rgba(20,184,166,0.4)] border-teal-500/50"
        >
          <Bot className="w-12 h-12 text-teal-300" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-white tracking-tight text-glow">
            Eco <span className="text-teal-400">Assistant</span>
          </h1>
          <p className="text-teal-100 font-bold italic text-lg">Personalized Pokhara Green Tips</p>
        </motion.div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6"
            >
              <Bot className="w-20 h-20 text-teal-500/20" />
              <p className="text-teal-300/40 font-black uppercase tracking-[0.2em] text-sm">Awaiting your query...</p>
              <div className="flex flex-wrap justify-center gap-3 max-w-sm">
                {['How can I reduce waste?', 'Eco-tips for Ward 2?', 'Air quality help?'].map((q) => (
                  <button 
                    key={q}
                    onClick={() => setInput(q)}
                    className="solid-card bg-slate-800/80 px-6 py-4 rounded-full text-sm font-black text-teal-300 border-teal-500/30 hover:bg-teal-500/20 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${
                  msg.role === 'user' ? 'bg-teal-500 text-white' : 'solid-card bg-slate-800 text-teal-300 border-teal-500/30'
                }`}>
                  {msg.role === 'user' ? <User className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>
                <div className={`p-5 rounded-3xl text-base font-bold leading-relaxed shadow-2xl ${
                  msg.role === 'user' 
                    ? 'bg-teal-600 text-white rounded-tr-none border-b-4 border-teal-700' 
                    : 'solid-card bg-slate-900 text-white border-white/10 rounded-tl-none'
                }`}>
                  {msg.role === 'bot' && msg.isNew ? (
                    <Typewriter text={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl solid-card bg-slate-800 flex items-center justify-center animate-pulse border-teal-500/20">
                  <Bot className="w-6 h-6 text-teal-500/50" />
                </div>
                <div className="flex gap-2">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 rounded-full bg-teal-500/40" />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 rounded-full bg-teal-500/40" />
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 rounded-full bg-teal-500/40" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative mt-12 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur opacity-30 group-focus-within:opacity-60 transition duration-1000 group-focus-within:duration-200" />
        <div className="relative">
          <Input
            placeholder="Ask for eco-tips..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-20 pr-20 bg-slate-950/80 border-white/20 rounded-3xl text-white text-lg font-bold placeholder:text-white/20 focus-visible:ring-4 focus-visible:ring-teal-500/40 focus-visible:border-teal-400 transition-all shadow-2xl"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl h-14 w-14 shadow-xl shadow-teal-500/30 active:scale-90 transition-all border-0"
            aria-label="Send message"
          >
            <Send className="w-7 h-7" />
          </Button>
        </div>
      </form>
    </div>
  );
}
