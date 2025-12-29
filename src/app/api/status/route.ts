import { NextResponse } from 'next/server';
import type { ServiceStatus } from '@/lib/types';

type StatuspageIndicator = 'none' | 'minor' | 'major' | 'critical';

const servicesToFetch = [
  { name: 'GitHub', url: 'https://www.githubstatus.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://www.githubstatus.com' },
  { name: 'Vercel', url: 'https://www.vercel-status.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://www.vercel-status.com' },
  { name: 'Netlify', url: 'https://www.netlifystatus.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://www.netlifystatus.com' },
  { name: 'Cloudflare', url: 'https://www.cloudflarestatus.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://www.cloudflarestatus.com' },
  { name: 'DigitalOcean', url: 'https://status.digitalocean.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://status.digitalocean.com' },
  { name: 'MongoDB Atlas', url: 'https://status.mongodb.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://status.mongodb.com' },
  { name: 'Supabase', url: 'https://status.supabase.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://status.supabase.com' },
  { name: 'Discord', url: 'https://discordstatus.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://discordstatus.com' },
  { name: 'OpenAI', url: 'https://status.openai.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://status.openai.com' },
  { name: 'Anthropic', url: 'https://status.anthropic.com/api/v2/status.json', type: 'statuspage', pageUrl: 'https://status.anthropic.com' },
  { name: 'Google Cloud', url: 'https://status.cloud.google.com/incidents.json', type: 'google', pageUrl: 'https://status.cloud.google.com' },
  { name: 'Firebase', url: 'https://status.firebase.google.com/incidents.json', type: 'google', pageUrl: 'https://status.firebase.google.com' },
];

function mapStatuspageIndicator(indicator: StatuspageIndicator | string): ServiceStatus {
  switch (indicator) {
    case 'none': return 'operational';
    case 'minor': return 'degraded';
    case 'major': return 'partial_outage';
    case 'critical': return 'major_outage';
    default: return 'unknown';
  }
}

function mapGoogleStatus(incidents: any[]): ServiceStatus {
  if (!incidents) return 'unknown';
  const activeIncidents = incidents.some(incident => !incident.end);
  return activeIncidents ? 'partial_outage' : 'operational';
}

async function fetchService(service: typeof servicesToFetch[0]): Promise<{ name: string, status: ServiceStatus, url: string }> {
  try {
    const response = await fetch(service.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      next: { revalidate: 60 }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch status (${response.status})`);
    
    const data = await response.json();
    let status: ServiceStatus = 'unknown';

    switch (service.type) {
      case 'statuspage':
        status = mapStatuspageIndicator(data?.status?.indicator || 'unknown');
        break;
      case 'google':
        status = mapGoogleStatus(data || []);
        break;
    }
    
    return { name: service.name, status, url: service.pageUrl };

  } catch (error) {
    return { name: service.name, status: 'unknown', url: service.pageUrl };
  }
}

export async function GET() {
  const fetches = servicesToFetch.map(fetchService);

  try {
    const results = await Promise.all(fetches);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing service status fetches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}