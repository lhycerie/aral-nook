'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StudySpace } from '@/lib/types';
import { getGoogleMapsUrl } from '@/lib/geocoding';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faClock,
  faUtensils,
  faWifi,
  faPlug,
  faSun,
  faWheelchair,
  faArrowUpRightFromSquare,
  faMap,
  faInfoCircle,
  faLocationCrosshairs
} from '@fortawesome/free-solid-svg-icons';

// Calculate distance in meters between two lat/lng points if space.distance is not pre-calculated
export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Generate color gradient: lighter warm caramel/tan for nearer, darker espresso for farther
export function getDistancePinColor(dist: number, minDist: number, maxDist: number): string {
  if (maxDist <= minDist) return 'hsl(28, 65%, 68%)';
  const t = Math.max(0, Math.min(1, (dist - minDist) / (maxDist - minDist)));
  
  // Nearer (t=0): Light warm tan HSL(28, 65%, 68%)
  // Farther (t=1): Deep espresso HSL(18, 60%, 22%)
  const hue = Math.round(28 - t * 10);
  const saturation = Math.round(65 - t * 5);
  const lightness = Math.round(68 - t * 46);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const createIcon = (color: string) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #FFF2E1;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: #FFF2E1;
        border-radius: 50%;
      "></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

const createUserPinIcon = () =>
  L.divIcon({
    className: 'user-pin-marker',
    html: `<div style="
      background: #6399D9;
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3.5px solid #FFFFFF;
      box-shadow: 0 4px 14px rgba(99,153,217,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: #FFFFFF;
        border-radius: 50%;
      "></div>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });

interface MapProps {
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

function LocationPicker({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

function MarkerFocuser({ spaceId, studySpaces }: { spaceId: string | null; studySpaces: StudySpace[] }) {
  const map = useMap();
  useEffect(() => {
    if (!spaceId) return;
    const space = studySpaces.find(s => s.id === spaceId);
    if (space) {
      map.flyTo([space.lat, space.lng], 17, { duration: 0.8 });
    }
  }, [spaceId, studySpaces, map]);
  return null;
}

export default function Map({
  studySpaces = [],
  center = [14.5995, 120.9842],
  zoom = 15,
  radiusCenter = null,
  radius = 400,
  focusedSpaceId = null,
  locationName = '',
  onSelectSpace,
  onMapClick,
}: MapProps) {
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    markersRef.current = {};
  }, [studySpaces]);

  useEffect(() => {
    if (!focusedSpaceId) return;
    const timer = setTimeout(() => {
      if (markersRef.current[focusedSpaceId]) {
        markersRef.current[focusedSpaceId].openPopup();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [focusedSpaceId]);

  // Filter study spaces to strictly stay within radius boundary
  const visibleSpaces = studySpaces.filter((space) => {
    if (!radiusCenter || !radius) return true;
    const dist = space.distance !== null && space.distance !== undefined
      ? space.distance
      : getDistanceInMeters(radiusCenter[0], radiusCenter[1], space.lat, space.lng);
    return dist <= radius;
  });

  // Compute min/max distances to calculate pin color gradient
  const distances = visibleSpaces.map((s) =>
    s.distance !== null && s.distance !== undefined
      ? s.distance
      : (radiusCenter ? getDistanceInMeters(radiusCenter[0], radiusCenter[1], s.lat, s.lng) : 0)
  );
  const minDist = distances.length > 0 ? Math.min(...distances) : 0;
  const maxDist = distances.length > 0 ? Math.max(...distances) : 1;

  return (
    <div className="h-full w-full min-h-[450px] rounded-2xl overflow-hidden shadow-lg relative isolate">
      {/* Floating map hint - placed at top-left beside zoom controls, and hidden when a place is focused to avoid overshadowing details */}
      {!focusedSpaceId && (
        <div className="absolute top-3 left-14 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-primary hidden sm:flex items-center gap-1.5 pointer-events-none border border-tertiary/20">
          <FontAwesomeIcon icon={faLocationCrosshairs} className="text-[#6399D9] w-3.5 h-3.5" />
          <span>Click map to drop pin</span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '450px' }}
      >
        <MapResizer />
        <MapUpdater center={center} zoom={zoom} />
        <LocationPicker onMapClick={onMapClick} />
        {focusedSpaceId && (
          <MarkerFocuser spaceId={focusedSpaceId} studySpaces={visibleSpaces} />
        )}

        {/* Satellite & Street View Layer Control */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street View">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.hotosm.org/">HOT</a>'
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Clean Light View">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Radius circle */}
        {radiusCenter && (
          <Circle
            center={radiusCenter}
            radius={radius}
            pathOptions={{
              color: '#6399D9',
              fillColor: '#6399D9',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '6 4',
            }}
          />
        )}

        {/* User Dropped Pin / Search Center Marker */}
        {radiusCenter && (
          <Marker position={radiusCenter} icon={createUserPinIcon()}>
            <Popup className="font-sans" autoPan={true} autoPanPadding={[40, 40]}>
              <div className="p-1 text-center font-sans min-w-[160px]">
                <p className="font-bold text-[11px] text-[#6399D9] uppercase tracking-wider mb-0.5">Dropped Pin Location</p>
                <strong className="text-sm font-bold text-primary block leading-tight">{locationName || 'Selected Location'}</strong>
                <span className="text-[11px] text-secondary/80 block mt-1">
                  Searching {radius >= 1000 ? `${(radius / 1000).toFixed(1).replace('.0', '')}km` : `${radius}m`} radius nearby
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {visibleSpaces.map((space, index) => {
          const spaceDist = distances[index] ?? 0;
          const pinColor = getDistancePinColor(spaceDist, minDist, maxDist);
          const googleMapsUrl = getGoogleMapsUrl(space.lat, space.lng, space.name);

          return (
            <Marker
              key={space.id}
              position={[space.lat, space.lng]}
              icon={createIcon(pinColor)}
              ref={(ref) => {
                if (ref) {
                  markersRef.current[space.id] = ref;
                } else {
                  delete markersRef.current[space.id];
                }
              }}
            >
              <Popup className="font-sans" autoPan={true} autoPanPadding={[40, 40]}>
                <div className="flex flex-col gap-1.5 min-w-[210px] p-1">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-base font-bold text-primary leading-tight">
                      {space.name || 'Unnamed Space'}
                    </strong>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                    <span className="capitalize px-2 py-0.5 bg-tertiary/20 rounded text-primary">
                      {space.amenity_type === 'coworking_space' ? 'Coworking' : space.amenity_type}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-white font-semibold flex items-center gap-1 text-[11px]"
                      style={{ backgroundColor: pinColor }}
                    >
                      <FontAwesomeIcon icon={faLocationDot} className="w-2.5 h-2.5" />
                      {spaceDist}m away
                    </span>
                  </div>

                  {space.address && (
                    <p className="text-xs text-secondary/80 leading-snug">
                      {space.address}
                    </p>
                  )}

                  {space.cuisine && (
                    <p className="text-xs text-secondary/70 flex items-center gap-1">
                      <FontAwesomeIcon icon={faUtensils} className="w-3 text-secondary/50" />
                      <span className="capitalize">{space.cuisine.replace(/;/g, ', ')}</span>
                    </p>
                  )}

                  {space.opening_hours && (
                    <p className="text-xs text-secondary/70 flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="w-3 text-secondary/50" />
                      <span>{space.opening_hours}</span>
                    </p>
                  )}

                  {/* Feature Badges */}
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {space.has_wifi && (
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-[#718D62]/15 text-[#3C5730] rounded flex items-center gap-1">
                        <FontAwesomeIcon icon={faWifi} className="text-[#718D62]" /> WiFi
                      </span>
                    )}
                    {space.has_power && (
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-[#EECF76]/25 text-[#8F6E1C] rounded flex items-center gap-1">
                        <FontAwesomeIcon icon={faPlug} className="text-[#C29826]" /> Power
                      </span>
                    )}
                    {space.has_outdoor_seating && (
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-[#718D62]/15 text-[#3C5730] rounded flex items-center gap-1">
                        <FontAwesomeIcon icon={faSun} className="text-[#718D62]" /> Outdoor
                      </span>
                    )}
                    {space.wheelchair === 'yes' && (
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-[#EECF76]/25 text-[#8F6E1C] rounded flex items-center gap-1">
                        <FontAwesomeIcon icon={faWheelchair} className="text-[#C29826]" /> Accessible
                      </span>
                    )}
                  </div>

                  {/* Contact, Preview & Directions Links */}
                  <div className="flex items-center gap-2 pt-2 mt-1 border-t border-tertiary/20 text-xs">
                    {onSelectSpace && (
                      <button
                        onClick={() => onSelectSpace(space)}
                        className="text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} /> Preview
                      </button>
                    )}
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary font-medium hover:underline flex items-center gap-1 ml-auto"
                    >
                      <FontAwesomeIcon icon={faMap} /> Google Maps
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Pin Distance Color Legend */}
      <div className="absolute bottom-4 left-4 z-[450] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md text-xs flex items-center gap-2.5">
        <span className="font-bold text-primary">Pin Color:</span>
        <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
          <span className="w-3.5 h-3.5 rounded-full border border-white shadow-xs inline-block" style={{ backgroundColor: 'hsl(28, 65%, 68%)' }}></span>
          <span className="font-semibold text-primary">Near</span>
          <div className="w-16 h-2 rounded-full bg-gradient-to-r from-[hsl(28,65%,68%)] via-[hsl(23,62%,45%)] to-[hsl(18,60%,22%)] mx-1"></div>
          <span className="font-semibold text-primary">Far</span>
          <span className="w-3.5 h-3.5 rounded-full border border-white shadow-xs inline-block" style={{ backgroundColor: 'hsl(18, 60%, 22%)' }}></span>
        </div>
      </div>
    </div>
  );
}
