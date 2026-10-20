import { StyleSheet, View } from 'react-native';

import { RUNOFF_COEFFICIENT } from '@/data/calculations/constants';
import { waterPrice } from '@/data/calculations/finance';
import { HISTORY_PERIOD } from '@/data/services/weatherService';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { colors, fonts, radii } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { ratingColor, useResultFormat } from '../useResultFormat';

const RELIABILITY_STEPS = 4;

export default function DataScreen() {
  const { s, fill, number, rating } = useResultFormat();
  const { project, preferences } = useProjectStore();
  const { roof, household } = project;

  const materialValue =
    roof.materialSource === 'model' && roof.materialConfidence !== null
      ? fill(s.data.sure, { value: Math.round(roof.materialConfidence * 100) })
      : roof.materialSource === 'ign'
        ? s.roof.fromIgn
        : s.data.confirmed;
  const score = 2 + (roof.materialSource === 'user' ? 1 : 0);
  const reliability = score >= 3 ? 'good' : 'fair';
  const price = waterPrice(preferences.includeSewerCharge);

  const rows = [
    { title: s.data.rows.outline, source: 'IGN BD TOPO', value: s.data.measured },
    { title: s.data.rows.material, source: s.roof.materials[roof.material], value: materialValue },
    {
      title: s.data.rows.rain,
      source: `Open-Meteo ${HISTORY_PERIOD.start}–${HISTORY_PERIOD.end}`,
      value: s.data.tenYears,
    },
    { title: s.data.rows.price, source: 'Iléo 2025', value: `${number(price, 2)} €/m³` },
    {
      title: s.data.rows.household,
      source: s.data.you,
      value: fill(s.data.people, { value: household.people }),
    },
  ];

  return (
    <ResultDetail title={s.data.title}>
      {() => (
        <>
          <Card style={styles.reliability}>
            <View style={styles.row}>
              <AppText variant="subtitle" style={styles.flex}>
                {s.data.reliability}
              </AppText>
              <AppText style={[styles.value, { color: ratingColor(reliability) }]}>
                {rating(reliability)}
              </AppText>
            </View>
            <View style={styles.meter}>
              {Array.from({ length: RELIABILITY_STEPS }, (_, index) => (
                <View key={index} style={[styles.meterStep, index < score && styles.meterStepOn]} />
              ))}
            </View>
            <AppText variant="caption">{s.data.reliabilityHint}</AppText>
          </Card>
          <Card compact>
            {rows.map((row, index) => (
              <View key={row.title} style={[styles.sourceRow, index > 0 && styles.divider]}>
                <View style={styles.flex}>
                  <AppText variant="subtitle" style={styles.sourceTitle}>
                    {row.title}
                  </AppText>
                  <AppText variant="caption">{row.source}</AppText>
                </View>
                <AppText style={styles.sourceValue}>{row.value}</AppText>
              </View>
            ))}
          </Card>
          <Card tone="sand">
            <AppText variant="caption" color={colors.primaryText}>
              {fill(s.data.note, { runoff: number(RUNOFF_COEFFICIENT[roof.material], 2) })}
            </AppText>
          </Card>
        </>
      )}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  reliability: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  value: {
    fontFamily: fonts.bold,
  },
  meter: {
    flexDirection: 'row',
    gap: 6,
  },
  meterStep: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.inactiveTab,
  },
  meterStepOn: {
    backgroundColor: colors.teal,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  sourceTitle: {
    fontSize: 14,
  },
  sourceValue: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primaryText,
  },
});
