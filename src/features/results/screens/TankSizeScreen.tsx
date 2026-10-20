/** Needs covered for each tank size, the recommended size, and a button to switch to it. */
import { StyleSheet, View } from 'react-native';

import { WALL_TANK_MAX_L } from '@/data/calculations/constants';
import { recommendedTank } from '@/data/calculations/tankSize';
import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import LineChart from '@/shared/components/charts/LineChart';
import { colors } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

export default function TankSizeScreen() {
  const { s, fill, number, percent } = useResultFormat();
  const { project } = useProjectStore();
  const { setTank } = useProjectActions();
  const maxLitres = project.site.tankSpace === 'wall' ? WALL_TANK_MAX_L : Infinity;

  return (
    <ResultDetail title={s.tankSize.title}>
      {({ simulation }) => {
        const { bySize } = simulation;
        // Recommended size (wall tanks are limited to 1,000 L) and the next size up, to show the gain.
        const best = recommendedTank(bySize, maxLitres);
        const bigger = bySize.find((option) => option.tankLitres > best.tankLitres);
        const coverages = bySize.map((option) => option.coverage);
        // Chart range: round the lowest and highest coverage to the nearest 10% with a little margin.
        const low = Math.max(0, Math.floor(Math.min(...coverages) * 10) / 10 - 0.1);
        const high = Math.min(1, Math.ceil(Math.max(...coverages) * 10) / 10 + 0.05);
        const others = bySize.filter((option) => option.tankLitres !== best.tankLitres);

        return (
          <>
            <Card style={styles.chartCard}>
              <LineChart
                points={bySize.map((option) => ({
                  label: fill(s.common.litres, { value: number(option.tankLitres) }),
                  value: option.coverage,
                  isHighlighted: option.tankLitres === project.tankLitres,
                }))}
                min={low}
                max={high}
                ticks={[low, (low + high) / 2, high]}
                formatValue={(value) => percent(value)}
                showDots
                height={190}
              />
            </Card>
            <Card tone="accent" style={styles.recommended}>
              <View style={styles.row}>
                <AppText variant="subtitle" style={styles.flex}>
                  {fill(s.tankSize.recommended, { value: number(best.tankLitres) })}
                </AppText>
                <AppText variant="stat" color={colors.buttons}>
                  {percent(best.coverage)}
                </AppText>
              </View>
              {bigger ? (
                <AppText>
                  {fill(s.tankSize.note, {
                    value: number(best.tankLitres),
                    gain: number((bigger.coverage - best.coverage) * 100),
                  })}
                </AppText>
              ) : null}
              {project.tankLitres !== best.tankLitres ? (
                <Button
                  label={fill(s.tankSize.choose, { value: number(best.tankLitres) })}
                  variant="secondary"
                  compact
                  onPress={() => setTank(best.tankLitres)}
                />
              ) : null}
            </Card>
            <StatRow>
              {others.slice(0, 2).map((option) => (
                <StatTile
                  key={option.tankLitres}
                  label={fill(s.common.litres, { value: number(option.tankLitres) })}
                  value={percent(option.coverage)}
                  hint={s.tankSize.covered}
                />
              ))}
            </StatRow>
            <StatRow>
              {others.slice(2).map((option) => (
                <StatTile
                  key={option.tankLitres}
                  label={fill(s.common.litres, { value: number(option.tankLitres) })}
                  value={percent(option.coverage)}
                  hint={s.tankSize.covered}
                />
              ))}
              <StatTile
                tone="sand"
                label={s.tankSize.wallMax}
                value={fill(s.common.litres, { value: number(WALL_TANK_MAX_L) })}
                hint={s.tankSize.wallMaxHint}
              />
            </StatRow>
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
  recommended: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
});
