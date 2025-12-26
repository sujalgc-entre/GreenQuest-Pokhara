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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex h-16 w-[90%] max-w-md items-center justify-around rounded-full glass-dark border-white/10 px-6 shadow-2xl backdrop-blur-2xl">
      {navItems.map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={cn(
                'relative z-10 flex flex-col items-center transition-colors duration-300',
                isActive ? 'text-teal-400' : 'text-zinc-400 hover:text-teal-300'
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]")} />
              <span className="mt-1">{label}</span>
            </motion.div>
            {isActive && (
              <motion.div
                layoutId="nav-glow"
                className="absolute -inset-2 bg-teal-500/20 blur-xl rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
