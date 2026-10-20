/** Results summary: verdict, coverage, key figures, water-cut card and links to every detail page. */
import { useRouter, type Href } from 'expo-router';
import {
  ChartLineUp,
  ClipboardText,
  Coins,
  Cylinder,
  Drop,
  Lifebuoy,
  Lightbulb,
  ListChecks,
  Scales,
  ShareNetwork,
  UsersThree,
  type Icon,
} from 'phosphor-react-native';
import { Share, StyleSheet, View } from 'react-native';

import type { ProjectResults } from '@/data/hooks/useProjectResults';
import { activeUses } from '@/data/calculations/simulation';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import ListRow from '@/shared/components/ListRow';
import Screen, { IconButton } from '@/shared/components/Screen';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import Donut from '@/shared/components/charts/Donut';
import { colors, fonts, radii } from '@/shared/global.styles';

import ResultsGate from '../components/ResultsGate';
import { ratingColor, useResultFormat } from '../useResultFormat';

type DetailLink = {
  key: keyof ReturnType<typeof useResultFormat>['s']['results']['links'];
  icon: Icon;
  href: Href;
};

const DETAIL_LINKS: DetailLink[] = [
  { key: 'performance', icon: ChartLineUp, href: '/results/performance' },
  { key: 'tankSize', icon: Cylinder, href: '/results/tank-size' },
  { key: 'cost', icon: Coins, href: '/results/cost' },
  { key: 'money', icon: Scales, href: '/results/money' },
  { key: 'compare', icon: UsersThree, href: '/results/compare' },
  { key: 'recommendations', icon: ListChecks, href: '/results/recommendations' },
  { key: 'quality', icon: Drop, href: '/results/quality' },
  { key: 'waterCut', icon: Lifebuoy, href: '/results/water-cut' },
  { key: 'data', icon: ClipboardText, href: '/results/data' },
];

export default function ResultsScreen() {
  const format = useResultFormat();

  return (
    <Screen title={format.s.results.title} hasTabBar right={<ShareButton />}>
      <ResultsGate>{(results) => <ResultsContent results={results} />}</ResultsGate>
    </Screen>
  );
}

function ShareButton() {
  const { project } = useProjectStore();
  const { s, fill } = useResultFormat();
  return (
    <IconButton
      label={s.common.share}
      icon={<ShareNetwork size={20} color={colors.primaryText} />}
      onPress={() =>
        void Share.share({
          message: fill(s.report.shareMessage, { address: project.building?.address ?? '' }),
        })
      }
    />
  );
}

function ResultsContent({ results }: { results: ProjectResults }) {
  const router = useRouter();
  const { project } = useProjectStore();
  const { s, fill, number, percent, euros, years, rating, m3 } = useResultFormat();
  const { simulation, own, shared, verdict, waterCut } = results;
  const { typical } = simulation;

  // Headline: limited if the water rating is weak, "not alone" when sharing is the better deal.
  const headline = !verdict.feasible
    ? s.results.notFeasible
    : verdict.bestOption === 'shared'
      ? s.results.feasibleAlone
      : s.results.feasible;
  const verdictText = !verdict.feasible
    ? s.results.verdict.weak
    : s.results.verdict[verdict.bestOption];
  const uses = activeUses(project.household)
    .map((use, index) => (index === 0 ? s.home.uses[use] : s.home.uses[use].toLowerCase()))
    .join(', ');
  // The "if shared" hint only appears for a courée or a shared site.
  const canShare = project.site.isCouree || project.site.kind === 'shared';

  return (
    <>
      <Card tone="warning" style={styles.verdict}>
        <View style={styles.row}>
          <Lightbulb size={18} weight="fill" color={colors.warningTitle} />
          <AppText style={styles.verdictHeading}>{headline}</AppText>
        </View>
        <AppText variant="subtitle" style={styles.verdictText}>
          {verdictText}
        </AppText>
        <View style={styles.ratings}>
          {(['water', 'money', 'environment'] as const).map((key) => (
            <View key={key} style={styles.rating}>
              <AppText variant="caption">{s.results[key]}</AppText>
              <AppText style={[styles.ratingValue, { color: ratingColor(verdict[key]) }]}>
                {rating(verdict[key])}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.coverage}>
        <Donut fraction={typical.coverage} label={percent(typical.coverage)} />
        <View style={styles.flex}>
          <AppText variant="subtitle">{s.results.coverage}</AppText>
          <AppText variant="caption" style={styles.coverageHint}>
            {fill(s.results.coverageFor, { uses, people: project.household.people })}
          </AppText>
        </View>
      </Card>

      <StatRow>
        <StatTile
          label={s.results.collected}
          value={m3(typical.inflowM3)}
          hint={s.common.perYear}
          color={colors.green}
        />
        <StatTile
          label={s.results.saved}
          value={euros(own.annualSaving)}
          hint={fill(s.results.savedHint, { price: number(own.pricePerM3, 2) })}
          color={colors.buttons}
        />
      </StatRow>
      <StatRow>
        <StatTile
          label={s.results.tank}
          value={fill(s.common.litres, { value: number(project.tankLitres) })}
          hint={s.results.tankHint}
        />
        <StatTile
          label={s.results.payback}
          value={years(own.payback)}
          hint={
            canShare ? fill(s.results.paybackShared, { value: years(shared.payback) }) : undefined
          }
          color={colors.warningTitle}
          size="medium"
        />
      </StatRow>

      <Card tone="info" style={styles.waterCut}>
        <Lifebuoy size={26} weight="fill" color={colors.buttons} />
        <View style={styles.flex}>
          <AppText variant="label" color={colors.primaryText}>
            {s.results.waterCut}
          </AppText>
          <AppText variant="stat" color={colors.buttons}>
            {fill(s.results.waterCutValue, { value: number(waterCut.autonomyDays, 1) })}
          </AppText>
          <AppText variant="caption">{s.results.waterCutHint}</AppText>
        </View>
        <Button
          label={s.common.details}
          variant="secondary"
          compact
          onPress={() => router.push('/results/water-cut')}
        />
      </Card>

      <View style={styles.row}>
        <Button
          label={s.results.byMonth}
          variant="secondary"
          compact
          style={styles.flex}
          onPress={() => router.push('/results/month')}
        />
        <Button
          label={s.results.report}
          compact
          style={styles.flex}
          onPress={() => router.push('/results/report')}
        />
      </View>

      <AppText variant="label" style={styles.moreLabel}>
        {s.results.more}
      </AppText>
      <Card compact>
        {DETAIL_LINKS.map((link, index) => (
          <ListRow
            key={link.key}
            isFirst={index === 0}
            icon={link.icon}
            title={s.results.links[link.key]}
            onPress={() => router.push(link.href)}
          />
        ))}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  verdict: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verdictHeading: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.warningTitle,
  },
  verdictText: {
    fontSize: 17,
    lineHeight: 22,
  },
  ratings: {
    flexDirection: 'row',
    gap: 6,
  },
  rating: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: radii.icon,
    backgroundColor: colors.cardBackground,
  },
  ratingValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  coverage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  coverageHint: {
    marginTop: 4,
  },
  flex: {
    flex: 1,
  },
  waterCut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moreLabel: {
    marginTop: 8,
  },
});
