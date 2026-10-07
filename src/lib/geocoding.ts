export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocode(query: string): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
      return {
        lat: data.lat,
        lng: data.lng,
        displayName: data.displayName || query,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to geocode:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.displayName || 'Selected Location';
  } catch (error) {
    console.error('Failed to reverse geocode:', error);
    return null;
  }
}export function getGoogleMapsUrl(lat: number, lng: number, name?: string): string {
  const placeName = name && name !== 'Unnamed Space' ? name : 'Study Space';
  return `https://www.google.com/maps?q=${lat},${lng}+(${encodeURIComponent(placeName)})`;
}
