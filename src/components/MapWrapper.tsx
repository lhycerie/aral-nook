'use client';

import dynamic from 'next/dynamic';
import { StudySpace } from '@/lib/types';

// Dynamically import the Leaflet Map component, disabling Server-Side Rendering
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[450px] w-full items-center justify-center rounded-2xl bg-tertiary/10 shadow-md">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-tertiary border-t-primary"></div>
        <p className="text-sm font-medium text-secondary">Loading Map...</p>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  studySpaces?: StudySpace[];
  center?: [number, number];
  zoom?: number;
  radiusCenter?: [number, number] | null;
  radius?: number;
  focusedSpaceId?: string | null;
  locationName?: string;
  onSelectSpace?: (space: StudySpace) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <Map {...props} />;
}
