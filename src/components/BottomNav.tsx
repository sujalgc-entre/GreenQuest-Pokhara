'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, Trophy, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-4 pb-safe shadow-lg dark:bg-black">
      {navItems.map(({ icon: Icon, label, href }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors',
            pathname === href
              ? 'text-green-600'
              : 'text-zinc-500 hover:text-green-500'
          )}
        >
          <Icon className="h-6 w-6" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
