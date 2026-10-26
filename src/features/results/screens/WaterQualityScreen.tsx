import {
  ArrowRight,
  Drop,
  Funnel,
  GridFour,
  Pipe,
  Sun,
  Warning,
  type Icon,
} from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { DRINKING_TREATMENT } from '@/data/calculations/constants';
import type { RiskLevel, TreatmentStep } from '@/data/calculations/quality';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import IconBadge from '@/shared/components/IconBadge';
import { Notice } from '@/shared/components/Notice';
import { colors, fonts, radii } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

const RISK_COLORS: Record<RiskLevel, { background: string; foreground: string }> = {
  low: { background: colors.greenBackground, foreground: colors.green },
  medium: { background: colors.blueSoft, foreground: colors.buttons },
  high: { background: colors.warningBackground, foreground: colors.warningTitle },
};

const STEP_ICONS: Record<TreatmentStep, Icon> = {
  gutterMesh: GridFour,
  firstFlush: Drop,
  sedimentFilter: Funnel,
  labelledPipes: Pipe,
};

export default function WaterQualityScreen() {
  const { s, fill, number } = useResultFormat();

  return (
    <ResultDetail title={s.waterQuality.title} info="quality">
      {({ quality }) => (
        <>
          <Card compact>
            <AppText variant="label" style={styles.label}>
              {s.waterQuality.estimated}
            </AppText>
            {quality.risks.map(({ contaminant, level }, index) => (
              <View key={contaminant} style={[styles.riskRow, index > 0 && styles.divider]}>
                <View style={[styles.dot, { backgroundColor: RISK_COLORS[level].foreground }]} />
                <AppText color={colors.primaryText} style={styles.flex}>
                  {s.waterQuality.contaminants[contaminant]}
                </AppText>
                <View style={[styles.pill, { backgroundColor: RISK_COLORS[level].background }]}>
                  <AppText style={[styles.pillLabel, { color: RISK_COLORS[level].foreground }]}>
                    {s.common[level]}
                  </AppText>
                </View>
              </View>
            ))}
          </Card>
          <AppText variant="caption">{s.waterQuality.estimateNote}</AppText>

          <AppText variant="label" style={styles.sectionLabel}>
            {s.waterQuality.treatment}
          </AppText>
          <Card style={styles.chain}>
            {quality.treatment.map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <IconBadge icon={STEP_ICONS[step]} tone="blue" size={36} weight="regular" />
                <AppText color={colors.primaryText} style={styles.flex}>
                  {s.waterQuality.steps[step]}
                </AppText>
                {index < quality.treatment.length - 1 ? (
                  <ArrowRight size={16} color={colors.secondaryText} />
                ) : null}
              </View>
            ))}
          </Card>
          <Notice text={s.waterQuality.rules} />

          <Card tone={quality.wantsDrinking ? 'warning' : 'sand'} style={styles.drinking}>
            <View style={styles.drinkingHeader}>
              {quality.wantsDrinking ? (
                <Warning size={20} weight="fill" color={colors.warningTitle} />
              ) : (
                <Sun size={20} color={colors.secondaryText} />
              )}
              <AppText variant="subtitle">{s.waterQuality.drinkingTitle}</AppText>
            </View>
            <AppText color={colors.primaryText} style={styles.drinkingText}>
              {fill(s.waterQuality.drinking, {
                low: number(DRINKING_TREATMENT.installEur[0]),
                high: number(DRINKING_TREATMENT.installEur[1]),
                upkeep: `${number(DRINKING_TREATMENT.upkeepEurPerYear[0])}–${number(DRINKING_TREATMENT.upkeepEurPerYear[1])}`,
              })}
            </AppText>
          </Card>
        </>
      )}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  label: {
    paddingTop: 10,
    paddingBottom: 2,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  flex: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  pillLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  sectionLabel: {
    marginTop: 6,
  },
  chain: {
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drinking: {
    gap: 6,
  },
  drinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drinkingText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
