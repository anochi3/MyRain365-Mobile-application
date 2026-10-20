/** Own tank vs shared courée tank side by side, and a way to invite the neighbours. */
import { CloudRain, Star, UsersThree } from 'phosphor-react-native';
import { Share, StyleSheet, View } from 'react-native';

import { SHARED_TANK_L } from '@/data/calculations/constants';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import { colors, fonts, radii } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

type Column = {
  title: string;
  subtitle: string;
  rows: { label: string; value: string }[];
  isBest: boolean;
};

export default function CompareScreen() {
  const { s, fill, number, percent, euroRange, years } = useResultFormat();
  const { project } = useProjectStore();

  const invite = () => void Share.share({ message: s.compare.inviteMessage });

  return (
    <ResultDetail
      title={s.compare.title}
      footer={<Button label={s.compare.invite} icon={UsersThree} onPress={invite} />}
    >
      {({ simulation, own, shared, verdict }) => {
        const columns: Column[] = [
          {
            title: s.compare.own,
            subtitle: fill(s.compare.ownHint, { value: number(project.tankLitres) }),
            rows: [
              { label: s.compare.cost, value: euroRange(own.cost) },
              { label: s.compare.covered, value: percent(simulation.typical.coverage) },
              {
                label: s.compare.net,
                value: fill(s.compare.netValue, { value: number(own.netAnnualSaving) }),
              },
              { label: s.compare.payback, value: years(own.payback) },
            ],
            isBest: verdict.bestOption === 'own',
          },
          {
            title: s.compare.shared,
            subtitle: fill(s.compare.sharedHint, {
              homes: shared.homes,
              value: number(SHARED_TANK_L),
            }),
            rows: [
              { label: s.compare.costPerHome, value: euroRange(shared.costPerHome) },
              { label: s.compare.covered, value: percent(simulation.shared.coverage) },
              {
                label: s.compare.net,
                value: fill(s.compare.netValue, { value: number(shared.netAnnualSaving) }),
              },
              { label: s.compare.payback, value: years(shared.payback) },
            ],
            isBest: verdict.bestOption === 'shared',
          },
        ];

        return (
          <>
            <View style={styles.columns}>
              {columns.map((column) => (
                <Card
                  key={column.title}
                  tone={column.isBest ? 'selected' : 'plain'}
                  style={styles.column}
                >
                  {column.isBest ? (
                    <View style={styles.best}>
                      <Star size={12} weight="bold" color={colors.buttonText} />
                      <AppText style={styles.bestLabel}>{s.compare.best}</AppText>
                    </View>
                  ) : (
                    <View style={styles.bestPlaceholder} />
                  )}
                  <AppText variant="subtitle">{column.title}</AppText>
                  <AppText variant="caption" style={styles.subtitle}>
                    {column.subtitle}
                  </AppText>
                  {column.rows.map((row) => (
                    <View key={row.label} style={styles.cell}>
                      <AppText variant="caption">{row.label}</AppText>
                      <AppText style={styles.value} adjustsFontSizeToFit numberOfLines={1}>
                        {row.value}
                      </AppText>
                    </View>
                  ))}
                </Card>
              ))}
            </View>
            <Card tone="info" style={styles.storm}>
              <CloudRain size={24} weight="fill" color={colors.buttons} />
              <AppText color={colors.primaryText} style={styles.flex}>
                {fill(s.compare.storm, { value: number(simulation.shared.inflowM3) })}
              </AppText>
            </Card>
          </>
        );
      }}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
    gap: 4,
    padding: 14,
  },
  best: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.teal,
  },
  bestLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.buttonText,
  },
  bestPlaceholder: {
    height: 24,
  },
  subtitle: {
    marginBottom: 4,
  },
  cell: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primaryText,
  },
  storm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
});
