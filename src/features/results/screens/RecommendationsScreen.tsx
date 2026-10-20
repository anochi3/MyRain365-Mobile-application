import { useRouter } from 'expo-router';
import {
  ArrowsInLineVertical,
  Cylinder,
  Drop,
  FlowerTulip,
  Lifebuoy,
  UsersThree,
  Wheelchair,
  Wrench,
  type Icon,
} from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import type { Recommendation, RecommendationKey } from '@/data/calculations/recommendations';
import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import IconBadge, { badgeColor, type BadgeTone } from '@/shared/components/IconBadge';
import { fonts } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { useResultFormat } from '../useResultFormat';

const ICONS: Record<RecommendationKey, Icon> = {
  sharedTank: UsersThree,
  waterButt: Drop,
  ownTank: Cylinder,
  rainGarden: FlowerTulip,
  infiltration: ArrowsInLineVertical,
  waterCutReserve: Lifebuoy,
  accessibleTap: Wheelchair,
  maintenanceHelp: Wrench,
};

const TONES: Record<Recommendation['tone'], BadgeTone> = {
  best: 'teal',
  good: 'blue',
  neutral: 'sand',
  caution: 'brick',
};

export default function RecommendationsScreen() {
  const router = useRouter();
  const { s, fill, number, years, euroRange } = useResultFormat();

  const tagFor = (item: Recommendation) => {
    if (item.payback) return years(item.payback);
    if (item.cost) return euroRange(item.cost);
    if (item.key === 'waterCutReserve') return s.recommendations.tags.resilience;
    if (item.key === 'accessibleTap' || item.key === 'maintenanceHelp')
      return s.recommendations.tags.access;
    if (item.key === 'rainGarden') return s.recommendations.tags.soil;
    return s.recommendations.tags.caution;
  };

  const detailFor = (item: Recommendation) =>
    fill(s.recommendations.items[item.key].detail, {
      low: number(item.cost?.[0] ?? 0),
      high: number(item.cost?.[1] ?? 0),
      value: number(item.reserveL ?? 0),
      days: item.days ?? 0,
    });

  return (
    <ResultDetail
      title={s.recommendations.title}
      footer={
        <Button
          label={s.recommendations.why}
          variant="secondary"
          onPress={() => router.push('/results/why')}
        />
      }
    >
      {({ recommendations }) => (
        <>
          <AppText>{s.recommendations.subtitle}</AppText>
          {recommendations.map((item) => {
            const tone = TONES[item.tone];
            return (
              <Card
                key={item.key}
                tone={item.tone === 'best' ? 'selected' : 'plain'}
                style={styles.item}
              >
                <IconBadge icon={ICONS[item.key]} tone={tone} />
                <View style={styles.text}>
                  <AppText variant="subtitle" style={styles.title}>
                    {s.recommendations.items[item.key].title}
                  </AppText>
                  <AppText variant="caption">{detailFor(item)}</AppText>
                </View>
                <AppText style={[styles.tag, { color: badgeColor(tone) }]}>{tagFor(item)}</AppText>
              </Card>
            );
          })}
        </>
      )}
    </ResultDetail>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
  },
  tag: {
    maxWidth: 96,
    textAlign: 'right',
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
});
