import { CloudSlash, HouseLine, MapPinLine, WarningCircle, type Icon } from 'phosphor-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/shared/components/AppText';
import InfoButton, { type InfoTopic } from '@/shared/components/InfoButton';
import Button from '@/shared/components/Button';
import IconBadge, { badgeColor, type BadgeTone } from '@/shared/components/IconBadge';
import { colors, fonts, radii, shadows } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

import type { RoofSelectionStatus } from '../types';

const ROUGH_GPS_ACCURACY_M = 25;

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
  const { s, fill } = useI18n();
  const isRoofStep =
    status.kind === 'loadingRoof' || status.kind === 'roofFound' || status.kind === 'noBuilding';
  const isDisabled =
    status.kind === 'locating' || status.kind === 'loadingRoof' || status.kind === 'noBuilding';

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <PanelContent status={status} gpsAccuracyM={gpsAccuracyM} onOpenSettings={onOpenSettings} />
      <Button
        label={isRoofStep ? s.locate.useRoof : s.locate.useLocation}
        onPress={status.kind === 'roofFound' ? onUseRoof : onLocate}
        isDisabled={isDisabled}
      />
      {status.kind === 'roofFound' &&
      gpsAccuracyM !== null &&
      gpsAccuracyM > ROUGH_GPS_ACCURACY_M ? (
        <AppText variant="caption" align="center">
          {fill(s.locate.roughGps, { value: Math.round(gpsAccuracyM) })}
        </AppText>
      ) : null}
    </View>
  );
}

function PanelContent({
  status,
  onOpenSettings,
}: Pick<Props, 'status' | 'gpsAccuracyM' | 'onOpenSettings'>) {
  const { s, number } = useI18n();

  switch (status.kind) {
    case 'roofFound':
      return (
        <>
          <PanelHeading
            icon={HouseLine}
            tone="teal"
            title={s.locate.foundTitle}
            subtitle={s.locate.foundSubtitle}
            info="outline"
          />
          <View style={styles.areaRow}>
            <AppText variant="number">{number(status.roof.building.roofAreaM2)} m²</AppText>
            <AppText variant="label" style={styles.hint}>
              {s.locate.tapAnother}
            </AppText>
          </View>
        </>
      );
    case 'loadingRoof':
      return (
        <PanelHeading
          tone="sand"
          title={s.locate.loadingTitle}
          subtitle={s.locate.loadingSubtitle}
        />
      );
    case 'locating':
      return (
        <PanelHeading
          tone="sand"
          title={s.locate.locatingTitle}
          subtitle={s.locate.locatingSubtitle}
        />
      );
    case 'noBuilding':
      return (
        <PanelHeading
          icon={WarningCircle}
          tone="brick"
          title={s.locate.noneTitle}
          subtitle={s.locate.noneSubtitle}
        />
      );
    case 'unavailable':
      return (
        <PanelHeading
          icon={CloudSlash}
          tone="brick"
          title={s.locate.offlineTitle}
          subtitle={s.locate.offlineSubtitle}
        />
      );
    case 'locationDenied':
      return (
        <>
          <PanelHeading
            icon={MapPinLine}
            tone="brick"
            title={s.locate.deniedTitle}
            subtitle={s.locate.deniedSubtitle}
          />
          {!status.canAskAgain && (
            <Pressable onPress={onOpenSettings} hitSlop={8} accessibilityRole="link">
              <AppText style={styles.link}>{s.locate.openSettings}</AppText>
            </Pressable>
          )}
        </>
      );
    case 'idle':
      return (
        <PanelHeading
          icon={HouseLine}
          tone="teal"
          title={s.locate.idleTitle}
          subtitle={s.locate.idleSubtitle}
          info="address"
        />
      );
  }
}

type PanelHeadingProps = {
  icon?: Icon;
  tone: BadgeTone;
  title: string;
  subtitle: string;
  info?: InfoTopic;
};

function PanelHeading({ icon, tone, title, subtitle, info }: PanelHeadingProps) {
  return (
    <View style={styles.heading}>
      {icon ? (
        <IconBadge icon={icon} tone={tone} size={44} />
      ) : (
        <View style={styles.loader}>
          <ActivityIndicator color={badgeColor(tone)} />
        </View>
      )}
      <View style={styles.headingText}>
        <AppText variant="subtitle">{title}</AppText>
        <AppText variant="caption">{subtitle}</AppText>
      </View>
      {info ? <InfoButton topic={info} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
    ...shadows.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.cardBorder,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loader: {
    width: 44,
    height: 44,
    borderRadius: radii.icon,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inactiveTab,
  },
  headingText: {
    flex: 1,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  hint: {
    flex: 1,
    textAlign: 'right',
  },
  link: {
    fontFamily: fonts.semibold,
    color: colors.buttons,
  },
});
