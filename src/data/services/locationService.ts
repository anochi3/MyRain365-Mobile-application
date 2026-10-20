/** Phone GPS: asks for permission, then reads the current position and its accuracy in metres. */
import * as Location from 'expo-location';

import type { Coordinates } from '@/shared/geo';

export type DevicePosition = Coordinates & {
  accuracyM: number | null;
};

export type DevicePositionResult =
  | { status: 'granted'; position: DevicePosition }
  | { status: 'denied'; canAskAgain: boolean };

/** Returns the position, or "denied" with whether the app may ask again (if not, only Settings can allow it). */
export async function getDevicePosition(): Promise<DevicePositionResult> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    return { status: 'denied', canAskAgain: permission.canAskAgain };
  }

  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    status: 'granted',
    position: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracyM: coords.accuracy ?? null,
    },
  };
}
