import { CalendarBlank, CheckCircle, Info, Warning } from 'phosphor-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  levelNeededForDays,
  simulateWaterCut,
  WATER_CUT_DURATIONS,
} from '@/data/calculations/resilience';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Segmented } from '@/shared/components/Controls';
import { Notice } from '@/shared/components/Notice';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import PairedBars from '@/shared/components/charts/PairedBars';
import { colors, fonts, radii } from '@/shared/global.styles';

import Legend from '../components/Legend';
import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

const SUMMER_MONTH = 8;

export default function WaterCutScreen() {
  const { s, fill, number, percent, litres, date } = useResultFormat();
  const { project } = useProjectStore();
  const [duration, setDuration] = useState(3);
  const month = new Date().getMonth() + 1;
  const monthName = date(`${new Date().getFullYear()}-${String(month).padStart(2, '0')}-15`, {
    month: 'long',
  });

  return (
    <ResultDetail title={s.waterCut.title} info="waterCut">
      {({ simulation }) => {
        const startLevel = simulation.typical.months[month - 1].averageLevelL;
        const cut = simulateWaterCut(project.household, startLevel, duration, month);
        const reserve = levelNeededForDays(project.household, duration, SUMMER_MONTH);
        const isCovered = cut.firstShortDay === null;

        return (
          <>
            <AppText>{s.waterCut.subtitle}</AppText>
            <AppText variant="label">{s.waterCut.duration}</AppText>
            <Segmented
              options={WATER_CUT_DURATIONS.map((value) => ({
                value,
                label: s.waterCut.durations[value as 1 | 3 | 7],
              }))}
              value={duration}
              onChange={setDuration}
            />

            <Card tone="selected" style={styles.hero}>
              <View style={styles.heroIcon}>
                <CalendarBlank size={28} color={colors.buttons} />
              </View>
              <View style={styles.flex}>
                <AppText variant="label" color={colors.primaryText}>
                  {s.waterCut.autonomy}
                </AppText>
                <AppText variant="heading" color={colors.green}>
                  {fill(s.waterCut.autonomyValue, { value: number(cut.autonomyDays, 1) })}
                </AppText>
                <AppText variant="caption">
                  {fill(s.waterCut.autonomyHint, { month: monthName, level: number(startLevel) })}
                </AppText>
              </View>
            </Card>

            <StatRow>
              <StatTile
                label={s.waterCut.available}
                value={litres(startLevel)}
                color={colors.buttons}
              />
              <StatTile
                label={s.waterCut.unmet}
                value={litres(cut.shortfallL)}
                color={cut.shortfallL > 0 ? colors.warningTitle : colors.green}
              />
            </StatRow>

            <Card style={styles.coverage}>
              <View style={styles.row}>
                <AppText variant="label" style={styles.flex}>
                  {fill(s.waterCut.covered, { days: duration })}
                </AppText>
                <AppText style={styles.coverageValue}>{percent(cut.coverage)}</AppText>
              </View>
              <View style={styles.track}>
                <View style={[styles.bar, { width: `${cut.coverage * 100}%` }]} />
              </View>
            </Card>

            <Card style={styles.chartCard}>
              <AppText variant="label" style={styles.chartLabel}>
                {s.waterCut.daily}
              </AppText>
              <PairedBars
                bars={cut.days.map((day) => ({
                  label: fill(s.waterCut.day, { value: day.day }),
                  back: day.demandL,
                  front: day.servedL,
                }))}
                formatValue={(value) => `${number(value)} L`}
              />
              <Legend
                items={[
                  { label: s.waterCut.demand, color: colors.inactiveTab, shape: 'box' },
                  { label: s.waterCut.served, color: colors.teal, shape: 'box' },
                ]}
              />
            </Card>

            <Card compact>
              <Tip
                icon={isCovered ? CheckCircle : Warning}
                color={isCovered ? colors.green : colors.warningTitle}
                text={
                  isCovered
                    ? s.waterCut.tips.enough
                    : fill(s.waterCut.tips.short, { value: cut.firstShortDay ?? 0 })
                }
              />
              <Tip
                icon={Info}
                color={colors.buttons}
                text={fill(s.waterCut.tips.reserve, { value: number(reserve), days: duration })}
                hasDivider
              />
              <Tip icon={Info} color={colors.buttons} text={s.waterCut.tips.drinking} hasDivider />
            </Card>
            <Notice text={s.waterCut.noRain} />
          </>
        );
      }}
    </ResultDetail>
  );
}

function Tip({
  icon: IconComponent,
  color,
  text,
  hasDivider = false,
}: {
  icon: typeof Info;
  color: string;
  text: string;
  hasDivider?: boolean;
}) {
  return (
    <View style={[styles.tip, hasDivider && styles.divider]}>
      <IconComponent size={20} weight="fill" color={color} />
      <AppText color={colors.primaryText} style={styles.flex}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.greenBackground,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverage: {
    gap: 10,
  },
  coverageValue: {
    fontFamily: fonts.bold,
    color: colors.primaryText,
  },
  track: {
    height: 10,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: colors.inactiveTab,
  },
  bar: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.buttons,
  },
  chartCard: {
    gap: 8,
    paddingHorizontal: 10,
  },
  chartLabel: {
    paddingHorizontal: 8,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});
