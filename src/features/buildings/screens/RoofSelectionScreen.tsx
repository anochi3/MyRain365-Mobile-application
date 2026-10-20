/** Locate tab: find the home on the aerial map and confirm its roof, then continue to the setup. */
import { useRouter } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { materialFromIgnCode } from '@/data/services/ignService';
import { useProjectActions } from '@/data/store/ProjectProvider';
import { colors } from '@/shared/global.styles';

import AddressSearchBar from '../components/AddressSearchBar';
import BuildingMap from '../components/BuildingMap';
import MapPin from '../components/MapPin';
import RoofDetailsPanel from '../components/RoofDetailsPanel';
import { INITIAL_MAP_CENTER, INITIAL_MAP_ZOOM, useRoofSelection } from '../hooks/useRoofSelection';

export default function RoofSelectionScreen() {
  const router = useRouter();
  const {
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
  } = useRoofSelection();
  const { setBuilding } = useProjectActions();

  const confirmRoof = () => {
    if (status.kind !== 'roofFound') {
      return;
    }

    const { building, center, address } = status.roof;
    const ignMaterial = materialFromIgnCode(building.roofMaterialCode);
    setBuilding(
      {
        id: building.id,
        address: address ?? '',
        latitude: center.latitude,
        longitude: center.longitude,
        outline: building.outline,
        footprintM2: building.roofAreaM2,
        isFlatRoof: building.isFlatRoof,
      },
      {
        areaM2: building.roofAreaM2,
        drainedShare: 1,
        material: ignMaterial ?? (building.isFlatRoof ? 'flat' : 'tiles'),
        materialSource: ignMaterial ? 'ign' : 'user',
        materialConfidence: null,
      },
    );
    router.push('/setup/roof');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.mapArea}>
        <BuildingMap
          ref={mapRef}
          initialCenter={INITIAL_MAP_CENTER}
          initialZoom={INITIAL_MAP_ZOOM}
          outlineColor={colors.green}
          onMoveStart={handleMapMoveStart}
          onMoveEnd={handleMapMoveEnd}
        />

        <MapPin isLifted={isMapMoving} />

        <AddressSearchBar
          value={isSearching ? searchText : (address ?? '')}
          isSearching={isSearching}
          suggestions={suggestions}
          isLocating={status.kind === 'locating'}
          onChangeText={setSearchText}
          onFocus={startSearch}
          onBlur={endSearch}
          onSubmit={submitSearch}
          onSelectSuggestion={selectSuggestion}
          onLocatePress={locateDevice}
        />

        <RoofDetailsPanel
          status={status}
          gpsAccuracyM={gpsAccuracyM}
          onUseRoof={confirmRoof}
          onLocate={locateDevice}
          onOpenSettings={() => void Linking.openSettings()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mapBackground,
  },
  mapArea: {
    flex: 1,
  },
});
