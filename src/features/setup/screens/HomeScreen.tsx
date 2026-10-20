import { useRouter } from 'expo-router';
import { Broom, Drop, Plant, Toilet, WashingMachine, type Icon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { dailyDemandFor } from '@/data/calculations/simulation';
import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { WaterUse } from '@/data/store/projectTypes';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Stepper, Toggle } from '@/shared/components/Controls';
import ListRow from '@/shared/components/ListRow';
import { Notice } from '@/shared/components/Notice';
import { useI18n } from '@/shared/i18n';

import SetupScaffold from '../components/SetupScaffold';

const USES: { use: WaterUse; icon: Icon }[] = [
  { use: 'toilets', icon: Toilet },
  { use: 'laundry', icon: WashingMachine },
  { use: 'garden', icon: Plant },
  { use: 'cleaning', icon: Broom },
  { use: 'drinking', icon: Drop },
];

const MAX_PEOPLE = 12;

export default function HomeScreen() {
  const router = useRouter();
  const { s, fill, number } = useI18n();
  const { project } = useProjectStore();
  const { updateHousehold } = useProjectActions();
  const { household } = project;
  const dailyLitres = dailyDemandFor(household)(new Date().getMonth() + 1);

  return (
    <SetupScaffold
      title={s.home.title}
      step={2}
      actionLabel={s.common.continue}
      onAction={() => router.push('/setup/site')}
    >
      <Card style={styles.peopleCard}>
        <View style={styles.flex}>
          <AppText variant="subtitle">{s.home.people}</AppText>
          <AppText variant="caption">{s.home.peopleHint}</AppText>
        </View>
        <Stepper
          value={household.people}
          min={1}
          max={MAX_PEOPLE}
          label={s.home.people}
          onChange={(people) => updateHousehold({ people })}
        />
      </Card>

      <Card compact>
        <AppText variant="label" style={styles.label}>
          {s.home.usesLabel}
        </AppText>
        {USES.map(({ use, icon }, index) => (
          <ListRow
            key={use}
            isFirst={index === 0}
            icon={icon}
            iconTone={household.uses[use] ? 'blue' : 'sand'}
            title={s.home.uses[use]}
            subtitle={s.home.useHints[use]}
            right={
              <Toggle
                label={s.home.uses[use]}
                value={household.uses[use]}
                onChange={(value) => updateHousehold({ uses: { ...household.uses, [use]: value } })}
              />
            }
          />
        ))}
      </Card>

      {household.uses.drinking ? <Notice tone="warning" text={s.quality.drinkingInfo} /> : null}
      <AppText variant="caption" align="center">
        {fill(s.home.demand, { value: number(dailyLitres) })}
      </AppText>
    </SetupScaffold>
  );
}

const styles = StyleSheet.create({
  peopleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  label: {
    paddingTop: 10,
    paddingBottom: 4,
  },
});
