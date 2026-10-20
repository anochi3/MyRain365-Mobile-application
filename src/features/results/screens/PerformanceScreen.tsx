import { StyleSheet } from 'react-native';

import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Notice } from '@/shared/components/Notice';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import LineChart from '@/shared/components/charts/LineChart';
import { colors } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

export default function PerformanceScreen() {
  const { s, fill, number, percent } = useResultFormat();
  const { project } = useProjectStore();
  const capacity = project.tankLitres;
  const initials = s.common.monthInitials.split('');

  return (
    <ResultDetail title={s.performance.title}>
      {({ simulation }) => {
        const { typical } = simulation;
        return (
          <>
            <Card style={styles.chartCard}>
              <AppText variant="label" style={styles.chartLabel}>
                {s.performance.level}
              </AppText>
              <LineChart
                points={typical.months.map((month, index) => ({
                  label: initials[index],
                  value: month.averageLevelL,
                }))}
                max={capacity}
                ticks={[0, capacity]}
                formatValue={(value) => (value === 0 ? '0' : `${number(value / 1000, 1)}k L`)}
                fillArea
                limit={{
                  value: capacity,
                  label: fill(s.performance.capacity, { value: number(capacity) }),
                }}
              />
            </Card>
            <StatRow>
              <StatTile
                label={s.performance.reliability}
                value={percent(typical.coverage)}
                hint={s.performance.reliabilityHint}
                color={colors.green}
              />
              <StatTile
                label={s.performance.shortage}
                value={number(typical.emptyDays)}
                hint={s.performance.shortageHint}
                color={colors.warningTitle}
              />
            </StatRow>
            <StatRow>
              <StatTile
                label={s.performance.overflow}
                value={fill(s.common.days, { value: number(typical.fullDays) })}
                hint={fill(s.performance.overflowHint, {
                  value: number(typical.overflowM3 * 1000),
                })}
              />
              <StatTile
                label={s.performance.fill}
                value={percent(typical.averageFill)}
                hint={s.performance.fillHint}
                color={colors.buttons}
              />
            </StatRow>
            <Notice
              text={fill(s.performance.note, {
                collected: number(typical.inflowM3, 1),
                used: number(typical.usedM3, 1),
              })}
            />
          </>
        );
      }}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    paddingHorizontal: 10,
  },
  chartLabel: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
});
