'use client';

import React, { useEffect } from 'react';
import { StudySpace } from '@/lib/types';
import { getGoogleMapsUrl } from '@/lib/geocoding';
import { parseOpeningHours } from '@/lib/openingHours';
import Notebook from './Notebook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faClock,
  faPhone,
  faGlobe,
  faUtensils,
  faWifi,
  faPlug,
  faSun,
  faWheelchair,
  faMap,
  faArrowUpRightFromSquare,
  faMoon,
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';

interface PlaceDetailModalProps {
  space: StudySpace | null;
  onClose: () => void;
}

const PREVIEW_IMAGES: Record<string, string> = {
  cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  library: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
  coworking_space: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
};

export default function PlaceDetailModal({ space, onClose }: PlaceDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!space) return null;

  const googleMapsUrl = getGoogleMapsUrl(space.lat, space.lng, space.name);
  const previewImage = PREVIEW_IMAGES[space.amenity_type] || PREVIEW_IMAGES.default;
  const hoursStatus = parseOpeningHours(space.opening_hours);

  // Left Page: Polaroid Specimen, Identity & Field Coordinates
  const leftPageContent = (
    <div className="h-full w-full flex flex-col justify-between overflow-y-auto notebook-scroll pr-1 text-[#3B2818]">
      <div>
        {/* Dossier Header Stamp */}
        <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2 pb-1 border-b border-[#3B2818]/20">
          <span className="text-[8px] sm:text-[10px] md:text-[11px] font-mono tracking-widest text-[#7C2D12] uppercase font-bold">
            FIELD LOG // REF #{String(space.id).slice(-4)}
          </span>
          <span className="text-[8px] sm:text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#6E5541]/15 text-[#543825]">
            {space.amenity_type === 'coworking_space' ? 'Coworking' : space.amenity_type}
          </span>
        </div>

        {/* Polaroid Photo with Washi Tape */}
        <div className="relative my-1 sm:my-1.5 mx-auto w-[92%] sm:w-[88%] bg-[#FAF7F2] p-1.5 sm:p-2 pb-2 sm:pb-3 shadow-md border border-[#E2D8CC] -rotate-1 hover:rotate-0 transition-transform">
          {/* Washi Tape Strip */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-3.5 sm:h-4 bg-[#E2D5BE]/85 border-x border-[#C2B295] shadow-xs rotate-1 pointer-events-none z-10" />

          <div className="relative w-full h-16 sm:h-24 md:h-28 bg-[#EAE2D5] overflow-hidden rounded-[2px]">
            <img
              src={previewImage}
              alt={space.name}
              className="w-full h-full object-cover filter contrast-[1.04] sepia-[0.08]"
            />
          </div>

          <p className="font-handwriting text-xs sm:text-sm md:text-base text-[#4A3B32] text-center mt-1 sm:mt-1.5 truncate leading-tight">
            ~ {space.name} ~
          </p>
        </div>

        {/* Spot Name & Location */}
        <div className="mt-1">
          <h3 className="font-bold text-[11px] sm:text-sm md:text-base text-[#2E1E12] leading-tight line-clamp-2">
            {space.name}
          </h3>

          {space.address && (
            <p className="mt-1 text-[8px] sm:text-[11px] text-[#5C4535] flex items-start gap-1 leading-snug">
              <FontAwesomeIcon icon={faLocationDot} className="w-2.5 h-2.5 text-[#8C6D53] mt-0.5 shrink-0" />
              <span className="line-clamp-2">{space.address}</span>
            </p>
          )}

          {space.distance !== null && space.distance !== undefined && (
            <p className="mt-0.5 text-[8px] sm:text-[10px] text-[#8C6D53] font-mono">
              ◈ {space.distance}m from search beacon
            </p>
          )}
        </div>
      </div>

      {/* Bottom Left Note */}
      <div className="mt-1 sm:mt-2 pt-1 border-t border-dashed border-[#3B2818]/20 flex items-center justify-between text-[8px] sm:text-[10px] text-[#7A6453]">
        <span className="font-mono">ARALNOOK ARCHIVE</span>
        <span className="font-handwriting text-xs sm:text-sm">Verified Specimen ✓</span>
      </div>
    </div>
  );

  // Right Page: Field Inspection, Status Stamp, Relics Checklist & Action Buttons
  const rightPageContent = (
    <div className="h-full w-full flex flex-col justify-between overflow-y-auto notebook-scroll pr-1 text-[#3B2818]">
      <div className="space-y-1.5 sm:space-y-2">
        {/* Top Status & Weathered Rubber Stamp */}
        <div className="flex items-center justify-between gap-1">
          {hoursStatus.is247 ? (
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 rounded border border-dashed border-[#6399D9]/70 text-[#2A5F9E] bg-[#6399D9]/15 -rotate-1 shadow-xs uppercase">
              <FontAwesomeIcon icon={faMoon} className="text-[#6399D9] text-[9px]" /> 24/7 Haven
            </span>
          ) : hoursStatus.isOpenNow === true ? (
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 rounded border border-dashed border-[#718D62]/70 text-[#3C5730] bg-[#718D62]/15 -rotate-2 shadow-xs uppercase">
              <FontAwesomeIcon icon={faCircleCheck} className="text-[#718D62] text-[9px]" /> Open Now
            </span>
          ) : hoursStatus.isOpenNow === false ? (
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 rounded border border-dashed border-[#EE7676]/70 text-[#B83E3E] bg-[#EE7676]/15 rotate-2 shadow-xs uppercase">
              <FontAwesomeIcon icon={faCircleXmark} className="text-[#EE7676] text-[9px]" /> Closed
            </span>
          ) : (
            <span className="text-[8px] sm:text-[10px] font-mono text-[#8C6D53] uppercase border border-dashed border-[#8C6D53]/40 px-1.5 py-0.5 rounded">
              Hours Unlogged
            </span>
          )}

          <span className="font-handwriting text-xs sm:text-sm text-[#7A6453]">
            Field Inspection
          </span>
        </div>

        {/* Opening Hours */}
        <div className="bg-[#EFE8DC]/50 p-1 sm:p-1.5 rounded border border-[#DACFBF] text-[8px] sm:text-[11px]">
          <div className="flex items-center gap-1 font-semibold text-[#543825] mb-0.5">
            <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5 text-[#8C6D53]" />
            <span>Operational Hours</span>
          </div>
          <p className="text-[#3B2818] font-medium leading-tight">
            {space.opening_hours || 'Schedule unwritten on OSM (verify on arrival)'}
          </p>
        </div>

        {/* Amenities & Relics Checklist */}
        <div>
          <p className="text-[8px] sm:text-[10px] font-mono uppercase text-[#7A6453] tracking-wider mb-1">
            Sanctuary Relics & Features
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[8px] sm:text-[10px]">
            {space.has_wifi && (
              <div className="flex items-center gap-1 text-[#3C5730] bg-[#718D62]/15 px-1.5 py-0.5 rounded border border-[#718D62]/30">
                <FontAwesomeIcon icon={faWifi} className="text-[#718D62] text-[9px]" />
                <span>WiFi Network</span>
              </div>
            )}
            {space.has_power && (
              <div className="flex items-center gap-1 text-[#8F6E1C] bg-[#EECF76]/20 px-1.5 py-0.5 rounded border border-[#EECF76]/40">
                <FontAwesomeIcon icon={faPlug} className="text-[#C29826] text-[9px]" />
                <span>Power Outlets</span>
              </div>
            )}
            {space.has_outdoor_seating && (
              <div className="flex items-center gap-1 text-[#3C5730] bg-[#718D62]/15 px-1.5 py-0.5 rounded border border-[#718D62]/30">
                <FontAwesomeIcon icon={faSun} className="text-[#718D62] text-[9px]" />
                <span>Open Air Patio</span>
              </div>
            )}
            {space.wheelchair === 'yes' && (
              <div className="flex items-center gap-1 text-[#8F6E1C] bg-[#EECF76]/20 px-1.5 py-0.5 rounded border border-[#EECF76]/40">
                <FontAwesomeIcon icon={faWheelchair} className="text-[#C29826] text-[9px]" />
                <span>Accessible</span>
              </div>
            )}
            {space.cuisine && (
              <div className="col-span-1 sm:col-span-2 flex items-center gap-1 text-[#543825] bg-[#EFE8DC]/60 px-1.5 py-0.5 rounded border border-[#DACFBF]">
                <FontAwesomeIcon icon={faUtensils} className="text-[9px] text-[#8C6D53]" />
                <span className="truncate capitalize">{space.cuisine.replace(/;/g, ', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Explorer Marginalia / Handwritten Note */}
        <div className="bg-[#FAF6EE] p-1.5 sm:p-2 rounded border-l-2 border-[#8C6D53] shadow-2xs">
          <p className="font-handwriting text-xs sm:text-sm md:text-base text-[#4A3B32] leading-snug">
            {space.description ||
              `"A quiet sanctuary discovered in the wild. Suitable for deep study, scribbling scrolls, and sipping tea."`}
          </p>
        </div>
      </div>

      {/* Quick Action Expedition Buttons */}
      <div className="mt-1 sm:mt-2 pt-1 border-t border-[#3B2818]/20 flex flex-wrap gap-1 sm:gap-1.5">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-1 sm:py-1.5 px-2 bg-[#5A3E2B] hover:bg-[#432D1E] text-[#FFF4E5] text-[8px] sm:text-xs font-semibold rounded-md shadow-xs transition-colors"
        >
          <FontAwesomeIcon icon={faMap} className="text-[9px]" />
          <span>Navigate 🧭</span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[7px] opacity-75" />
        </a>
        {space.phone && (
          <a
            href={`tel:${space.phone}`}
            className="flex items-center justify-center gap-1 py-1 sm:py-1.5 px-2 bg-[#E2D5BE] hover:bg-[#D4C3A7] text-[#3B2818] text-[8px] sm:text-xs font-semibold rounded-md transition-colors shadow-2xs"
            title={`Call ${space.phone}`}
          >
            <FontAwesomeIcon icon={faPhone} className="text-[8px]" />
            <span>Call</span>
          </a>
        )}
        {space.website && (
          <a
            href={space.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-1 sm:py-1.5 px-2 bg-[#E2D5BE] hover:bg-[#D4C3A7] text-[#3B2818] text-[8px] sm:text-xs font-semibold rounded-md transition-colors shadow-2xs"
            title="Visit Portal"
          >
            <FontAwesomeIcon icon={faGlobe} className="text-[8px]" />
            <span>Portal</span>
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-[1000px] my-auto">
        {/* Antique Wax Seal Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 right-2 sm:top-0 sm:right-6 z-[130] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#701a1a] hover:bg-[#852020] text-[#FFF4E5] border border-[#a83232] shadow-2xl text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          aria-label="Close dossier"
        >
          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#521313] flex items-center justify-center text-[9px] sm:text-[10px]">
            ✕
          </span>
          <span className="font-handwriting text-sm sm:text-base tracking-wide">Close Log</span>
        </button>

        {/* Notebook Dossier Component */}
        <Notebook
          forceAnimated={true}
          leftContent={leftPageContent}
          rightContent={rightPageContent}
        />
      </div>
    </div>
  );
}
