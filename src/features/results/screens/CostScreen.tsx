import { Cylinder, Engine, Funnel, Pipe, Wrench, type Icon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import type { CostItem } from '@/data/calculations/constants';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import LineChart from '@/shared/components/charts/LineChart';
import { colors, fonts } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

const ITEM_ICONS: Record<CostItem['key'], Icon> = {
  tank: Cylinder,
  filters: Funnel,
  pump: Engine,
  pipes: Pipe,
  installation: Wrench,
};

const HORIZON_YEARS = 40;
const YEAR_STEP = 5;

export default function CostScreen() {
  const { s, fill, number, euroRange, compactEuros } = useResultFormat();
  const { project } = useProjectStore();

  return (
    <ResultDetail title={s.cost.title} info="cost">
      {({ own }) => {
        const years = Array.from(
          { length: HORIZON_YEARS / YEAR_STEP + 1 },
          (_, index) => index * YEAR_STEP,
        );
        const top = Math.max(own.cost[1], own.netAnnualSaving * HORIZON_YEARS) * 1.05;

        return (
          <>
            <Card compact>
              {own.costItems.map((item, index) => {
                const IconComponent = ITEM_ICONS[item.key];
                return (
                  <View key={item.key} style={[styles.item, index > 0 && styles.divider]}>
                    <IconComponent size={20} color={colors.secondaryText} />
                    <AppText color={colors.primaryText} style={styles.flex}>
                      {fill(s.cost.items[item.key], { value: number(project.tankLitres) })}
                    </AppText>
                    <AppText style={styles.amount}>{euroRange(item.range)}</AppText>
                  </View>
                );
              })}
              <View style={[styles.item, styles.total]}>
                <AppText style={[styles.flex, styles.totalLabel]}>{s.cost.total}</AppText>
                <AppText style={styles.totalLabel}>{euroRange(own.cost)}</AppText>
              </View>
            </Card>

            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <AppText variant="label" style={styles.flex}>
                  {s.cost.savings}
                </AppText>
                <AppText variant="caption">
                  {fill(s.cost.savingsHint, { value: number(own.netAnnualSaving) })}
                </AppText>
              </View>
              <LineChart
                points={years.map((year) => ({
                  label: `${year}`,
                  value: Math.max(0, year * own.netAnnualSaving),
                }))}
                max={top}
                ticks={[0, top / 2, top]}
                formatValue={compactEuros}
                band={{ from: own.cost[0], to: own.cost[1], label: s.cost.systemCost }}
                height={160}
              />
            </Card>
            <AppText variant="caption">{s.cost.note}</AppText>
          </>
        );
      }}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  flex: {
    flex: 1,
  },
  amount: {
    fontFamily: fonts.semibold,
    color: colors.primaryText,
  },
  total: {
    borderTopWidth: 1.5,
    borderTopColor: colors.primaryText,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    color: colors.primaryText,
  },
  chartCard: {
    gap: 6,
    paddingHorizontal: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});
