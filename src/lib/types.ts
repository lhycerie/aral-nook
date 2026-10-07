export type AmenityType = 'cafe' | 'library' | 'coworking_space';

export interface StudySpace {
  id: string;
  osm_id: number;
  name: string;
  amenity_type: AmenityType | string;
  lat: number;
  lng: number;
  address: string | null;
  has_wifi: boolean;
  has_power: boolean;
  has_outdoor_seating: boolean;
  opening_hours: string | null;
  is_open_now?: boolean | null;
  is_247?: boolean;
  distance: number | null; // meters from search center
  cuisine: string | null;
  phone: string | null;
  website: string | null;
  wheelchair: string | null;
  description: string | null;
  created_at: string;
}

export interface SearchFilters {
  amenityTypes: AmenityType[];
  wifi: boolean;
  power: boolean;
  outdoorSeating: boolean;
  openNow: boolean;
  is247: boolean;
  closed?: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  amenityTypes: ['cafe', 'library', 'coworking_space'],
  wifi: false,
  power: false,
  outdoorSeating: false,
  openNow: false,
  is247: false,
  closed: false,
};

// Type used when fetching raw data from Overpass (nodes and ways with center)
export interface OsmElement {
  type: 'node' | 'way';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    amenity?: string;
    office?: string;
    opening_hours?: string;
    internet_access?: string;
    wifi?: string;
    'addr:street'?: string;
    'addr:city'?: string;
    'addr:full'?: string;
    outdoor_seating?: string;
    socket?: string;
    'socket:type2'?: string;
    cuisine?: string;
    phone?: string;
    'contact:phone'?: string;
    website?: string;
    'contact:website'?: string;
    wheelchair?: string;
    description?: string;
    [key: string]: string | undefined;
  };
}

export type OsmNode = OsmElement;
