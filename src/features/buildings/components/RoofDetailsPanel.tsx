import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, shadows } from '@/shared/global.styles';

import type { RoofSelectionStatus } from '../types';

const ROUGH_GPS_ACCURACY_M = 25;

type IconName = ComponentProps<typeof Ionicons>['name'];

type Tone = 'success' | 'warning' | 'neutral';

const TONES: Record<Tone, { background: string; foreground: string }> = {
  success: { background: colors.greenBackground, foreground: colors.green },
  warning: { background: colors.warningBackground, foreground: colors.warningTitle },
  neutral: { background: colors.inactiveTab, foreground: colors.secondaryText },
};

type Props = {
  status: RoofSelectionStatus;
  gpsAccuracyM: number | null;
  onUseRoof: () => void;
  onLocate: () => void;
  onOpenSettings: () => void;
};

export default function RoofDetailsPanel({
  status,
  gpsAccuracyM,
  onUseRoof,
  onLocate,
  onOpenSettings,
}: Props) {
  const isRoofStep =
    status.kind === 'loadingRoof' || status.kind === 'roofFound' || status.kind === 'noBuilding';
  const isDisabled =
    status.kind === 'locating' || status.kind === 'loadingRoof' || status.kind === 'noBuilding';

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <PanelContent status={status} gpsAccuracyM={gpsAccuracyM} onOpenSettings={onOpenSettings} />

      <Pressable
        onPress={status.kind === 'roofFound' ? onUseRoof : onLocate}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          isDisabled && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text style={styles.buttonText}>{isRoofStep ? 'Use this roof' : 'Use my location'}</Text>
      </Pressable>
    </View>
  );
}

type PanelContentProps = Pick<Props, 'status' | 'gpsAccuracyM' | 'onOpenSettings'>;

function PanelContent({ status, gpsAccuracyM, onOpenSettings }: PanelContentProps) {
  switch (status.kind) {
    case 'roofFound':
      return (
        <>
          <PanelHeading
            icon="home"
            tone="success"
            title="Roof found under the pin"
            subtitle="Outline from IGN BD TOPO, measured from above"
          />
          <View style={styles.areaRow}>
            <Text style={styles.area}>{Math.round(status.roof.building.roofAreaM2)} m²</Text>
            <Text style={styles.hint}>
              {gpsAccuracyM !== null && gpsAccuracyM > ROUGH_GPS_ACCURACY_M
                ? `GPS is accurate to about ${Math.round(gpsAccuracyM)} m. Drag the map if this is not your roof.`
                : 'Not your home? Tap another roof'}
            </Text>
          </View>
        </>
      );
    case 'loadingRoof':
      return (
        <PanelHeading
          tone="neutral"
          title="Reading the roof"
          subtitle="Looking up the building outline under the pin"
        />
      );
    case 'locating':
      return (
        <PanelHeading
          tone="neutral"
          title="Finding your location"
          subtitle="Allow location access to jump to your house"
        />
      );
    case 'noBuilding':
      return (
        <PanelHeading
          icon="alert-circle-outline"
          tone="warning"
          title="No building under the pin"
          subtitle="Drag the map so the pin sits on your roof"
        />
      );
    case 'unavailable':
      return (
        <PanelHeading
          icon="cloud-offline-outline"
          tone="warning"
          title="Could not reach the map service"
          subtitle="Check your connection, then move the map to try again"
        />
      );
    case 'locationDenied':
      return (
        <>
          <PanelHeading
            icon="location-outline"
            tone="warning"
            title="Location is off"
            subtitle="Search your address above, or drag the map onto your roof"
          />
          {!status.canAskAgain && (
            <Pressable onPress={onOpenSettings} hitSlop={8} accessibilityRole="link">
              <Text style={styles.link}>Open settings to allow location</Text>
            </Pressable>
          )}
        </>
      );
    case 'idle':
      return (
        <PanelHeading
          icon="home-outline"
          tone="success"
          title="Where is your home?"
          subtitle="Use your location or search your address, then fine-tune the pin on your roof"
        />
      );
  }
}

type PanelHeadingProps = {
  icon?: IconName;
  tone: Tone;
  title: string;
  subtitle: string;
};

function PanelHeading({ icon, tone, title, subtitle }: PanelHeadingProps) {
  const { background, foreground } = TONES[tone];

  return (
    <View style={styles.heading}>
      <View style={[styles.iconContainer, { backgroundColor: background }]}>
        {icon ? (
          <Ionicons name={icon} size={24} color={foreground} />
        ) : (
          <ActivityIndicator color={foreground} />
        )}
      </View>
      <View style={styles.headingText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.background,
    ...shadows.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
    backgroundColor: colors.cardBorder,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    flex: 1,
  },
  title: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 18,
  },
  area: {
    color: colors.primaryText,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  hint: {
    flex: 1,
    textAlign: 'right',
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    marginTop: 12,
    color: colors.buttons,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    height: 56,
    marginTop: 20,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttons,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 17,
    fontWeight: '700',
  },
});
