import { CheckCircle, Sparkle, WarningCircle } from 'phosphor-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { RoofMaterial } from '@/data/store/projectTypes';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { colors, fonts, radii } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

import type { DetectionState } from '../hooks/useRoofMaterialDetection';

type Props = {
  state: DetectionState;
  onUse: (material: RoofMaterial) => void;
};

export default function MaterialDetectionCard({ state, onUse }: Props) {
  const { s, fill, number } = useI18n();

  if (state.status === 'disabled') return null;

  if (state.status === 'detecting') {
    return (
      <Card tone="info" style={styles.row}>
        <ActivityIndicator color={colors.buttons} />
        <View style={styles.flex}>
          <AppText variant="subtitle">{s.ai.detectingTitle}</AppText>
          <AppText variant="caption">{s.ai.detectingHint}</AppText>
        </View>
      </Card>
    );
  }

  if (state.status === 'failed') {
    return (
      <Card tone="sand" style={styles.row}>
        <WarningCircle size={22} color={colors.secondaryText} />
        <AppText variant="caption" style={styles.flex}>
          {s.ai.failed}
        </AppText>
      </Card>
    );
  }

  const { detection, agreesWithChoice } = state;
  const percent = (value: number) => fill(s.common.percent, { value: number(value * 100) });
  const title = fill(s.ai.verdict, {
    material: s.roof.materials[detection.material].toLowerCase(),
  });
  const isUnsure = detection.shouldAskUser;

  return (
    <Card tone={isUnsure ? 'warning' : 'selected'} style={styles.card}>
      <View style={styles.row}>
        {isUnsure ? (
          <WarningCircle size={22} weight="fill" color={colors.warningTitle} />
        ) : (
          <Sparkle size={22} weight="fill" color={colors.green} />
        )}
        <View style={styles.flex}>
          <AppText variant="subtitle">{title}</AppText>
          <AppText variant="caption">
            {isUnsure
              ? s.ai.unsure
              : fill(s.ai.confidence, { value: percent(detection.confidence) })}
          </AppText>
        </View>
      </View>

      {detection.probabilities.map(({ material, probability }) => (
        <View key={material} style={styles.barRow}>
          <AppText style={styles.barLabel}>{s.roof.materials[material]}</AppText>
          <View style={styles.track}>
            <View
              style={[
                styles.bar,
                { width: `${Math.max(probability * 100, 2)}%` },
                material === detection.material && styles.barTop,
              ]}
            />
          </View>
          <AppText style={styles.barValue}>{percent(probability)}</AppText>
        </View>
      ))}

      {agreesWithChoice ? (
        <View style={styles.row}>
          <CheckCircle size={16} weight="fill" color={colors.green} />
          <AppText variant="caption" color={colors.green}>
            {s.ai.inUse}
          </AppText>
        </View>
      ) : (
        <Pressable
          onPress={() => onUse(detection.material)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.useButton, pressed && styles.pressed]}
        >
          <AppText style={styles.useLabel}>
            {fill(s.ai.use, { material: s.roof.materials[detection.material].toLowerCase() })}
          </AppText>
        </Pressable>
      )}
      <AppText variant="caption">{s.ai.source}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 86,
    fontSize: 13,
    color: colors.primaryText,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: colors.inactiveTab,
  },
  bar: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.blueBorder,
  },
  barTop: {
    backgroundColor: colors.teal,
  },
  barValue: {
    width: 44,
    textAlign: 'right',
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primaryText,
  },
  useButton: {
    alignSelf: 'flex-start',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.buttons,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  useLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.buttons,
  },
});
