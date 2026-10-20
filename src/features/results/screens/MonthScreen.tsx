/** Month-by-month water balance for a typical, dry or wet year, plus the three scenario donuts. */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Segmented } from '@/shared/components/Controls';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import Donut from '@/shared/components/charts/Donut';
import MonthChart from '@/shared/components/charts/MonthChart';
import { colors } from '@/shared/global.styles';

import Legend from '../components/Legend';
import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

type Scenario = 'dry' | 'typical' | 'wet';

export default function MonthScreen() {
  const { s, fill, number, percent } = useResultFormat();
  const [scenario, setScenario] = useState<Scenario>('typical');

  return (
    <ResultDetail title={s.month.title}>
      {({ simulation }) => {
        const shown = simulation[scenario];
        const overflows = simulation.typical.fullDays > 15;
        const scenarioLabels: Record<Scenario, string> = {
          dry: fill(s.month.dry, { year: simulation.dryYear }),
          typical: s.month.typical,
          wet: fill(s.month.wet, { year: simulation.wetYear }),
        };

        return (
          <>
            <Segmented
              options={(['dry', 'typical', 'wet'] as Scenario[]).map((value) => ({
                value,
                label: scenarioLabels[value],
              }))}
              value={scenario}
              onChange={setScenario}
            />
            <Card style={styles.chartCard}>
              <MonthChart
                months={shown.months}
                monthInitials={s.common.monthInitials.split('')}
                unitLabel={s.month.chartUnit}
              />
              <Legend
                items={[
                  { label: s.month.collected, color: colors.teal, shape: 'box' },
                  { label: s.month.needed, color: colors.blueSoft, shape: 'box' },
                  { label: s.month.left, color: colors.warningTitle, shape: 'line' },
                ]}
              />
            </Card>
            <StatRow>
              <StatTile label={s.month.rainYear} value={`${number(shown.rainMm)} mm`} />
              <StatTile
                label={s.month.emptyDays}
                value={fill(s.common.days, { value: number(shown.emptyDays) })}
              />
            </StatRow>

            <AppText variant="label" style={styles.sectionLabel}>
              {s.month.scenarios}
            </AppText>
            <Card style={styles.scenarios}>
              {(['dry', 'typical', 'wet'] as Scenario[]).map((key) => (
                <View key={key} style={styles.scenario}>
                  <Donut
                    fraction={simulation[key].coverage}
                    label={percent(simulation[key].coverage)}
                    size={84}
                    strokeWidth={10}
                    color={
                      key === 'dry'
                        ? colors.warningTitle
                        : key === 'wet'
                          ? colors.buttons
                          : colors.teal
                    }
                  />
                  <AppText variant="caption" align="center">
                    {scenarioLabels[key]}
                  </AppText>
                </View>
              ))}
            </Card>
            <AppText>{overflows ? s.month.noteLong : s.month.noteShort}</AppText>
          </>
        );
      }}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    gap: 8,
    paddingHorizontal: 10,
  },
  sectionLabel: {
    marginTop: 6,
  },
  scenarios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scenario: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
});
