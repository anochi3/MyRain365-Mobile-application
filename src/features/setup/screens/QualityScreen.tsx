import { useRouter } from 'expo-router';
import { Drop, HandTap, Wheelchair, Wrench, UsersThree, type Icon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { AccessNeed, PollutionSource, RoofCondition } from '@/data/store/projectTypes';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Chip } from '@/shared/components/Controls';
import IconBadge from '@/shared/components/IconBadge';
import { Notice } from '@/shared/components/Notice';
import { colors } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

import OptionCard from '../components/OptionCard';
import SetupScaffold from '../components/SetupScaffold';

const CONDITIONS: RoofCondition[] = ['good', 'average', 'poor'];
const POLLUTIONS: PollutionSource[] = ['none', 'traffic', 'industry', 'agriculture'];
const ACCESS_NEEDS: { need: AccessNeed; icon: Icon }[] = [
  { need: 'stepFreeAccess', icon: Wheelchair },
  { need: 'easyTap', icon: HandTap },
  { need: 'lightMaintenance', icon: Wrench },
  { need: 'helpNeeded', icon: UsersThree },
];

export default function QualityScreen() {
  const router = useRouter();
  const { s } = useI18n();
  const { project } = useProjectStore();
  const { updateQuality, toggleAccess } = useProjectActions();
  const { quality, access } = project;

  return (
    <SetupScaffold
      title={s.quality.title}
      step={4}
      actionLabel={s.common.continue}
      onAction={() => router.push('/setup/review')}
    >
      <AppText variant="label">{s.quality.intendedUse}</AppText>
      <Card tone="selected" style={styles.useCard}>
        <IconBadge icon={Drop} tone="teal" />
        <View style={styles.flex}>
          <AppText variant="subtitle">{s.quality.nonPotable}</AppText>
          <AppText variant="caption">{s.quality.nonPotableHint}</AppText>
        </View>
      </Card>
      <Notice text={s.quality.drinkingInfo} />

      <Card style={styles.section}>
        <AppText variant="label">{s.quality.condition}</AppText>
        <View style={styles.chips}>
          {CONDITIONS.map((condition) => (
            <Chip
              key={condition}
              label={s.quality.conditions[condition]}
              isSelected={quality.roofCondition === condition}
              onPress={() => updateQuality({ roofCondition: condition })}
            />
          ))}
        </View>
        <AppText variant="label" style={styles.secondLabel}>
          {s.quality.pollution}
        </AppText>
        <View style={styles.chips}>
          {POLLUTIONS.map((pollution) => (
            <Chip
              key={pollution}
              label={s.quality.pollutions[pollution]}
              isSelected={quality.pollution === pollution}
              onPress={() => updateQuality({ pollution })}
            />
          ))}
        </View>
      </Card>

      <AppText variant="label" style={styles.secondLabel}>
        {s.quality.access}
      </AppText>
      {ACCESS_NEEDS.map(({ need, icon }) => (
        <OptionCard
          key={need}
          mode="checkbox"
          icon={icon}
          title={s.quality.accessNeeds[need]}
          isSelected={access.includes(need)}
          onPress={() => toggleAccess(need)}
        />
      ))}
      <AppText variant="caption">{s.quality.accessHint}</AppText>
    </SetupScaffold>
  );
}

const styles = StyleSheet.create({
  useCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.greenBackground,
  },
  flex: {
    flex: 1,
  },
  section: {
    gap: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondLabel: {
    marginTop: 6,
  },
});
