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
      <header className="space-y-2 text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-4 glass rounded-full mb-4 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
        >
          <Bot className="w-10 h-10 text-teal-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-white tracking-tight text-glow">
            Eco <span className="text-teal-400">Assistant</span>
          </h1>
          <p className="text-teal-100/60 font-medium italic">Ask for personalized Pokhara tips</p>
        </motion.div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4"
            >
              <Bot className="w-16 h-16 text-teal-500/20" />
              <p className="text-white/30 font-bold uppercase tracking-widest text-xs">Awaiting your query...</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                {['How can I reduce waste?', 'Eco-tips for Ward 2?', 'Air quality help?'].map((q) => (
                  <button 
                    key={q}
                    onClick={() => setInput(q)}
                    className="glass-dark px-4 py-2 rounded-full text-[10px] font-black text-teal-400 border-teal-500/20 hover:bg-teal-500/10 transition-colors"
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
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'user' ? 'bg-teal-500 text-white' : 'glass-dark text-teal-400 border-teal-500/20'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm font-medium ${
                  msg.role === 'user' 
                    ? 'bg-teal-600/80 text-white rounded-tr-none' 
                    : 'glass-dark text-white/90 border-white/10 rounded-tl-none shadow-2xl'
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
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-2xl glass-dark flex items-center justify-center animate-pulse">
                  <Bot className="w-5 h-5 text-teal-500/50" />
                </div>
                <div className="flex gap-1">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-teal-500/30" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-teal-500/30" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-teal-500/30" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative mt-8 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200" />
        <div className="relative">
          <Input
            placeholder="Ask for eco-tips..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-16 pr-16 bg-black/40 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-teal-500/50 transition-all"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl h-12 w-12 shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
          >
            <Send className="w-6 h-6" />
          </Button>
        </div>
      </form>
    </div>
  );
}
