import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

type DataCardProps = {
  title: string;
  icon: ReactNode;
  value: string | number | undefined;
  unit?: string;
  description?: string;
  isLoading: boolean;
  error: Error | null;
  valueClassName?: string;
};

export default function DataCard({ title, icon, value, unit, description, isLoading, error, valueClassName }: DataCardProps) {

  return (
    <Card className="border-border/50 bg-card/50 transition-all hover:bg-card/70">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-start pt-0">
        {isLoading ? (
          <>
            <Skeleton className="mt-1 h-7 w-3/4" />
            {description && <Skeleton className="h-3 w-1/2 mt-1.5" />}
          </>
        ) : error ? (
           <div className="flex items-center text-xs text-destructive">
             <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
             <span>Error</span>
           </div>
        ) : (
          <>
            <div className={`text-2xl font-bold ${valueClassName}`}>
              {value}
              <span className="ml-1 text-sm font-medium">{unit}</span>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}