import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';

import { colors } from '../../../shared/global.styles';
import LocateMap, { type LocateMapHandle } from '../components/LocateMap';
import { addressAt, buildingAt, suggest, type Building, type LatLon, type Suggestion } from '../ign';

const ROUBAIX = { lat: 50.6901, lon: 3.1817, zoom: 16 };
const PIN = '#D8432B';

type Roof =
  | { kind: 'idle' }
  | { kind: 'locating' }
  | { kind: 'denied'; canAskAgain: boolean }
  | { kind: 'reading' }
  | { kind: 'found'; building: Building; center: LatLon }
  | { kind: 'none' }
  | { kind: 'offline' };

export default function LocateScreen() {
  const insets = useSafeAreaInsets();
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  const map = useRef<LocateMapHandle>(null);
  const [roof, setRoof] = useState<Roof>({ kind: 'idle' });
  const [query, setQuery] = useState('');
  const [address, setAddress] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const lookup = useRef<AbortController | null>(null);
  const lift = useRef(new Animated.Value(0)).current;

  // ---------------------------------------------------------------- pin lifts while the map moves
  const raisePin = () => {
    Animated.spring(lift, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };
  const dropPin = () => Animated.spring(lift, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 12 }).start();

  // ---------------------------------------------------------------- roof under the pin
  const readRoof = async (center: LatLon) => {
    lookup.current?.abort();
    const ctl = new AbortController();
    lookup.current = ctl;
    setRoof({ kind: 'reading' });
    try {
      const [building, label] = await Promise.all([
        buildingAt(center, ctl.signal),
        addressAt(center, ctl.signal).catch(() => null),
      ]);
      if (ctl.signal.aborted) return;
      setAddress(label);
      map.current?.setOutline(building ? building.outline : null);
      setRoof(building ? { kind: 'found', building, center } : { kind: 'none' });
    } catch (e: any) {
      if (e?.name !== 'AbortError') setRoof({ kind: 'offline' });
    }
  };

  // only read when the person moved the map (drag, tap, GPS, search), not on a resize
  const onMoveEnd = (center: LatLon, intended: boolean) => {
    dropPin();
    if (intended) readRoof(center);
  };

  // ---------------------------------------------------------------- GPS
  const locate = async () => {
    Keyboard.dismiss();
    setTyping(false);
    lookup.current?.abort();
    map.current?.setOutline(null);
    setRoof({ kind: 'locating' });
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      setRoof({ kind: 'denied', canAskAgain: perm.canAskAgain });
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setGpsAccuracy(pos.coords.accuracy ?? null);
      map.current?.flyTo({ lat: pos.coords.latitude, lon: pos.coords.longitude }, 19);
    } catch {
      setRoof({ kind: 'denied', canAskAgain: true });
    }
  };

  useEffect(() => {
    if (auto === '1') locate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------- address search
  useEffect(() => {
    if (!typing) return;
    const ctl = new AbortController();
    const t = setTimeout(() => suggest(query, ctl.signal).then(setSuggestions).catch(() => {}), 220);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [query, typing]);

  const pick = (s: Suggestion) => {
    Keyboard.dismiss();
    setTyping(false);
    setSuggestions([]);
    setGpsAccuracy(null);
    map.current?.flyTo(s, 19);
  };

  const useRoof = () => {
    if (roof.kind !== 'found') return;
    const b = roof.building;
    router.push({
      pathname: '/(tabs)',
      params: {
        buildingId: b.id,
        roofArea: String(Math.round(b.areaM2)),
        lat: roof.center.lat.toFixed(6),
        lon: roof.center.lon.toFixed(6),
        address: address ?? '',
      },
    });
  };

  const pinY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const shadowScale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });

  return (
    <View style={styles.screen}>
      <LocateMap
        ref={map}
        start={ROUBAIX}
        outlineColor={colors.green}
        onMoveStart={raisePin}
        onMoveEnd={onMoveEnd}
      />

      {/* fixed pin: the map moves under it, its tip marks the point we read */}
      <View pointerEvents="none" style={styles.pinWrap}>
        <Animated.View style={[styles.pinShadow, { transform: [{ scaleX: shadowScale }] }]} />
        <Animated.View style={[styles.pin, { transform: [{ translateY: pinY }] }]}>
          <MaterialCommunityIcons name="map-marker" size={48} color={PIN} style={styles.pinIcon} />
        </Animated.View>
      </View>

      {/* search */}
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.secondaryText} />
          <TextInput
            style={styles.input}
            value={typing ? query : address ?? query}
            placeholder="Search your address"
            placeholderTextColor={colors.secondaryText}
            onFocus={() => {
              setTyping(true);
              setQuery(address ?? '');
            }}
            onBlur={() => setTimeout(() => setTyping(false), 150)}
            onChangeText={setQuery}
            onSubmitEditing={() => suggestions[0] && pick(suggestions[0])}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search your address"
          />
          <Pressable
            onPress={locate}
            style={({ pressed }) => [styles.gpsBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Use my location"
            hitSlop={6}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.buttons} />
          </Pressable>
        </View>
        {typing && suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((s, i) => (
              <Pressable
                key={`${s.label}-${i}`}
                onPress={() => pick(s)}
                style={({ pressed }) => [styles.suggestion, i > 0 && styles.suggestionLine, pressed && { backgroundColor: colors.inactiveTab }]}
              >
                <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.secondaryText} />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* sheet */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <SheetBody roof={roof} gpsAccuracy={gpsAccuracy} onLocate={locate} />
        <Pressable
          onPress={roof.kind === 'found' ? useRoof : locate}
          disabled={roof.kind === 'reading' || roof.kind === 'locating' || roof.kind === 'none'}
          style={({ pressed }) => [
            styles.cta,
            (roof.kind === 'reading' || roof.kind === 'locating' || roof.kind === 'none') && styles.ctaDisabled,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>{roof.kind === 'found' || roof.kind === 'reading' || roof.kind === 'none' ? 'Use this roof' : 'Use my location'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SheetBody({ roof, gpsAccuracy, onLocate }: { roof: Roof; gpsAccuracy: number | null; onLocate: () => void }) {
  switch (roof.kind) {
    case 'found': {
      const rough = gpsAccuracy != null && gpsAccuracy > 25;
      return (
        <>
          <Header icon="home-variant" tint="green" title="Roof found under the pin" sub="Outline from IGN BD TOPO, measured from above" />
          <View style={styles.areaRow}>
            <Text style={styles.area}>{Math.round(roof.building.areaM2)} m²</Text>
            <Text style={styles.hint}>
              {rough ? `GPS is accurate to about ${Math.round(gpsAccuracy!)} m. Drag the map if this is not your roof.` : 'Not your home? Tap another roof'}
            </Text>
          </View>
        </>
      );
    }
    case 'reading':
      return <Header icon="home-search-outline" tint="neutral" title="Reading the roof…" sub="Looking up the building outline under the pin" busy />;
    case 'locating':
      return <Header icon="crosshairs-gps" tint="neutral" title="Finding your location…" sub="Allow location access to jump to your house" busy />;
    case 'none':
      return <Header icon="home-off-outline" tint="warn" title="No building under the pin" sub="Drag the map so the pin sits on your roof" />;
    case 'offline':
      return <Header icon="wifi-off" tint="warn" title="Could not reach the map service" sub="Check your connection, then move the map to try again" />;
    case 'denied':
      return (
        <>
          <Header icon="map-marker-off-outline" tint="warn" title="Location is off" sub="Search your address above, or drag the map onto your roof" />
          {!roof.canAskAgain && (
            <Pressable onPress={() => Linking.openSettings()} accessibilityRole="link" hitSlop={8}>
              <Text style={styles.link}>Open settings to allow location</Text>
            </Pressable>
          )}
        </>
      );
    default:
      return <Header icon="home-variant-outline" tint="green" title="Where is your home?" sub="Use your location or search your address, then fine-tune the pin on your roof" />;
  }
}

function Header({ icon, tint, title, sub, busy }: { icon: any; tint: 'green' | 'warn' | 'neutral'; title: string; sub: string; busy?: boolean }) {
  const bg = tint === 'green' ? '#E3F0EE' : tint === 'warn' ? colors.warningBackground : colors.inactiveTab;
  const fg = tint === 'green' ? colors.green : tint === 'warn' ? colors.warningTitle : colors.secondaryText;
  return (
    <View style={styles.header}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        {busy ? <ActivityIndicator color={fg} /> : <MaterialCommunityIcons name={icon} size={24} color={fg} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
    </View>
  );
}

const shadow = {
  shadowColor: '#1B222D',
  shadowOpacity: 0.16,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2b2f2a' },
  pinWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  // the glyph's tip is about 4 px above the bottom of its 48 px box: place the box so the tip is the exact centre
  pin: { position: 'absolute', left: '50%', top: '50%', width: 48, height: 48, marginLeft: -24, marginTop: -44 },
  pinIcon: { textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } },
  pinShadow: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 14,
    height: 5,
    marginLeft: -7,
    marginTop: -2.5,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  top: { position: 'absolute', left: 16, right: 16, top: 0 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingLeft: 18,
    paddingRight: 8,
    borderRadius: 28,
    backgroundColor: colors.cardBackground,
    ...shadow,
  },
  input: { flex: 1, fontSize: 16, color: colors.primaryText, paddingVertical: 0 },
  gpsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E4ECF3',
  },
  suggestions: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: colors.cardBackground,
    overflow: 'hidden',
    ...shadow,
  },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, minHeight: 48 },
  suggestionLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.cardBorder },
  suggestionText: { flex: 1, fontSize: 15, color: colors.primaryText },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.background,
    ...shadow,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.cardBorder, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.primaryText },
  sub: { fontSize: 13, color: colors.secondaryText, marginTop: 2, lineHeight: 18 },
  areaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 18 },
  area: { fontSize: 34, fontWeight: '800', color: colors.primaryText, letterSpacing: -0.5 },
  hint: { flex: 1, textAlign: 'right', fontSize: 13, lineHeight: 18, color: colors.secondaryText },
  link: { marginTop: 12, fontSize: 14, fontWeight: '600', color: colors.buttons },
  cta: {
    marginTop: 20,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttons,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
