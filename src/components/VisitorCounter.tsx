import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const VisitorCounter = () => {
  const [count, setCount] = useState(218);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increment by 1-3 visitors every 3-8 seconds
      const increment = Math.floor(Math.random() * 3) + 1;
      setCount(prev => prev + increment);
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
      <Users className="w-4 h-4 text-primary animate-pulse" />
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-primary animate-fade-in">
          {count.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">visitors</span>
      </div>
    </div>
  );
};
