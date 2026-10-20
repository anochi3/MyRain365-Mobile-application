import { useRouter, type Href } from 'expo-router';
import { Buildings, Drop, HouseLine, MapPin, UsersThree, type Icon } from 'phosphor-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { activeUses } from '@/data/calculations/simulation';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import IconBadge from '@/shared/components/IconBadge';
import { colors, fonts } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

import SetupScaffold from '../components/SetupScaffold';

type ReviewItem = {
  icon: Icon;
  title: string;
  value: string;
  href: Href;
};

export default function ReviewScreen() {
  const router = useRouter();
  const { s, fill, number } = useI18n();
  const { project } = useProjectStore();
  const { building, roof, household, site, quality } = project;

  const uses = activeUses(household)
    .map((use) => s.home.uses[use].toLowerCase())
    .join(', ');
  const siteValue = [
    site.kind === 'shared' ? s.site.shared : s.site.private,
    site.isCouree ? s.site.couree.toLowerCase() : null,
    s.site.spaces[site.tankSpace].toLowerCase(),
  ]
    .filter(Boolean)
    .join(', ');

  const items: ReviewItem[] = [
    { icon: MapPin, title: s.review.location, value: building?.address ?? '', href: '/building' },
    {
      icon: HouseLine,
      title: s.review.roof,
      value: fill(s.review.roofValue, {
        area: number(roof.areaM2),
        material: s.roof.materials[roof.material].toLowerCase(),
      }),
      href: '/setup/roof',
    },
    {
      icon: UsersThree,
      title: s.review.household,
      value: fill(s.review.householdValue, { people: household.people, uses }),
      href: '/setup/home',
    },
    { icon: Buildings, title: s.review.site, value: siteValue, href: '/setup/site' },
    {
      icon: Drop,
      title: s.review.quality,
      value: fill(s.review.qualityValue, {
        condition: s.quality.conditions[quality.roofCondition].toLowerCase(),
      }),
      href: '/setup/quality',
    },
  ];

  return (
    <SetupScaffold
      title={s.review.title}
      step={5}
      actionLabel={s.review.run}
      onAction={() => router.push('/setup/analysing')}
    >
      <AppText>{s.review.subtitle}</AppText>
      {items.map((item) => (
        <Card key={item.title} style={styles.item}>
          <IconBadge icon={item.icon} tone="blue" />
          <View style={styles.text}>
            <AppText variant="subtitle" style={styles.title}>
              {item.title}
            </AppText>
            <AppText variant="caption">{item.value}</AppText>
          </View>
          <Pressable onPress={() => router.push(item.href)} hitSlop={10} accessibilityRole="button">
            <AppText style={styles.edit}>{s.common.edit}</AppText>
          </Pressable>
        </Card>
      ))}
    </SetupScaffold>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
  },
  edit: {
    fontFamily: fonts.semibold,
    color: colors.buttons,
  },
});
