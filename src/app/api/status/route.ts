import { NextResponse } from 'next/server';
import type { ServiceStatus } from '@/lib/types';

type StatuspageIndicator = 'none' | 'minor' | 'major' | 'critical';

const servicesToFetch = [
  { name: 'GitHub', url: 'https://www.githubstatus.com/api/v2/status.json', type: 'statuspage' },
  { name: 'Cloudflare', url: 'https://www.cloudflarestatus.com/api/v2/status.json', type: 'statuspage' },
  { name: 'OpenAI (ChatGPT)', url: 'https://status.openai.com/api/v2/status.json', type: 'statuspage' },
  { name: 'Anthropic (Claude)', url: 'https://status.anthropic.com/api/v2/status.json', type: 'statuspage' },
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

async function fetchService(service: typeof servicesToFetch[0]): Promise<{ name: string, status: ServiceStatus, url: string }> {
  try {
    const response = await fetch(service.url, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch status (${response.status})`);
    const data = await response.json();
    let status: ServiceStatus = 'unknown';

    if (service.type === 'statuspage') {
      status = mapStatuspageIndicator(data?.status?.indicator || 'unknown');
    }
    
    return { name: service.name, status, url: service.url.replace('/api/v2/status.json', '') };

  } catch (error) {
    return { name: service.name, status: 'unknown', url: service.url.replace('/api/v2/status.json', '') };
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