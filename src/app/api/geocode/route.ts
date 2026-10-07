import { NextResponse } from 'next/server';

interface CacheEntry {
  data: any;
  timestamp: number;
}

// In-memory cache with 2-hour TTL to prevent repetitive geocoding requests
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;

function getFromCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setInCache(key: string, data: any) {
  if (cache.size > 1000) {
    const firstKeys = Array.from(cache.keys()).slice(0, 200);
    firstKeys.forEach((k) => cache.delete(k));
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// Reverse geocode using BigDataCloud (fast, no rate-limiting, clean administrative names)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const cacheKey = `rev:${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  // 1. BigDataCloud Reverse Geocoding
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(bdcUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const primary = data.locality || data.city;
      const subdivision = data.principalSubdivision;
      const country = data.countryName;
      const parts = [primary, subdivision, country].filter(Boolean);
      if (parts.length > 0) {
        const name = parts.join(', ');
        setInCache(cacheKey, name);
        return name;
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode error:', err);
  }

  // 2. Nominatim Reverse fallback
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AralNook-StudySpaces/1.0 (contact@aralnook.ph)',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const displayName =
        data.address?.city ||
        data.address?.town ||
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.display_name?.split(',')[0] ||
        'Selected Location';
      setInCache(cacheKey, displayName);
      return displayName;
    }
  } catch (err) {
    console.warn('Nominatim reverse error:', err);
  }

  // 3. Photon Reverse fallback
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const res = await fetch(photonUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const p = data.features?.[0]?.properties;
      if (p) {
        const displayName = p.name || p.city || p.district || p.state || 'Selected Location';
        setInCache(cacheKey, displayName);
        return displayName;
      }
    }
  } catch (err) {
    console.warn('Photon reverse error:', err);
  }

  return 'Selected Location';
}

// Forward geocode with robust ranking and coordinate support
async function forwardGeocode(query: string) {
  const cleanQuery = query.trim();
  const cacheKey = `geo:${cleanQuery.toLowerCase()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  // 1. Direct coordinate support (e.g. "14.5995, 120.9842" or "14.5995,120.9842")
  const coordMatch = cleanQuery.match(/^([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      const displayName = await reverseGeocode(lat, lng);
      const result = { lat, lng, displayName: displayName || cleanQuery };
      setInCache(cacheKey, result);
      return result;
    }
  }

  // 2. Photon OSM Geocoding (high availability, no 429 rate limit)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=10`;
    const res = await fetch(photonUrl, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const features = data.features || [];

      if (features.length > 0) {
        // Sort features: prioritize Philippine locations, then cities/towns over minor residential streets
        const ranked = [...features].sort((a, b) => {
          const aIsPH = a.properties?.country === 'Philippines' || a.properties?.countrycode === 'PH';
          const bIsPH = b.properties?.country === 'Philippines' || b.properties?.countrycode === 'PH';
          if (aIsPH && !bIsPH) return -1;
          if (!aIsPH && bIsPH) return 1;

          const cityTypes = ['city', 'town', 'district', 'suburb', 'neighbourhood', 'municipality', 'state', 'province', 'country'];
          const aIsCity = cityTypes.includes(a.properties?.osm_value);
          const bIsCity = cityTypes.includes(b.properties?.osm_value);
          if (aIsCity && !bIsCity) return -1;
          if (!aIsCity && bIsCity) return 1;

          return 0;
        });

        const chosen = ranked[0];
        const [lng, lat] = chosen.geometry.coordinates;
        const p = chosen.properties || {};
        const locationParts = [p.name, p.street, p.city || p.district, p.state, p.country].filter(Boolean);
        const displayName = locationParts.join(', ') || p.name || cleanQuery;

        const result = { lat, lng, displayName };
        setInCache(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Photon forward geocode error:', err);
  }

  // 3. Nominatim Fallback
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanQuery
    )}&format=json&limit=1&addressdetails=1`;

    const res = await fetch(nomUrl, {
      headers: {
        'User-Agent': 'AralNook-StudySpaces/1.0 (contact@aralnook.ph)',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const result = {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name,
        };
        setInCache(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Nominatim fallback error:', err);
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (query) {
      const result = await forwardGeocode(query);
      if (result) {
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }
      const displayName = await reverseGeocode(lat, lng);
      return NextResponse.json({ displayName });
    }

    return NextResponse.json({ error: 'Missing query or coordinates' }, { status: 400 });
  } catch (error) {
    console.error('Geocoding route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
