
import * as Location from 'expo-location';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocatedAddress = Coordinates & {
  address: string;
};

export type CurrentLocationResult =
  | { status: 'granted'; location: LocatedAddress }
  | { status: 'permission-denied' };

function formatAddress(
  parts: (string | null | undefined)[],
): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}

function formatGeocodedAddress(
  place: Location.LocationGeocodedAddress,
): string {
  const street = [place.streetNumber, place.street]
    .filter(Boolean)
    .join(' ');

  return formatAddress([
    street,
    place.postalCode,
    place.city,
    place.region,
  ]);
}

/**
 * Requests foreground location permission and retrieves
 * the current coordinates and a readable address.
 */
export async function getCurrentLocation(): Promise<CurrentLocationResult> {
  const permission =
    await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    return { status: 'permission-denied' };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const coordinates: Coordinates = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };

  let address: string | null = null;

  try {
    address = await reverseGeocode(coordinates);
  } catch {
    // GPS coordinates remain usable even if address lookup fails.
  }

  return {
    status: 'granted',
    location: {
      ...coordinates,
      address: address || 'Selected location',
    },
  };
}

/**
 * Converts a user-entered address into coordinates.
 * Returns null when no matching address is found.
 */
export async function searchAddress(
  query: string,
): Promise<LocatedAddress | null> {
  const results = await Location.geocodeAsync(query);
  const result = results[0];

  if (!result) {
    return null;
  }

  const coordinates: Coordinates = {
    latitude: result.latitude,
    longitude: result.longitude,
  };

  let address: string | null = null;

  try {
    address = await reverseGeocode(coordinates);
  } catch {
    // Fall back to the address entered by the user.
  }

  return {
    ...coordinates,
    address: address || query,
  };
}

/**
 * Converts coordinates into a readable address.
 */
export async function reverseGeocode(
  coordinates: Coordinates,
): Promise<string | null> {
  const results = await Location.reverseGeocodeAsync(coordinates);
  const place = results[0];

  if (!place) {
    return null;
  }

  return formatGeocodedAddress(place) || null;
}
