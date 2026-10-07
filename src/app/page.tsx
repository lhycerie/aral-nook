'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FilterBar from '@/components/FilterBar';
import SpaceCard from '@/components/SpaceCard';
import MapWrapper from '@/components/MapWrapper';
import Footer from '@/components/Footer';
import Notebook from '@/components/Notebook';
import MobileNotebookModal from '@/components/MobileNotebookModal';
import LogoSplash from '@/components/LogoSplash';
import { StudySpace, SearchFilters, DEFAULT_FILTERS, AmenityType } from '@/lib/types';
import { geocode, reverseGeocode } from '@/lib/geocoding';
import { fetchStudySpaces } from '@/lib/overpass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faLocationCrosshairs,
  faLocationDot,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

function HomeContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [spaces, setSpaces] = useState<StudySpace[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<StudySpace[]>([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]);
  const [radiusCenter, setRadiusCenter] = useState<[number, number] | null>([14.5995, 120.9842]);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [focusedSpaceId, setFocusedSpaceId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>(initialQuery || 'Manila');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(800);
  const [isMobileNotebookOpen, setIsMobileNotebookOpen] = useState(false);

  const mapSectionRef = useRef<HTMLDivElement>(null);
  const notebookSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobileNotebookOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileNotebookOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileNotebookOpen]);

  const scrollToNotebook = () => {
    if (notebookSectionRef.current) {
      notebookSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToMap = () => {
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Apply client-side filters
  const applyFilters = useCallback(
    (allSpaces: StudySpace[], currentFilters: SearchFilters) => {
      // Strictly exclude any spots outside the active search radius
      let result = allSpaces.filter((s) => s.distance === null || s.distance === undefined || s.distance <= searchRadius);

      if (currentFilters.wifi) {
        result = result.filter((s) => s.has_wifi);
      }
      if (currentFilters.power) {
        result = result.filter((s) => s.has_power);
      }
      if (currentFilters.outdoorSeating) {
        result = result.filter((s) => s.has_outdoor_seating);
      }
      if (currentFilters.openNow) {
        result = result.filter((s) => s.is_open_now === true);
      }
      if (currentFilters.closed) {
        result = result.filter((s) => s.is_open_now === false);
      }
      if (currentFilters.is247) {
        result = result.filter((s) => s.is_247 === true);
      }

      setFilteredSpaces(result);
      setVisibleCount(8); // Reset to 8 results on filter change
    },
    [searchRadius]
  );

  // Search function — geocodes and fetches
  const doSearch = useCallback(
    async (
      query: string,
      amenityTypes = filters.amenityTypes,
      scrollAfter = true,
      radius = searchRadius
    ) => {
      if (!query.trim()) return;
      setIsLoading(true);
      setHasSearched(true);
      setVisibleCount(8);

      try {
        const geocodeResult = await geocode(query);
        if (geocodeResult) {
          const newCenter: [number, number] = [geocodeResult.lat, geocodeResult.lng];
          setMapCenter(newCenter);
          setRadiusCenter(newCenter);
          const resolvedName = geocodeResult.displayName || query;
          setLocationName(resolvedName);
          setSearchQuery(resolvedName);

          const results = await fetchStudySpaces(
            geocodeResult.lat,
            geocodeResult.lng,
            amenityTypes,
            radius
          );
          setSpaces(results);
          applyFilters(results, filters);
        } else {
          setSpaces([]);
          setFilteredSpaces([]);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
        if (scrollAfter) {
          scrollToMap();
        }
      }
    },
    [filters, applyFilters, searchRadius]
  );

  // Fetch from the current map center without re-geocoding
  const fetchFromCenter = useCallback(
    async (amenityTypes: AmenityType[], radius = searchRadius) => {
      if (!radiusCenter) return;
      setIsLoading(true);
      try {
        const results = await fetchStudySpaces(
          radiusCenter[0],
          radiusCenter[1],
          amenityTypes,
          radius
        );
        setSpaces(results);
        applyFilters(results, { ...filters, amenityTypes });
      } catch (err) {
        console.error('Error re-fetching with new amenity types:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [radiusCenter, searchRadius, filters, applyFilters]
  );

  // Handle Geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setIsLoading(true);
    setHasSearched(true);
    setVisibleCount(8);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCenter: [number, number] = [latitude, longitude];
        setMapCenter(newCenter);
        setRadiusCenter(newCenter);

        const placeName = await reverseGeocode(latitude, longitude);
        const displayName = placeName || 'Current Location';
        setLocationName(displayName);
        setSearchQuery(displayName);

        try {
          const results = await fetchStudySpaces(latitude, longitude, filters.amenityTypes, searchRadius);
          setSpaces(results);
          applyFilters(results, filters);
        } catch (err) {
          console.error('Error fetching study spaces for location:', err);
        } finally {
          setIsLocating(false);
          setIsLoading(false);
          scrollToMap();
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        setIsLoading(false);
        alert('Could not retrieve your location. Please type a location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle interactive pin drop on the map
  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoading(true);
    setHasSearched(true);
    setVisibleCount(8);

    const newCenter: [number, number] = [lat, lng];
    setMapCenter(newCenter);
    setRadiusCenter(newCenter);

    const placeName = await reverseGeocode(lat, lng);
    const displayName = placeName || 'Selected Location';
    setLocationName(displayName);
    setSearchQuery(displayName);

    try {
      const results = await fetchStudySpaces(lat, lng, filters.amenityTypes, searchRadius);
      setSpaces(results);
      applyFilters(results, filters);
    } catch (err) {
      console.error('Error fetching study spaces for dropped pin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Expand search radius when 0 spots found
  const handleExpandRadius = async (newRadius: number) => {
    setSearchRadius(newRadius);
    if (!radiusCenter) return;
    setIsLoading(true);
    try {
      const results = await fetchStudySpaces(
        radiusCenter[0],
        radiusCenter[1],
        filters.amenityTypes,
        newRadius
      );
      setSpaces(results);
      applyFilters(results, filters);
    } catch (err) {
      console.error('Error expanding radius:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-load default initial location on mount
  useEffect(() => {
    const targetQuery = initialQuery.trim() || 'Manila';
    doSearch(targetQuery, DEFAULT_FILTERS.amenityTypes, !!initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      doSearch(searchQuery.trim(), filters.amenityTypes, true);
    } else {
      scrollToMap();
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    const amenityTypesChanged =
      JSON.stringify(newFilters.amenityTypes) !== JSON.stringify(filters.amenityTypes);

    setFilters(newFilters);

    if (amenityTypesChanged && radiusCenter) {
      // Use the current map center — don't re-geocode
      fetchFromCenter(newFilters.amenityTypes);
    } else {
      applyFilters(spaces, newFilters);
    }
  };

  const handleCardClick = (space: StudySpace) => {
    setFocusedSpaceId(space.id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const visibleSpaces = filteredSpaces.slice(0, visibleCount);

  return (
    <main className="min-h-screen flex flex-col bg-[#FFFDF9] font-sans text-primary">
      <LogoSplash />
      {/* Hero Section (fits full screen with exact Figma gradient and white grid) */}
      <section
        id="hero-section"
        className="relative w-full min-h-[100dvh] flex flex-col items-center justify-between px-2 sm:px-6 pt-4 sm:pt-6 pb-8 border-none overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #4B4038 0%, #6E5541 21%, #9E7C63 42%, #BBA693 60%, #FFFDF9 100%)',
        }}
      >
        {/* White Grid Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.16) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.16) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 95%)',
          }}
        />

        {/* Soft Ambient Radial Glow */}
        <div className="absolute top-0 left-1/4 -translate-x-1/4 w-full max-w-2xl h-96 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.14),transparent_70%)] pointer-events-none z-0" />

        {/* Top: Enlarged Logo (shifted to left) */}
        <div className="w-full px-2 sm:px-4 md:px-6 flex items-center justify-start z-20">
          <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-md">
              <Image
                src="/assets/logo.png"
                alt="AralNook Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Centered Hero Content */}
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center my-auto z-10 py-4">

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.12] mb-4 tracking-tight drop-shadow-sm">
            Find your perfect <br />
            <span className="text-[#FFF2E1] underline decoration-[#FFF2E1]/60 underline-offset-8">study nook.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg text-white/95 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed font-medium drop-shadow-xs">
            Discover cafés, quiet libraries, and 24/7 student spaces within walking distance.
            Powered by live OpenStreetMap data.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleHeroSubmit} className="relative w-full max-w-xl mx-auto">
            <div className="flex items-center bg-white rounded-2xl shadow-xl shadow-black/10 overflow-hidden focus-within:shadow-2xl transition-all p-1.5 sm:p-2">
              <div className="pl-3 pr-2 text-tertiary">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 sm:w-5 h-4 sm:h-5 text-tertiary/70" />
              </div>
              <input
                type="text"
                placeholder="Enter any location (e.g. Makati, BGC, Diliman, UST)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 sm:py-3.5 px-2 text-xs sm:text-sm md:text-base text-primary placeholder:text-tertiary/70 focus:outline-none bg-transparent"
              />

              {/* Location detection button */}
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={isLocating}
                title="Use my current location"
                className="p-2 sm:p-2.5 mx-1 text-primary hover:bg-tertiary/20 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
              >
                {isLocating ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faLocationCrosshairs} className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
                )}
                <span className="hidden sm:inline">Near me</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 sm:px-7 py-2.5 sm:py-3.5 bg-primary hover:bg-secondary text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm shrink-0 flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Find Nooks</span>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Scroll down to notebook cue */}
        <div className="pt-4 flex flex-col items-center">
          <button
            type="button"
            onClick={scrollToNotebook}
            className="group inline-flex flex-col items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-all py-2 px-5 rounded-full hover:bg-black/5 cursor-pointer"
          >
            <FontAwesomeIcon icon={faChevronDown} className="w-3.5 h-3.5 text-secondary animate-bounce transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </section>

      {/* Notebook Showcase Section */}
      <section
        id="notebook-section"
        ref={notebookSectionRef}
        className="relative w-full md:min-h-[100dvh] flex flex-col items-center justify-center px-3 sm:px-6 lg:px-8 py-6 bg-[#FFFDF9] border-none overflow-hidden"
      >
        {/* Full Big Notebook Container */}
        <div
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setIsMobileNotebookOpen(true);
            }
          }}
          className="relative w-full flex-1 flex items-center justify-center my-auto cursor-pointer md:cursor-default"
          title="Field Journal (tap to reveal on mobile)"
        >
          <div className="relative w-full max-w-[min(92vw,1272px,calc((100dvh-100px)*1.6))] mx-auto flex items-center justify-center">
            <Notebook
              hideTextOnMobile={true}
              className="w-full"
            />

            {/* Mobile "Tap to Reveal" Overlay */}
            <div className="absolute inset-0 z-30 md:hidden flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsMobileNotebookOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#3B2818]/90 hover:bg-[#3B2818] backdrop-blur-md text-[#FFF4E5] font-semibold text-xs shadow-2xl flex items-center justify-center border border-white/25 active:scale-95 transition-all cursor-pointer animate-pulse pointer-events-auto"
                aria-label="Open mobile journal"
              >
                <span className="tracking-wide uppercase text-[11px] font-bold">Tap to Reveal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick jump to map section */}
        <div className="pt-2 sm:pt-4 flex justify-center">
          <button
            onClick={scrollToMap}
            className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-primary transition-all py-2 px-5 rounded-full bg-white/90 shadow-md hover:shadow-lg hover:bg-white cursor-pointer"
          >
            <span>Explore live map directly below</span>
            <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 text-secondary animate-bounce" />
          </button>
        </div>
      </section>

      {/* Mobile Swipeable Single-Page Journal Modal */}
      <MobileNotebookModal
        isOpen={isMobileNotebookOpen}
        onClose={() => setIsMobileNotebookOpen(false)}
      />

      {/* Continuous Gradient Area: Map Section through Footer (#FFFDF9 > #BBA693 > #9E7C63 > #6E5541) */}
      <div className="w-full bg-gradient-to-b from-[#FFFDF9] via-[#BBA693] via-45% via-[#9E7C63] via-75% to-[#6E5541] flex flex-col">
        {/* Map & Results Section */}
        <section
          id="map-section"
          ref={mapSectionRef}
          className="w-full bg-transparent flex flex-col scroll-mt-4 py-8 px-4 sm:px-6 max-w-7xl mx-auto flex-1 border-none"
        >
          {/* Section Header Bar */}
          <div className="p-4 sm:px-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-secondary" />
                <span>Study Spots {locationName ? `near ${locationName}` : ''}</span>
              </h3>
              <p className="text-xs text-secondary/80">
                Showing {visibleSpaces.length} of {filteredSpaces.length} verified study nooks nearby
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Change location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && doSearch(searchQuery, filters.amenityTypes, false)}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-tertiary/30 rounded-xl text-xs text-primary placeholder:text-tertiary focus:outline-none focus:border-primary transition-colors"
                />
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-2.5 h-3.5 w-3.5 text-tertiary" />
              </div>

              <button
                onClick={handleUseLocation}
                disabled={isLocating}
                className="p-2 bg-white border border-tertiary/30 rounded-xl text-primary hover:bg-tertiary/20 transition-colors text-xs flex items-center gap-1 font-semibold shrink-0 cursor-pointer"
                title="Use current location"
              >
                <FontAwesomeIcon icon={faLocationCrosshairs} className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => doSearch(searchQuery, filters.amenityTypes, false)}
                disabled={isLoading}
                className="px-3.5 py-2 bg-primary hover:bg-secondary text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Map + Sidebar Container */}
          <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] lg:h-[calc(100vh-180px)]">
            {/* Sidebar (Filters + Results List) */}
            <div className="w-full lg:w-[440px] flex flex-col rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg shrink-0 h-[550px] lg:h-full">
              {/* Filter Bar */}
              <div className="p-4 bg-white/70 shadow-xs">
                <FilterBar filters={filters} onChange={handleFiltersChange} />
              </div>

              {/* Space Cards List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {isLoading && (
                  <div className="flex flex-col gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 rounded-xl shadow-xs animate-pulse bg-tertiary/10">
                        <div className="h-4 bg-tertiary/20 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-tertiary/10 rounded w-1/2 mb-2"></div>
                        <div className="flex gap-2">
                          <div className="h-6 w-16 bg-tertiary/10 rounded"></div>
                          <div className="h-6 w-12 bg-tertiary/10 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && hasSearched && filteredSpaces.length === 0 && (
                  <div className="text-center py-12 px-5 bg-white/80 rounded-2xl shadow-md">
                    <div className="text-3xl text-primary/70 mb-3">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                    <p className="text-sm sm:text-base font-bold text-primary mb-1.5 leading-snug">
                      No study spaces found within walking distance of {searchRadius >= 1000 ? `${(searchRadius / 1000).toFixed(1)}km` : `${searchRadius}m`}
                    </p>
                    <p className="text-xs text-secondary/80 max-w-xs mx-auto mb-4 leading-relaxed">
                      There are no study spaces tagged in OpenStreetMap in this immediate area. Try expanding your search radius or adjusting your filters.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {searchRadius < 1000 && (
                        <button
                          onClick={() => handleExpandRadius(1000)}
                          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          Expand radius to 1 km
                        </button>
                      )}
                      {searchRadius < 3000 && (
                        <button
                          onClick={() => handleExpandRadius(3000)}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${searchRadius < 1000
                            ? 'bg-white text-primary shadow-sm hover:shadow-md hover:bg-tertiary/10'
                            : 'bg-primary text-white hover:bg-secondary'
                            }`}
                        >
                          Expand radius to 3 km
                        </button>
                      )}
                      {searchRadius < 5000 && (
                        <button
                          onClick={() => handleExpandRadius(5000)}
                          className="px-4 py-2 bg-white text-primary shadow-sm hover:shadow-md text-xs font-semibold rounded-xl hover:bg-tertiary/10 transition-all cursor-pointer"
                        >
                          Expand radius to 5 km
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!isLoading && visibleSpaces.map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    isSelected={focusedSpaceId === space.id}
                    onClick={() => handleCardClick(space)}
                  />
                ))}

                {/* Show More Button */}
                {!isLoading && filteredSpaces.length > visibleCount && (
                  <div className="pt-2 pb-3 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="w-full py-3 px-4 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Show More ({filteredSpaces.length - visibleCount} more)</span>
                      <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-lg relative h-[500px] lg:h-full min-h-[450px]">
              <MapWrapper
                studySpaces={filteredSpaces}
                center={mapCenter}
                zoom={15}
                radiusCenter={radiusCenter}
                radius={searchRadius}
                focusedSpaceId={focusedSpaceId}
                locationName={locationName}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FFF2E1]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-tertiary border-t-primary"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
