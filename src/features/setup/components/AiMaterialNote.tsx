import { Sparkle, WarningCircle } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { MaterialSource, RoofDetection, RoofMaterial } from '@/data/store/projectTypes';
import type { RoofDetectionStatus } from '@/data/store/RoofDetectionProvider';
import AppText from '@/shared/components/AppText';
import { colors, fonts, radii } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

type Props = {
  status: RoofDetectionStatus;
  detection: RoofDetection | null;
  isChosenByAi: boolean;
  materialSource: MaterialSource;
  onUse: (material: RoofMaterial) => void;
  onRetry: () => void;
};

type Tone = 'info' | 'success' | 'warning' | 'neutral';

const TONES: Record<Tone, { background: string; icon: string }> = {
  info: { background: colors.blueSoft, icon: colors.buttons },
  success: { background: colors.greenBackground, icon: colors.green },
  warning: { background: colors.warningBackground, icon: colors.warningTitle },
  neutral: { background: colors.inactiveTab, icon: colors.secondaryText },
};

export default function AiMaterialNote({
  status,
  detection,
  isChosenByAi,
  materialSource,
  onUse,
  onRetry,
}: Props) {
  const { s, fill, number } = useI18n();
  const [showsScores, setShowsScores] = useState(false);

  if (status === 'idle') return null;

  if (status === 'detecting') {
    return (
      <Note tone="info" icon={<ActivityIndicator size="small" color={TONES.info.icon} />}>
        <AppText variant="subtitle">{s.ai.detecting}</AppText>
        <AppText variant="caption">{s.ai.detectingHint}</AppText>
      </Note>
    );
  }

  if (status === 'failed' || !detection) {
    return (
      <Note tone="neutral" icon={<WarningCircle size={20} color={TONES.neutral.icon} />}>
        <AppText variant="caption">{s.ai.failed}</AppText>
        <TextButton label={s.ai.retry} onPress={onRetry} />
      </Note>
    );
  }

  const percent = (value: number) => fill(s.common.percent, { value: number(value * 100) });
  const confidence = percent(detection.confidence);
  const tone: Tone = !isChosenByAi ? 'neutral' : detection.shouldAskUser ? 'warning' : 'success';

  let detail: string;
  if (isChosenByAi) {
    detail = fill(detection.shouldAskUser ? s.ai.unsure : s.ai.sure, { value: confidence });
  } else if (materialSource === 'ign') {
    detail = fill(s.ai.keptIgn, { value: confidence });
  } else {
    detail = s.ai.userChose;
  }

  return (
    <Note
      tone={tone}
      icon={
        tone === 'warning' ? (
          <WarningCircle size={20} weight="fill" color={TONES.warning.icon} />
        ) : (
          <Sparkle size={20} weight="fill" color={TONES[tone].icon} />
        )
      }
    >
      <AppText variant="subtitle">
        {fill(s.ai.verdict, { material: s.ai.materials[detection.material] })}
      </AppText>
      <AppText variant="caption">{detail}</AppText>

      {showsScores
        ? detection.probabilities.map(({ material, probability }) => (
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
          ))
        : null}

      <View style={styles.actions}>
        {isChosenByAi ? null : (
          <TextButton
            label={fill(s.ai.use, { material: s.roof.materials[detection.material].toLowerCase() })}
            onPress={() => onUse(detection.material)}
          />
        )}
        <TextButton
          label={showsScores ? s.ai.hideScores : s.ai.showScores}
          onPress={() => setShowsScores((value) => !value)}
          isQuiet
        />
      </View>
    </Note>
  );
}

function Note({ tone, icon, children }: { tone: Tone; icon: ReactNode; children: ReactNode }) {
  return (
    <View
      style={[styles.note, { backgroundColor: TONES[tone].background }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.icon}>{icon}</View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

function TextButton({
  label,
  onPress,
  isQuiet = false,
}: {
  label: string;
  onPress: () => void;
  isQuiet?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      style={({ pressed }) => pressed && styles.pressed}
    >
      <AppText style={[styles.textButton, isQuiet && styles.textButtonQuiet]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radii.tile,
  },
  icon: {
    width: 20,
    paddingTop: 2,
    alignItems: 'center',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 18,
    rowGap: 6,
    marginTop: 4,
  },
  textButton: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.buttons,
  },
  textButtonQuiet: {
    color: colors.secondaryText,
  },
  pressed: {
    opacity: 0.6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  barLabel: {
    width: 86,
    fontSize: 13,
    color: colors.primaryText,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
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
    width: 40,
    textAlign: 'right',
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primaryText,
  },
});
