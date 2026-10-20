
import React from 'react';
import {
  Alert,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { colors } from '../../../shared/global.styles';
import BuildingMap from '../components/BuildingMap';
import RoofDetailsPanel from '../components/RoofDetailsPanel';
import { useRoofSelection } from '../hooks/useRoofSelection';

export default function RoofSelectionScreen() {
  const router = useRouter();
  const roof = useRoofSelection();

  async function handleLocate() {
    const result = await roof.useMyLocation();

    if (result.ok) {
      return;
    }

    if (result.reason === 'permission-denied') {
      Alert.alert(
        'Location permission needed',
        'Allow MyRain365 to access your location in order to find nearby buildings. You can also search manually.',
        [
          { text: 'Continue manually', style: 'cancel' },
          {
            text: 'Open settings',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
      return;
    }

    Alert.alert(
      'Unable to get location',
      'Check that location services are enabled, or search for an address instead.',
    );
  }

  async function handleSearch() {
    Keyboard.dismiss();

    const result = await roof.searchForAddress();

    if (result.ok) {
      return;
    }

    const messages: Record<string, string> = {
      'empty-query': 'Enter an address to search for.',
      'not-found': 'No matching address was found. Try adding the city.',
      'permission-denied': 'You can search for an address manually.',
      'invalid-area': 'Enter a positive roof area in square metres.',
      error: 'The search failed. Check your connection and try again.',
    };

    Alert.alert('Address search', messages[result.reason]);
  }

  function handleContinue() {
    const result = roof.getRoofSelection();

    if (!result.ok) {
      Alert.alert(
        'Roof area required',
        'Enter a measured or verified roof area in square metres.',
      );
      return;
    }

    router.push({
      pathname: '/(tabs)/water',
      params: {
        address: result.selection.address,
        latitude: String(result.selection.latitude),
        longitude: String(result.selection.longitude),
        roofAreaM2: String(result.selection.roofAreaM2),
      },
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.mapArea}>
        <BuildingMap
          mapRef={roof.mapRef}
          region={roof.region}
          onRegionChangeComplete={roof.onRegionChangeComplete}
          searchText={roof.searchText}
          onSearchTextChange={roof.setSearchText}
          onSearch={handleSearch}
          isSearching={roof.isSearching}
          hasLocationPermission={roof.hasLocationPermission}
          isLoadingLocation={roof.isLoadingLocation}
          onLocate={handleLocate}
        />
      </View>

      <RoofDetailsPanel
        address={roof.address}
        roofArea={roof.roofArea}
        onRoofAreaChange={roof.setRoofArea}
        onContinue={handleContinue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapArea: {
    flex: 1,
  },
});
