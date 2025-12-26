'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion, PanInfo } from 'framer-motion';
import { ReactNode } from 'react';

const routes = ['/', '/log', '/leaderboard', '/chat'];

export function SwipeNavigator({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentIndex = routes.indexOf(pathname);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 500) {
      // Swipe Right -> Previous Page
      if (currentIndex > 0) {
        router.push(routes[currentIndex - 1]);
      }
    } else if (info.offset.x < -threshold || velocity < -500) {
      // Swipe Left -> Next Page
      if (currentIndex < routes.length - 1) {
        router.push(routes[currentIndex + 1]);
      }
    }
  };

  if (!routes.includes(pathname)) return <>{children}</>;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ minHeight: '100vh', width: '100%' }}
      className="touch-pan-y"
    >
      {children}
    </motion.div>
  );
}
