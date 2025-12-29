'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

export default function TimeCard() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setTime(new Date());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-1 text-center">
      {time ? (
        <>
          <div className="text-4xl font-semibold text-foreground">
            {format(time, 'HH:mm:ss')}
          </div>
          <p className="text-base text-muted-foreground">
            {format(time, 'E, d MMM yyyy')}
          </p>
        </>
      ) : (
        <>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2 mt-1" />
        </>
      )}
    </div>
  );
}