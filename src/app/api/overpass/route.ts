import { NextResponse } from 'next/server';

export const maxDuration = 25;
export const dynamic = 'force-dynamic';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

const USER_AGENT = 'AralNook-StudyApp/1.0 (https://aralnook.vercel.app; student study space finder)';

function buildQuery(lat: number, lng: number, amenityTypes: string[], radius: number): string {
  const parts: string[] = [];

  for (const type of amenityTypes) {
    if (type === 'coworking_space') {
      parts.push(`  node["office"="coworking"](around:${radius},${lat},${lng});`);
      parts.push(`  way["office"="coworking"](around:${radius},${lat},${lng});`);
      parts.push(`  node["amenity"="coworking_space"](around:${radius},${lat},${lng});`);
      parts.push(`  way["amenity"="coworking_space"](around:${radius},${lat},${lng});`);
    } else {
      parts.push(`  node["amenity"="${type}"](around:${radius},${lat},${lng});`);
      parts.push(`  way["amenity"="${type}"](around:${radius},${lat},${lng});`);
    }
  }

  return `[out:json][timeout:8];
(
${parts.join('\n')}
);
out center body;`;
}

async function fetchFromEndpoint(endpoint: string, query: string, timeoutMs: number): Promise<any[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Endpoint ${endpoint} returned ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data.elements)) {
      return data.elements;
    }
    throw new Error('Invalid elements array');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: Request) {
  try {
    const { lat, lng, amenityTypes = ['cafe', 'library', 'coworking_space'], radius = 800 } = await request.json();

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
    }

    const query = buildQuery(lat, lng, amenityTypes, radius);

    let elements: any[] = [];
    let isSuccess = false;

    // Rotate through high-availability Overpass mirrors (failover quickly after 5.5s)
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        elements = await fetchFromEndpoint(endpoint, query, 5500);
        isSuccess = true;
        break;
      } catch (err: any) {
        console.warn(`Overpass mirror ${endpoint} failed: ${err.message}`);
      }
    }

    if (!isSuccess) {
      return NextResponse.json(
        { elements: [], error: 'Overpass mirrors timed out or are busy. Client will attempt direct fallback.', isOffline: true },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { elements, isOffline: false },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error('Server error in /api/overpass route:', error);
    return NextResponse.json({ elements: [], error: 'Server error', isOffline: true }, { status: 500 });
  }
}
