/** Step 3: private or shared site, courée, and where a tank could go. */
import { useRouter } from 'expo-router';
import { ArrowLineDown, Buildings, Cylinder, Prohibit, type Icon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { TankSpace } from '@/data/store/projectTypes';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Segmented, Stepper, Toggle } from '@/shared/components/Controls';
import IconBadge from '@/shared/components/IconBadge';
import { colors } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

import OptionCard from '../components/OptionCard';
import SetupScaffold from '../components/SetupScaffold';

const SPACES: { space: TankSpace; icon: Icon }[] = [
  { space: 'buried', icon: ArrowLineDown },
  { space: 'wall', icon: Cylinder },
  { space: 'none', icon: Prohibit },
];

const MIN_SHARED_HOMES = 2;
const MAX_SHARED_HOMES = 40;

export default function SiteScreen() {
  const router = useRouter();
  const { s } = useI18n();
  const { project } = useProjectStore();
  const { updateSite } = useProjectActions();
  const { site } = project;

  return (
    <SetupScaffold
      title={s.site.title}
      step={3}
      actionLabel={s.common.continue}
      onAction={() => router.push('/setup/quality')}
    >
      <AppText variant="label">{s.site.where}</AppText>
      <Segmented
        options={[
          { value: 'private', label: s.site.private },
          { value: 'shared', label: s.site.shared },
        ]}
        value={site.kind}
        onChange={(kind) => updateSite({ kind })}
      />
      {site.kind === 'shared' ? <AppText variant="caption">{s.site.sharedHint}</AppText> : null}

      <Card style={styles.couree}>
        <View style={styles.row}>
          <IconBadge icon={Buildings} tone="brick" />
          <View style={styles.flex}>
            <AppText variant="subtitle">{s.site.couree}</AppText>
            <AppText variant="caption">{s.site.coureeHint}</AppText>
          </View>
          <Toggle
            label={s.site.couree}
            value={site.isCouree}
            onChange={(isCouree) => updateSite({ isCouree })}
          />
        </View>
        {site.isCouree || site.kind === 'shared' ? (
          <View style={[styles.row, styles.homes]}>
            <AppText variant="label" style={styles.flex}>
              {s.site.homes}
            </AppText>
            <Stepper
              value={site.sharedHomes}
              min={MIN_SHARED_HOMES}
              max={MAX_SHARED_HOMES}
              label={s.site.homes}
              onChange={(sharedHomes) => updateSite({ sharedHomes })}
            />
          </View>
        ) : null}
      </Card>

      <AppText variant="label" style={styles.sectionLabel}>
        {s.site.space}
      </AppText>
      {SPACES.map(({ space, icon }) => (
        <OptionCard
          key={space}
          icon={icon}
          title={s.site.spaces[space]}
          hint={s.site.spaceHints[space]}
          isSelected={site.tankSpace === space}
          onPress={() => updateSite({ tankSpace: space })}
        />
      ))}
    </SetupScaffold>
  );
}

const styles = StyleSheet.create({
  couree: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  homes: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  sectionLabel: {
    marginTop: 6,
  },
});
