'use client';

import { SearchFilters, AmenityType } from '@/lib/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCoffee,
  faBook,
  faLaptop,
  faWifi,
  faPlug,
  faSun,
  faClock,
  faMoon,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface FilterBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

const AMENITY_TYPES: { type: AmenityType; label: string; icon: IconDefinition }[] = [
  { type: 'cafe', label: 'Cafés', icon: faCoffee },
  { type: 'library', label: 'Libraries', icon: faBook },
  { type: 'coworking_space', label: 'Coworking', icon: faLaptop },
];

const FEATURE_FILTERS: { key: 'wifi' | 'power' | 'outdoorSeating'; label: string; icon: IconDefinition }[] = [
  { key: 'wifi', label: 'WiFi', icon: faWifi },
  { key: 'power', label: 'Power Outlets', icon: faPlug },
  { key: 'outdoorSeating', label: 'Outdoor', icon: faSun },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggleAmenityType = (type: AmenityType) => {
    const current = filters.amenityTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    if (updated.length === 0) return;
    onChange({ ...filters, amenityTypes: updated });
  };

  const toggleFeature = (key: 'wifi' | 'power' | 'outdoorSeating') => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const toggleOpenNow = () => {
    onChange({
      ...filters,
      openNow: !filters.openNow,
      ...(filters.openNow ? {} : { closed: false }),
    });
  };

  const toggleIs247 = () => {
    onChange({
      ...filters,
      is247: !filters.is247,
      ...(filters.is247 ? {} : { closed: false }),
    });
  };

  const toggleClosed = () => {
    onChange({
      ...filters,
      closed: !filters.closed,
      ...(filters.closed ? {} : { openNow: false, is247: false }),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Availability / Operating Hours Section */}
      <div>
        <p className="text-xs font-medium text-secondary mb-2 uppercase tracking-wider">Availability</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleOpenNow}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-0 transition-all ${
              filters.openNow
                ? 'bg-[#718D62] text-white shadow-sm'
                : 'bg-tertiary/20 text-secondary hover:bg-tertiary/40'
            }`}
          >
            <FontAwesomeIcon
              icon={faClock}
              className={`w-3.5 h-3.5 ${filters.openNow ? 'text-white' : 'text-[#718D62]'}`}
            />
            <span>Open Now</span>
          </button>

          <button
            onClick={toggleIs247}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-0 transition-all ${
              filters.is247
                ? 'bg-[#6399D9] text-white shadow-sm'
                : 'bg-tertiary/20 text-secondary hover:bg-tertiary/40'
            }`}
          >
            <FontAwesomeIcon
              icon={faMoon}
              className={`w-3.5 h-3.5 ${filters.is247 ? 'text-white' : 'text-[#6399D9]'}`}
            />
            <span>24/7</span>
          </button>

          <button
            onClick={toggleClosed}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-0 transition-all ${
              filters.closed
                ? 'bg-[#EE7676] text-white shadow-sm'
                : 'bg-tertiary/20 text-secondary hover:bg-tertiary/40'
            }`}
          >
            <FontAwesomeIcon
              icon={faTimesCircle}
              className={`w-3.5 h-3.5 ${filters.closed ? 'text-white' : 'text-[#EE7676]'}`}
            />
            <span>Closed</span>
          </button>
        </div>
      </div>

      {/* Place Type Section */}
      <div>
        <p className="text-xs font-medium text-secondary mb-2 uppercase tracking-wider">Place Type</p>
        <div className="flex flex-wrap gap-2">
          {AMENITY_TYPES.map(({ type, label, icon }) => {
            const active = filters.amenityTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleAmenityType(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-tertiary/20 text-secondary hover:bg-tertiary/40'
                  }`}
              >
                <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities Section */}
      <div>
        <p className="text-xs font-medium text-secondary mb-2 uppercase tracking-wider">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {FEATURE_FILTERS.map(({ key, label, icon }) => {
            const active = filters[key];
            return (
              <button
                key={key}
                onClick={() => toggleFeature(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-tertiary/20 text-secondary hover:bg-tertiary/40'
                  }`}
              >
                <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
