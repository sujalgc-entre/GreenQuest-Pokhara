'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, Send, Bot, User, Mic, Volume2, VolumeX, 
  Copy, RefreshCcw, Trash2, ImagePlus, ChevronDown, 
  ChevronUp, Leaf, Loader2, Check, ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

// Types
interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  thinking?: string;
  imagePrompt?: string;
  isStreaming?: boolean;
}

// Components
function MessageBubble({ 
  msg, 
  onRegenerate, 
  isLast 
}: { 
  msg: Message; 
  onRegenerate?: () => void; 
  isLast?: boolean 
}) {
  const [showThinking, setShowThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const speak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg.text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex w-full mb-6", msg.role === 'user' ? 'justify-end' : 'justify-start')}
    >
      <div className={cn(
        "flex gap-3 max-w-[85%] sm:max-w-[75%]",
        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border",
          msg.role === 'user' 
            ? 'bg-blue-600 border-blue-400 text-white' 
            : 'bg-slate-800 border-emerald-500/30 text-emerald-400'
        )}>
          {msg.role === 'user' ? <User size={20} /> : <Leaf size={20} />}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <div className={cn(
            "p-4 rounded-2xl shadow-xl transition-all",
            msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-slate-900 text-slate-100 border border-white/5 rounded-tl-none'
          )}>
            {/* Thinking Section */}
            {msg.thinking && (
              <div className="mb-3 border-b border-white/10 pb-2">
                <button 
                  onClick={() => setShowThinking(!showThinking)}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  {showThinking ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  Thinking Process
                </button>
                <AnimatePresence>
                  {showThinking && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-xs italic text-slate-500 leading-relaxed font-medium">
                        {msg.thinking}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Markdown Message */}
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-emerald-400 prose-a:text-blue-400">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !bg-slate-950 border border-white/5 my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={cn("bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300", className)} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>

            {/* Image Illustration */}
            {msg.imagePrompt && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10 group relative">
                <img 
                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent(msg.imagePrompt)}?width=1024&height=1024&nologo=true`}
                  alt="Eco illustration"
                  className="w-full h-auto object-cover aspect-square"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-[10px] text-white/60 italic px-4 text-center">{msg.imagePrompt}</p>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className={cn(
              "mt-2 text-[9px] font-bold opacity-40",
              msg.role === 'user' ? 'text-right' : 'text-left'
            )}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Actions */}
          {msg.role === 'bot' && !msg.isStreaming && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={copyToClipboard} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-emerald-400 transition-colors" title="Copy">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button onClick={speak} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-emerald-400 transition-colors" title="Speak">
                <Volume2 size={14} />
              </button>
              {isLast && (
                <button onClick={onRegenerate} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-emerald-400 transition-colors" title="Regenerate">
                  <RefreshCcw size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aqi, setAqi] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = () => setIsListening(false);
      }
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: Message = {
      id: botMsgId,
      role: 'bot',
      text: '',
      timestamp: new Date(),
      isStreaming: true
    };
    setMessages(prev => [...prev, initialBotMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages.concat(userMsg).slice(-5).map(m => ({ role: m.role, text: m.text })),
          aqi 
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let thinking = '';
      let imagePrompt = '';
      let isThinking = false;
      let isImagePrompt = false;

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        
        // Simple tag parsing from stream
        let processedChunk = chunk;
        if (processedChunk.includes('<thinking>')) {
          isThinking = true;
          processedChunk = processedChunk.replace('<thinking>', '');
        }
        if (processedChunk.includes('</thinking>')) {
          isThinking = false;
          processedChunk = processedChunk.replace('</thinking>', '');
        }
        if (processedChunk.includes('<image_prompt>')) {
          isImagePrompt = true;
          processedChunk = processedChunk.replace('<image_prompt>', '');
        }
        if (processedChunk.includes('</image_prompt>')) {
          isImagePrompt = false;
          processedChunk = processedChunk.replace('</image_prompt>', '');
        }

        if (isThinking) thinking += processedChunk;
        else if (isImagePrompt) imagePrompt += processedChunk;
        else fullText += processedChunk;

        setMessages(prev => prev.map(m => 
          m.id === botMsgId 
            ? { ...m, text: fullText, thinking, imagePrompt: imagePrompt.trim() } 
            : m
        ));
      }

      setMessages(prev => prev.map(m => 
        m.id === botMsgId ? { ...m, isStreaming: false } : m
      ));

    } catch (error: any) {
      toast.error('AI is a bit sleepy right now. Try again later!');
      console.error(error);
      setMessages(prev => prev.filter(m => m.id !== botMsgId));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Conversation cleared');
  };

  const quickReplies = [
    { text: 'Daily tips', icon: <Sparkles size={14} /> },
    { text: 'AQI explanation', icon: <Leaf size={14} /> },
    { text: 'Generate eco-illustration', icon: <ImagePlus size={14} /> },
    { text: 'Best actions today', icon: <Send size={14} /> }
  ];

  return (
    <div className="relative flex flex-col h-screen max-w-4xl mx-auto w-full pt-8 pb-4 px-4 sm:px-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Eco <span className="text-emerald-400">Assistant</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pokhara AI • {aqi} AQI</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearChat}
          className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          title="Clear Conversation"
        >
          <Trash2 size={20} />
        </Button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar mask-fade">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <Bot className="w-24 h-24 text-emerald-500/20 relative" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Namaste! How can I help?</h2>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">I'm your eco-guide for a greener, cleaner Pokhara.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                {quickReplies.map((q) => (
                  <button 
                    key={q.text}
                    onClick={() => handleSend(undefined, q.text)}
                    className="flex items-center gap-3 bg-slate-900/50 hover:bg-slate-800 border border-white/5 p-4 rounded-2xl text-sm font-bold text-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <span className="text-emerald-500 group-hover:scale-110 transition-transform">{q.icon}</span>
                    {q.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          
          {messages.map((msg, i) => (
            <MessageBubble 
              key={msg.id} 
              msg={msg} 
              isLast={i === messages.length - 1}
              onRegenerate={() => handleSend(undefined, messages[messages.length - 2]?.text)}
            />
          ))}

          {loading && !messages[messages.length - 1]?.isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-6"
            >
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                </div>
                <div className="flex gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/50">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-emerald-500/40" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-emerald-500/40" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-emerald-500/40" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-6 space-y-4">
        {/* Suggested Follow-ups */}
        {messages.length > 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
          >
            {['Tell me more', 'How to start?', 'Local examples'].map((text) => (
              <button
                key={text}
                onClick={() => handleSend(undefined, text)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-900 border border-white/5 text-xs font-bold text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
              >
                {text}
              </button>
            ))}
          </motion.div>
        )}

        <form onSubmit={handleSend} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Message Eco Assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-14 pl-4 pr-12 bg-slate-950/90 border-white/10 rounded-2xl text-white text-base font-medium placeholder:text-slate-600 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 transition-all shadow-xl"
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:text-emerald-400 hover:bg-white/5'
                )}
              >
                <Mic size={20} />
              </button>
            </div>
            <Button
              type="submit"
              disabled={loading || (!input.trim() && !isListening)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl h-14 w-14 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all border-0 shrink-0"
            >
              <Send className="w-6 h-6" />
            </Button>
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-600 font-medium">
          Eco Assistant can make mistakes. Verify local Pokhara guidelines.
        </p>
      </div>

      {/* Waveform for Voice */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-3xl flex items-center gap-4 shadow-2xl z-50"
          >
            <div className="flex gap-1 h-8 items-center">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [8, 24, 8] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1 bg-emerald-500 rounded-full"
                />
              ))}
            </div>
            <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">Listening...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
