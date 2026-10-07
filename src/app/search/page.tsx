'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import SpaceCard from '@/components/SpaceCard';
import MapWrapper from '@/components/MapWrapper';
import { StudySpace, SearchFilters, DEFAULT_FILTERS } from '@/lib/types';
import { geocode } from '@/lib/geocoding';
import { fetchStudySpaces } from '@/lib/overpass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faLocationDot } from '@fortawesome/free-solid-svg-icons';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [spaces, setSpaces] = useState<StudySpace[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<StudySpace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]);
  const [radiusCenter, setRadiusCenter] = useState<[number, number] | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [focusedSpaceId, setFocusedSpaceId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(800);

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
    },
    [searchRadius]
  );

  // Search function
  const doSearch = useCallback(
    async (query: string, amenityTypes = filters.amenityTypes, radius = searchRadius) => {
      if (!query.trim()) return;
      setIsLoading(true);
      setHasSearched(true);

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
      }
    },
    [filters, applyFilters, searchRadius]
  );

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

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    const amenityTypesChanged =
      JSON.stringify(newFilters.amenityTypes) !== JSON.stringify(filters.amenityTypes);

    setFilters(newFilters);

    if (amenityTypesChanged && searchQuery.trim()) {
      doSearch(searchQuery, newFilters.amenityTypes);
    } else {
      applyFilters(spaces, newFilters);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      doSearch(searchQuery);
    }
  };

  const handleCardClick = (space: StudySpace) => {
    setFocusedSpaceId(space.id);
  };

  return (
    <main className="flex min-h-screen flex-col bg-white font-sans">
      <Header showBack />

      <div className="flex flex-1 flex-col lg:flex-row h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <div className="w-full lg:w-[420px] flex flex-col shadow-lg z-10 bg-white overflow-hidden">
          {/* Search + Filters — fixed area */}
          <div className="p-5 shadow-xs bg-white">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search area (e.g. Makati)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 bg-tertiary/10 border border-tertiary/30 rounded-xl text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-primary transition-colors"
              />
              {isLoading ? (
                <div className="absolute left-3.5 top-3.5 animate-spin h-4 w-4 border-2 border-secondary border-t-transparent rounded-full" />
              ) : (
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-3.5 h-4 w-4 text-tertiary" />
              )}
            </div>

            <FilterBar filters={filters} onChange={handleFiltersChange} />
          </div>

          {/* Results list — scrollable */}
          <div className="flex-1 overflow-y-auto p-5">
            {hasSearched && !isLoading && (
              <div className="mb-4">
                <p className="text-sm font-medium text-primary">
                  {filteredSpaces.length} nook{filteredSpaces.length !== 1 ? 's' : ''} found
                  {locationName && (
                    <span className="text-secondary/70"> near {locationName}</span>
                  )}
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-xl shadow-xs bg-tertiary/10 animate-pulse">
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
              <div className="text-center py-12 px-5 bg-tertiary/10 rounded-2xl shadow-sm">
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
                      className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Expand radius to 1 km
                    </button>
                  )}
                  {searchRadius < 3000 && (
                    <button
                      onClick={() => handleExpandRadius(3000)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                        searchRadius < 1000
                          ? 'bg-white text-primary shadow-sm hover:bg-tertiary/20'
                          : 'bg-primary text-white hover:bg-secondary'
                      }`}
                    >
                      Expand radius to 3 km
                    </button>
                  )}
                  {searchRadius < 5000 && (
                    <button
                      onClick={() => handleExpandRadius(5000)}
                      className="px-4 py-2 bg-white text-primary shadow-sm text-xs font-semibold rounded-xl hover:bg-tertiary/20 transition-all"
                    >
                      Expand radius to 5 km
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !hasSearched && (
              <div className="text-center py-16">
                <div className="text-3xl text-tertiary mb-3">
                  <FontAwesomeIcon icon={faLocationDot} />
                </div>
                <p className="text-sm font-medium text-primary mb-1">Search for a location</p>
                <p className="text-xs text-secondary/60">
                  Enter an area name and press Enter to find nearby study spots.
                </p>
              </div>
            )}

            {!isLoading && (
              <div className="flex flex-col gap-3">
                {filteredSpaces.map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    isSelected={focusedSpaceId === space.id}
                    onClick={() => handleCardClick(space)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 bg-tertiary/5">
          <MapWrapper
            studySpaces={filteredSpaces}
            center={mapCenter}
            zoom={15}
            radiusCenter={radiusCenter}
            radius={searchRadius}
            locationName={locationName}
            focusedSpaceId={focusedSpaceId}
          />
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-tertiary border-t-primary"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
