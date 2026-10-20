
import { useEffect, useRef, useState } from 'react';
import MapView, { Region } from 'react-native-maps';

import {
  Coordinates,
  getCurrentLocation,
  reverseGeocode,
  searchAddress as searchAddressService,
} from '../../../data/services/locationService';

export const INITIAL_MAP_REGION: Region = {
  latitude: 50.6942,
  longitude: 3.1746,
  latitudeDelta: 0.004,
  longitudeDelta: 0.004,
};

export type RoofSelection = {
  address: string;
  latitude: number;
  longitude: number;
  roofAreaM2: number;
};

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'permission-denied'
        | 'not-found'
        | 'empty-query'
        | 'invalid-area'
        | 'error';
    };

export function useRoofSelection() {
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>(INITIAL_MAP_REGION);
  const [address, setAddress] = useState('Roubaix, France');
  const [searchText, setSearchText] = useState('');
  const [roofArea, setRoofArea] = useState('');

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] =
    useState(false);

  // Update the displayed address after the map stops moving.
  useEffect(() => {
    let isActive = true;

    const timeout = setTimeout(async () => {
      try {
        const result = await reverseGeocode({
          latitude: region.latitude,
          longitude: region.longitude,
        });

        if (isActive && result) {
          setAddress(result);
        }
      } catch {
        // Manual address and map selection remain available.
      }
    }, 800);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [region.latitude, region.longitude]);

  function moveMap(coordinates: Coordinates) {
    const nextRegion: Region = {
      ...coordinates,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };

    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 450);
  }

  async function useMyLocation(): Promise<ActionResult> {
    try {
      setIsLoadingLocation(true);

      const result = await getCurrentLocation();

      if (result.status === 'permission-denied') {
        setHasLocationPermission(false);

        return {
          ok: false,
          reason: 'permission-denied',
        };
      }

      setHasLocationPermission(true);
      setAddress(result.location.address);
      moveMap(result.location);

      return { ok: true };
    } catch {
      return { ok: false, reason: 'error' };
    } finally {
      setIsLoadingLocation(false);
    }
  }

  async function searchForAddress(): Promise<ActionResult> {
    const query = searchText.trim();

    if (!query) {
      return { ok: false, reason: 'empty-query' };
    }

    try {
      setIsSearching(true);

      const result = await searchAddressService(query);

      if (!result) {
        return { ok: false, reason: 'not-found' };
      }

      setAddress(result.address);
      moveMap(result);

      return { ok: true };
    } catch {
      return { ok: false, reason: 'error' };
    } finally {
      setIsSearching(false);
    }
  }

  function getRoofSelection():
    | { ok: true; selection: RoofSelection }
    | { ok: false; reason: 'invalid-area' } {
    const parsedArea = Number(roofArea.trim().replace(',', '.'));

    if (!Number.isFinite(parsedArea) || parsedArea <= 0) {
      return { ok: false, reason: 'invalid-area' };
    }

    return {
      ok: true,
      selection: {
        address,
        latitude: region.latitude,
        longitude: region.longitude,
        roofAreaM2: parsedArea,
      },
    };
  }

  return {
    mapRef,
    region,
    address,
    searchText,
    roofArea,
    isLoadingLocation,
    isSearching,
    hasLocationPermission,

    setSearchText,
    setRoofArea,
    onRegionChangeComplete: setRegion,

    useMyLocation,
    searchForAddress,
    getRoofSelection,
  };
}
