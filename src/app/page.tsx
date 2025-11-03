import { SettingsProvider } from '@/contexts/settings-context';
import TimeCard from '@/components/dashboard/time-card';
import CryptoCard from '@/components/dashboard/crypto-card';
import CurrencyCard from '@/components/dashboard/currency-card';
import Footer from '@/components/dashboard/footer';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import IndoorDataGrid from '@/components/dashboard/indoor-data-grid';
import OutdoorDataGrid from '@/components/dashboard/outdoor-data-grid';
import { Separator } from '@/components/ui/separator';
import { LocationProvider } from '@/contexts/location-context';
import CountryCard from '@/components/dashboard/country-card';
import ServiceStatusCard from '@/components/dashboard/service-status-card';
import { Info } from 'lucide-react';

export default function CyberDashPage() {
  return (
    <SettingsProvider>
      <LocationProvider>
        <div className="flex min-h-screen w-full flex-col font-sans">
          
          <main className="flex-1 p-4 lg:ml-[320px]">
            <DashboardHeader />
            <div className="mt-6 space-y-6">
              <IndoorDataGrid />
              <Separator className="bg-border/50" />
              <OutdoorDataGrid />
            </div>
          </main>

          <aside className="flex flex-col border-r border-border/50 bg-background/50 p-4 backdrop-blur-sm lg:fixed lg:top-0 lg:left-0 lg:h-full lg:w-[320px]">
            <div className="space-y-6 lg:flex-1 lg:overflow-y-auto lg:pr-2">
              <TimeCard />
              <Separator className="bg-border/50" />
              <CountryCard />
              <Separator className="bg-border/50" />
              
              <div className="flex items-center text-xs text-muted-foreground px-2">
                <Info className="mr-2 h-4 w-4 shrink-0" />
                <span>Enable location to personalize currency (defaults to IDR).</span>
              </div>
              
              <CryptoCard />
              <Separator className="bg-border/50" />
              <CurrencyCard />
              <Separator className="bg-border/50" />
              <ServiceStatusCard />
            </div>
            <Footer />
          </aside>

        </div>
      </LocationProvider>
    </SettingsProvider>
  );
}