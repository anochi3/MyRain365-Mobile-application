import {
  ArrowsClockwise,
  ChartBar,
  CheckCircle,
  ClipboardText,
  Cylinder,
  Drop,
  UsersThree,
  Warning,
  type Icon,
} from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { SHARED_TANK_L } from '@/data/calculations/constants';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import IconBadge from '@/shared/components/IconBadge';
import { colors } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

const OPTION_ICONS = { shared: UsersThree, own: Cylinder, butt: Drop };

export default function WhyScreen() {
  const { s, fill, number, rating } = useResultFormat();
  const { project } = useProjectStore();

  return (
    <ResultDetail title={s.why.title}>
      {({ simulation, own, shared, verdict }) => {
        const option = verdict.bestOption;
        const copy = s.why[option];
        const economics = option === 'shared' ? shared : own;
        const coverage =
          option === 'shared' ? simulation.shared.coverage : simulation.typical.coverage;
        const params = {
          homes: shared.homes,
          tank: number(option === 'shared' ? SHARED_TANK_L : project.tankLitres),
          coverage: number(coverage * 100),
          low: number(economics.payback[0]),
          high: number(economics.payback[1]),
          perM3: number(economics.rainwaterCostPerM3[0], 2),
          storm: number(simulation.shared.inflowM3),
        };
        const optionTitle =
          option === 'shared'
            ? s.recommendations.items.sharedTank.title
            : option === 'own'
              ? s.recommendations.items.ownTank.title
              : s.recommendations.items.waterButt.title;

        const blocks: { icon: Icon; color: string; title: string; text: string }[] = [
          {
            icon: CheckCircle,
            color: colors.green,
            title: s.why.blocks.reason,
            text: fill(copy.reason, params),
          },
          {
            icon: ChartBar,
            color: colors.buttons,
            title: s.why.blocks.indicators,
            text: fill(copy.indicators, params),
          },
          {
            icon: Warning,
            color: colors.warningTitle,
            title: s.why.blocks.downsides,
            text: copy.downsides,
          },
          {
            icon: ArrowsClockwise,
            color: colors.secondaryText,
            title: s.why.blocks.change,
            text: copy.change,
          },
          {
            icon: ClipboardText,
            color: colors.secondaryText,
            title: s.why.blocks.before,
            text: s.why.before,
          },
        ];

        return (
          <>
            <Card tone="selected" style={styles.header}>
              <IconBadge icon={OPTION_ICONS[option]} tone="teal" />
              <View style={styles.flex}>
                <AppText variant="subtitle">{optionTitle}</AppText>
                <AppText variant="caption">
                  {fill(s.why.confidence, { value: rating(verdict.water).toLowerCase() })}
                </AppText>
              </View>
            </Card>
            {blocks.map((block) => (
              <Card key={block.title} style={styles.block}>
                <block.icon size={22} weight="fill" color={block.color} />
                <View style={styles.flex}>
                  <AppText variant="subtitle" style={styles.blockTitle}>
                    {block.title}
                  </AppText>
                  <AppText style={styles.blockText}>{block.text}</AppText>
                </View>
              </Card>
            ))}
          </>
        );
      }}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  block: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  blockTitle: {
    fontSize: 15,
  },
  blockText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
