import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const VisitorCounter = () => {
  const [count, setCount] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increment by 1 visitor, max 20
      setCount(prev => {
        const newCount = prev + 1;
        return newCount > 20 ? 20 : newCount;
      });
    }, Math.random() * 1000 + 500);

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
