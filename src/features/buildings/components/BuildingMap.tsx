
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';

import { colors } from '../../../shared/global.styles';
import AddressSearchBar from './AddressSearchBar';

type Props = {
  mapRef: React.RefObject<MapView | null>;
  region: Region;
  onRegionChangeComplete: (region: Region) => void;
  searchText: string;
  onSearchTextChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  hasLocationPermission: boolean;
  isLoadingLocation: boolean;
  onLocate: () => void;
};

export default function BuildingMap({
  mapRef,
  region,
  onRegionChangeComplete,
  searchText,
  onSearchTextChange,
  onSearch,
  isSearching,
  hasLocationPermission,
  isLoadingLocation,
  onLocate,
}: Props) {
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={false}
      />

      <AddressSearchBar
        value={searchText}
        onChangeText={onSearchTextChange}
        onSearch={onSearch}
        isSearching={isSearching}
      />

      <View pointerEvents="none" style={styles.centerPin}>
        <Ionicons
          name="location"
          size={46}
          color={colors.warningTitle}
        />
      </View>

      <TouchableOpacity
        style={styles.locateButton}
        onPress={onLocate}
        disabled={isLoadingLocation}
        accessibilityLabel="Use my current location"
      >
        {isLoadingLocation ? (
          <ActivityIndicator color={colors.buttons} />
        ) : (
          <Ionicons
            name="locate-outline"
            size={24}
            color={colors.buttons}
          />
        )}
      </TouchableOpacity>

      {!hasLocationPermission && (
        <View style={styles.permissionHint}>
          <Text style={styles.permissionText}>
            Location access is optional. Tap the location button
            to request access, or search for an address.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  centerPin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -23,
    marginTop: -43,
    alignItems: 'center',
  },
  locateButton: {
    position: 'absolute',
    right: 20,
    bottom: 22,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  permissionHint: {
    position: 'absolute',
    top: 82,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
  },
  permissionText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.secondaryText,
  },
});
