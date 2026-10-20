/** State of the Locate tab: GPS, search, map movement, and the building currently under the pin. */
import { useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import { getDevicePosition } from '@/data/services/locationService';
import { findBuildingAt, reverseGeocode, type AddressSuggestion } from '@/data/services/ignService';
import type { Coordinates } from '@/shared/geo';

import type { BuildingMapHandle } from '../components/buildingMap.types';
import type { RoofSelectionStatus } from '../types';
import { useAddressSuggestions } from './useAddressSuggestions';

export const INITIAL_MAP_CENTER: Coordinates = { latitude: 50.6901, longitude: 3.1817 };
export const INITIAL_MAP_ZOOM = 16;

/** True when a request was cancelled on purpose because a newer one replaced it. */
const isAbort = (error: unknown) => error instanceof Error && error.name === 'AbortError';

export function useRoofSelection() {
  const mapRef = useRef<BuildingMapHandle>(null);
  const roofRequest = useRef<AbortController | null>(null);

  const [status, setStatus] = useState<RoofSelectionStatus>({ kind: 'idle' });
  const [address, setAddress] = useState<string | null>(null);
  const [gpsAccuracyM, setGpsAccuracyM] = useState<number | null>(null);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const suggestions = useAddressSuggestions(searchText, isSearching);

  const cancelRoofRequest = () => {
    roofRequest.current?.abort();
    roofRequest.current = null;
  };

  // Ask IGN for the building and the address under the pin at the same time. A newer pin position
  // cancels the previous request, so a slow answer can never overwrite a newer one.
  const loadRoof = async (center: Coordinates) => {
    cancelRoofRequest();
    const controller = new AbortController();
    roofRequest.current = controller;
    setStatus({ kind: 'loadingRoof' });

    try {
      const [building, label] = await Promise.all([
        findBuildingAt(center, controller.signal),
        reverseGeocode(center, controller.signal).catch(() => null),
      ]);
      setAddress(label);
      mapRef.current?.showOutline(building?.outline ?? null);
      setStatus(
        building
          ? { kind: 'roofFound', roof: { building, center, address: label } }
          : { kind: 'noBuilding' },
      );
    } catch (error) {
      if (!isAbort(error)) {
        setStatus({ kind: 'unavailable' });
      }
    }
  };

  const handleMapMoveStart = () => setIsMapMoving(true);

  // Only read the roof when the user moved the map (drag, tap, GPS, search), not on a screen resize.
  const handleMapMoveEnd = (center: Coordinates, isUserInitiated: boolean) => {
    setIsMapMoving(false);
    if (isUserInitiated) {
      void loadRoof(center);
    }
  };

  // GPS button: ask for permission, then fly to the position. The roof is read when the flight ends.
  const locateDevice = async () => {
    Keyboard.dismiss();
    setIsSearching(false);
    cancelRoofRequest();
    mapRef.current?.showOutline(null);
    setStatus({ kind: 'locating' });

    try {
      const result = await getDevicePosition();
      if (result.status === 'denied') {
        setStatus({ kind: 'locationDenied', canAskAgain: result.canAskAgain });
        return;
      }
      setGpsAccuracyM(result.position.accuracyM);
      mapRef.current?.flyTo(result.position);
    } catch {
      setStatus({ kind: 'locationDenied', canAskAgain: true });
    }
  };

  const startSearch = () => {
    setSearchText(address ?? '');
    setIsSearching(true);
  };

  const endSearch = () => setIsSearching(false);

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    Keyboard.dismiss();
    setIsSearching(false);
    setGpsAccuracyM(null);
    mapRef.current?.flyTo(suggestion);
  };

  const submitSearch = () => {
    if (suggestions[0]) {
      selectSuggestion(suggestions[0]);
    }
  };

  return {
    mapRef,
    status,
    address,
    gpsAccuracyM,
    isMapMoving,
    searchText,
    isSearching,
    suggestions,
    setSearchText,
    startSearch,
    endSearch,
    submitSearch,
    selectSuggestion,
    locateDevice,
    handleMapMoveStart,
    handleMapMoveEnd,
  };
}
