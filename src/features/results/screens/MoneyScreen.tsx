/** Is it worth the money: payback, balance after 10 and 20 years, rainwater vs mains price per m³. */
import { CheckCircle, WarningCircle } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { WATER_PRICE_EUR_PER_M3 } from '@/data/calculations/constants';
import type { Range } from '@/data/calculations/finance';
import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Segmented } from '@/shared/components/Controls';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import { colors, fonts } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

// The tank "pays back" if its fastest payback is within 20 years.
const PAYBACK_HORIZON_YEARS = 20;

export default function MoneyScreen() {
  const { s, fill, number, euroRange, thousands } = useResultFormat();
  const { preferences, project } = useProjectStore();
  const { updatePreferences } = useProjectActions();

  // Shows a balance range in thousands of euros, for example "−€4.0k to −€2.0k".
  const signedThousands = ([low, high]: Range) =>
    fill(s.common.range, { low: thousands(low), high: thousands(high) });

  return (
    <ResultDetail title={s.money.title}>
      {({ own, shared }) => {
        const paysBack = own.payback[0] <= PAYBACK_HORIZON_YEARS;
        const canShare = project.site.isCouree || project.site.kind === 'shared';
        const paybackParams = { low: number(own.payback[0]), high: number(own.payback[1]) };

        return (
          <>
            <Segmented
              options={[
                {
                  value: 'withSewer',
                  label: fill(s.money.withSewer, {
                    value: number(WATER_PRICE_EUR_PER_M3.withSewer, 2),
                  }),
                },
                {
                  value: 'waterOnly',
                  label: fill(s.money.waterOnly, {
                    value: number(WATER_PRICE_EUR_PER_M3.waterOnly, 2),
                  }),
                },
              ]}
              value={preferences.includeSewerCharge ? 'withSewer' : 'waterOnly'}
              onChange={(value) => updatePreferences({ includeSewerCharge: value === 'withSewer' })}
            />
            <Card tone={paysBack ? 'plain' : 'warning'} style={styles.verdict}>
              <View style={styles.row}>
                {paysBack ? (
                  <CheckCircle size={18} weight="fill" color={colors.green} />
                ) : (
                  <WarningCircle size={18} weight="fill" color={colors.warningTitle} />
                )}
                <AppText
                  style={[styles.heading, { color: paysBack ? colors.green : colors.warningTitle }]}
                >
                  {paysBack ? fill(s.money.payback, paybackParams) : s.money.noPayback}
                </AppText>
              </View>
              <AppText color={colors.primaryText}>
                {paysBack ? s.money.explainYes : fill(s.money.explainNo, paybackParams)}
              </AppText>
            </Card>
            <StatRow>
              <StatTile
                label={s.money.net10}
                value={signedThousands(own.netAfter(10))}
                size="medium"
                color={own.netAfter(10)[1] < 0 ? colors.warningTitle : colors.green}
              />
              <StatTile
                label={s.money.net20}
                value={signedThousands(own.netAfter(20))}
                size="medium"
                color={own.netAfter(20)[1] < 0 ? colors.warningTitle : colors.green}
              />
            </StatRow>
            <StatRow>
              <StatTile
                label={s.money.rainPerM3}
                value={euroRange(own.rainwaterCostPerM3, 1)}
                size="medium"
              />
              <StatTile
                label={s.money.mainsPerM3}
                value={fill(s.common.euros, { value: number(own.pricePerM3, 2) })}
                size="medium"
                color={colors.green}
              />
            </StatRow>
            {canShare ? (
              <Card style={styles.shared}>
                <View style={styles.row}>
                  <AppText variant="subtitle" style={styles.flex}>
                    {s.money.shared}
                  </AppText>
                  <AppText
                    style={styles.sharedValue}
                  >{`${euroRange(shared.rainwaterCostPerM3, 1)}/m³`}</AppText>
                </View>
                <AppText>
                  {fill(s.money.sharedHint, {
                    low: number(shared.payback[0]),
                    high: number(shared.payback[1]),
                  })}
                </AppText>
              </Card>
            ) : null}
            <AppText variant="caption">{s.money.note}</AppText>
          </>
        );
      }}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  verdict: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  shared: {
    gap: 4,
  },
  flex: {
    flex: 1,
  },
  sharedValue: {
    fontFamily: fonts.bold,
    color: colors.green,
  },
});
