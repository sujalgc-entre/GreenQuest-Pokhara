'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, Trophy, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: PlusSquare, label: 'Log', href: '/log' },
    { icon: Trophy, label: 'Wards', href: '/leaderboard' },
    { icon: MessageSquare, label: 'Chat', href: '/chat' },
  ];

  if (pathname === '/auth') return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex h-20 w-[94%] max-w-md items-center justify-around rounded-3xl solid-card bg-slate-900 border-teal-500/30 px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {navItems.map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center justify-center min-w-[64px] min-h-[64px] transition-all"
            aria-label={label}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={cn(
                'relative z-10 flex flex-col items-center transition-colors duration-300 gap-1',
                isActive ? 'text-teal-400' : 'text-slate-400 hover:text-teal-300'
              )}
            >
              <Icon className={cn("h-7 w-7", isActive && "drop-shadow-[0_0_12px_rgba(20,184,166,0.8)]")} />
              <span className={cn(
                "text-sm font-black uppercase tracking-tighter transition-all",
                isActive ? "opacity-100 scale-105" : "opacity-70 scale-100"
              )}>
                {label}
              </span>
            </motion.div>
            {isActive && (
              <motion.div
                layoutId="nav-glow"
                className="absolute inset-0 bg-teal-500/10 blur-2xl rounded-2xl"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
