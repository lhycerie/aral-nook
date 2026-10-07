'use client';

import { StudySpace } from '@/lib/types';
import { getGoogleMapsUrl } from '@/lib/geocoding';
import { parseOpeningHours } from '@/lib/openingHours';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faLocationDot,
  faWifi,
  faPlug,
  faSun,
  faWheelchair,
  faPhone,
  faGlobe,
  faArrowUpRightFromSquare,
  faMap,
  faMoon,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

interface SpaceCardProps {
  space: StudySpace;
  onClick?: () => void;
  isSelected?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  cafe: 'Café',
  library: 'Library',
  coworking_space: 'Coworking',
};

export default function SpaceCard({ space, onClick, isSelected = false }: SpaceCardProps) {
  const googleMapsUrl = getGoogleMapsUrl(space.lat, space.lng, space.name);
  const hoursStatus = parseOpeningHours(space.opening_hours);

  return (
    <div
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer group ${
        isSelected
          ? 'bg-[#FFF2E1] ring-2 ring-[#6E5541] shadow-md -translate-y-0.5'
          : 'bg-white shadow-xs hover:shadow-md hover:bg-tertiary/10'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-primary group-hover:text-secondary transition-colors leading-tight">
          {space.name}
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-tertiary/20 rounded-md text-secondary capitalize shrink-0 ml-2">
          {TYPE_LABELS[space.amenity_type] || space.amenity_type}
        </span>
      </div>

      {space.address && (
        <p className="text-sm text-secondary/70 mb-2 leading-snug">{space.address}</p>
      )}

      {/* Opening Hours Status Badge */}
      <div className="mb-2">
        {hoursStatus.is247 ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#6399D9]/15 text-[#2A5F9E] shadow-2xs">
            <FontAwesomeIcon icon={faMoon} className="w-3 h-3 text-[#6399D9]" />
            <span>Open 24/7</span>
          </span>
        ) : hoursStatus.isOpenNow === true ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#718D62]/15 text-[#3C5730] shadow-2xs">
            <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 text-[#718D62]" />
            <span>{hoursStatus.displayText}</span>
          </span>
        ) : hoursStatus.isOpenNow === false ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EE7676]/15 text-[#B83E3E] shadow-2xs">
            <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 text-[#EE7676]" />
            <span>{hoursStatus.displayText}</span>
          </span>
        ) : space.opening_hours ? (
          <p className="text-xs text-secondary/60 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-secondary/50" />
            {space.opening_hours}
          </p>
        ) : null}
      </div>

      {space.cuisine && (
        <p className="text-xs text-secondary/60 mb-2 capitalize">
          Cuisine: {space.cuisine.replace(/;/g, ', ')}
        </p>
      )}

      {/* Amenity badges */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {space.distance !== null && (
          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md flex items-center gap-1">
            <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3" />
            {space.distance}m
          </span>
        )}
        {space.has_wifi && (
          <span className="text-xs font-medium px-2 py-1 bg-[#718D62]/15 text-[#3C5730] rounded-md flex items-center gap-1">
            <FontAwesomeIcon icon={faWifi} className="w-3 h-3 text-[#718D62]" /> WiFi
          </span>
        )}
        {space.has_power && (
          <span className="text-xs font-medium px-2 py-1 bg-[#EECF76]/25 text-[#8F6E1C] rounded-md flex items-center gap-1">
            <FontAwesomeIcon icon={faPlug} className="w-3 h-3 text-[#C29826]" /> Power
          </span>
        )}
        {space.has_outdoor_seating && (
          <span className="text-xs font-medium px-2 py-1 bg-[#718D62]/15 text-[#3C5730] rounded-md flex items-center gap-1">
            <FontAwesomeIcon icon={faSun} className="w-3 h-3 text-[#718D62]" /> Outdoor
          </span>
        )}
        {space.wheelchair === 'yes' && (
          <span className="text-xs font-medium px-2 py-1 bg-[#EECF76]/25 text-[#8F6E1C] rounded-md flex items-center gap-1">
            <FontAwesomeIcon icon={faWheelchair} className="w-3 h-3 text-[#C29826]" /> Accessible
          </span>
        )}
      </div>

      {/* Action links */}
      <div className="flex items-center gap-3 pt-2">
        {space.phone && (
          <a
            href={`tel:${space.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 py-1"
          >
            <FontAwesomeIcon icon={faPhone} className="w-3 h-3" /> Call
          </a>
        )}
        {space.website && (
          <a
            href={space.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 py-1"
          >
            <FontAwesomeIcon icon={faGlobe} className="w-3 h-3" /> Website
          </a>
        )}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 py-1 ml-auto font-medium"
        >
          <FontAwesomeIcon icon={faMap} className="w-3 h-3" /> Google Maps
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
