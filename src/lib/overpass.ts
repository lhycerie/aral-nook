import { OsmElement, StudySpace, AmenityType } from './types';
import { parseOpeningHours } from './openingHours';

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in meters.
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Client-side cache to avoid repeated queries
const clientCache = new Map<string, { timestamp: number; spaces: StudySpace[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function buildClientOverpassQuery(lat: number, lng: number, amenityTypes: string[], radius: number): string {
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

function transformOsmElements(elements: OsmElement[], centerLat: number, centerLng: number, radius?: number): StudySpace[] {
  const seenIds = new Set<string>();

  return elements
    .filter((el: OsmElement) => el.tags && (el.lat !== undefined || el.center !== undefined))
    .map((el: OsmElement): StudySpace | null => {
      const elemLat = el.lat ?? el.center?.lat;
      const elemLng = el.lon ?? el.center?.lon;
      if (elemLat === undefined || elemLng === undefined) return null;

      const uniqueId = `${el.type}-${el.id}`;
      if (seenIds.has(uniqueId)) return null;
      seenIds.add(uniqueId);

      const tags = el.tags || {};
      const hasWifi =
        tags.internet_access === 'wlan' ||
        tags.internet_access === 'yes' ||
        tags.wifi === 'yes' ||
        tags.wifi === 'free';

      const hasPower =
        tags.socket !== undefined ||
        tags['socket:type2'] !== undefined;

      const hasOutdoorSeating =
        tags.outdoor_seating === 'yes';

      const distance = haversineDistance(centerLat, centerLng, elemLat, elemLng);

      // Strictly discard items outside radius boundary
      if (radius !== undefined && distance > radius) {
        return null;
      }

      const address = tags['addr:full']
        || (tags['addr:street']
          ? `${tags['addr:street']}${tags['addr:city'] ? `, ${tags['addr:city']}` : ''}`
          : null);

      const openingHoursStr = tags.opening_hours || null;
      const hoursParsed = parseOpeningHours(openingHoursStr);

      const amenityTypeStr: string = tags.amenity || (tags.office === 'coworking' ? 'coworking_space' : 'unknown');

      return {
        id: uniqueId,
        osm_id: el.id,
        name: tags.name || 'Unnamed Study Space',
        amenity_type: amenityTypeStr,
        lat: elemLat,
        lng: elemLng,
        address,
        has_wifi: hasWifi,
        has_power: hasPower,
        has_outdoor_seating: hasOutdoorSeating,
        opening_hours: openingHoursStr,
        is_open_now: hoursParsed.isOpenNow,
        is_247: hoursParsed.is247,
        distance: Math.round(distance),
        cuisine: tags.cuisine || null,
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        wheelchair: tags.wheelchair || null,
        description: tags.description || null,
        created_at: new Date().toISOString(),
      };
    })
    .filter((space: StudySpace | null): space is StudySpace => space !== null)
    .sort((a: StudySpace, b: StudySpace) => (a.distance ?? 0) - (b.distance ?? 0));
}

const CLIENT_OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

export async function fetchStudySpaces(
  lat: number,
  lng: number,
  amenityTypes: AmenityType[] = ['cafe', 'library', 'coworking_space'],
  radius: number = 800
): Promise<StudySpace[]> {
  const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}_${[...amenityTypes].sort().join(',')}`;
  const cached = clientCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.spaces;
  }

  let elements: OsmElement[] = [];
  let fetchSucceeded = false;

  // 1. Try our Next.js API route first (Edge-cached, custom User-Agent, server-to-server speed)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const res = await fetch('/api/overpass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat,
        lng,
        amenityTypes,
        radius,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.elements)) {
        elements = data.elements;
        fetchSucceeded = true;
      }
    }
  } catch (err) {
    console.warn('Backend /api/overpass attempt failed or timed out:', err);
  }

  // 2. If backend was unreachable or returned 503, attempt direct browser fetch across mirrors
  if (!fetchSucceeded) {
    const query = buildClientOverpassQuery(lat, lng, amenityTypes, radius);

    for (const mirror of CLIENT_OVERPASS_MIRRORS) {
      try {
        console.info(`Attempting direct browser fetch to Overpass mirror: ${mirror}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const directRes = await fetch(mirror, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (directRes.ok) {
          const directData = await directRes.json();
          if (Array.isArray(directData.elements)) {
            elements = directData.elements;
            fetchSucceeded = true;
            break;
          }
        }
      } catch (clientErr) {
        console.warn(`Direct Overpass mirror ${mirror} failed:`, clientErr);
      }
    }
  }

  // 3. Process OSM results strictly within the radius
  let spaces: StudySpace[] = [];
  if (elements.length > 0) {
    spaces = transformOsmElements(elements, lat, lng, radius);
  }

  // Cache results (even empty arrays so repeated queries don't hammer the API)
  clientCache.set(cacheKey, { timestamp: Date.now(), spaces });

  return spaces;
}
