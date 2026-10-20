/** First screen: aerial photo of a Roubaix street behind the title, three ways to start. */
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Drop } from 'phosphor-react-native';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { aerialImageUrl } from '@/data/services/ignService';
import { useProjectActions } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import LanguageToggle from '@/shared/components/LanguageToggle';
import { colors, fonts } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

// The background shows Rue des Fabricants in Roubaix, about 270 m from top to bottom.
const BACKDROP_CENTER = { latitude: 50.6904, longitude: 3.1705 };
const BACKDROP_HALF_HEIGHT_DEG = 0.0012;

export default function WelcomeScreen() {
  const router = useRouter();
  const { s } = useI18n();
  const { updateSite, loadExample } = useProjectActions();
  const { width, height } = useWindowDimensions();

  // Half-width of the photo in degrees so it matches the screen shape:
  // half-height × (screen width ÷ screen height) ÷ cos(latitude), because a degree of longitude is
  // shorter than a degree of latitude away from the equator.
  const halfWidth =
    (BACKDROP_HALF_HEIGHT_DEG * width) /
    height /
    Math.cos((BACKDROP_CENTER.latitude * Math.PI) / 180);
  const backdrop = aerialImageUrl(
    {
      south: BACKDROP_CENTER.latitude - BACKDROP_HALF_HEIGHT_DEG,
      north: BACKDROP_CENTER.latitude + BACKDROP_HALF_HEIGHT_DEG,
      west: BACKDROP_CENTER.longitude - halfWidth,
      east: BACKDROP_CENTER.longitude + halfWidth,
    },
    width * 2,
    height * 2,
  );

  const start = (kind: 'private' | 'shared') => {
    updateSite(kind === 'shared' ? { kind: 'shared', isCouree: true } : { kind: 'private' });
    router.push('/building');
  };

  const showExample = () => {
    loadExample();
    router.push('/setup/analysing');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={{ uri: backdrop }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <LinearGradient id="top" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.mapOverlay} stopOpacity={0.55} />
            <Stop offset="1" stopColor={colors.mapOverlay} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.background} stopOpacity={0} />
            <Stop offset="0.38" stopColor={colors.background} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.background} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={120} fill="url(#top)" />
        <Rect x={0} y={height * 0.3} width={width} height={height * 0.7} fill="url(#bottom)" />
      </Svg>

      <SafeAreaView style={styles.content} edges={['bottom']}>
        <View style={styles.brandRow}>
          <Drop size={26} weight="fill" color={colors.teal} />
          <AppText style={styles.brand}>MyRain365</AppText>
          <View style={styles.spacer} />
          <LanguageToggle />
        </View>
        <AppText variant="display">{s.welcome.title}</AppText>
        <AppText style={styles.subtitle}>{s.welcome.subtitle}</AppText>
        <Button
          label={s.welcome.findBuilding}
          icon={ArrowRight}
          iconPosition="end"
          onPress={() => start('private')}
        />
        <Button label={s.welcome.manageSite} variant="quiet" onPress={() => start('shared')} />
        <Pressable
          onPress={showExample}
          accessibilityRole="link"
          hitSlop={8}
          style={styles.example}
        >
          <AppText style={styles.exampleLabel}>{s.welcome.example}</AppText>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.buttons,
  },
  spacer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
  },
  example: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  exampleLabel: {
    fontFamily: fonts.semibold,
    color: colors.buttons,
  },
});
