import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const VisitorCounter = () => {
  const [count, setCount] = useState(1247);

  useEffect(() => {
    const interval = setInterval(() => {
      // Random fluctuation: +1 to +3 visitors per second
      setCount(prev => {
        const change = Math.floor(Math.random() * 3) + 1;
        const shouldDecrease = Math.random() < 0.3; // 30% chance to decrease
        const newCount = shouldDecrease ? prev - 1 : prev + change;
        return Math.max(1200, Math.min(newCount, 9999)); // Keep between 1200-9999
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
      <div className="relative">
        <Users className="w-5 h-5 text-primary" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-base font-bold text-primary tabular-nums">
          {count.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">online visitors</span>
        <span className="text-xs text-muted-foreground sm:hidden">online</span>
      </div>
    </div>
  );
};
