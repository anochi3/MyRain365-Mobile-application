import { useRouter } from 'expo-router';
import { Bell, CurrencyEur, HouseLine, Info, ShieldCheck, Translate } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { Preferences } from '@/data/store/projectTypes';
import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import { Toggle } from '@/shared/components/Controls';
import IconBadge from '@/shared/components/IconBadge';
import LanguageToggle from '@/shared/components/LanguageToggle';
import ListRow from '@/shared/components/ListRow';
import Screen from '@/shared/components/Screen';
import { useI18n } from '@/shared/i18n';

type NotificationType = keyof Preferences['notifications'];

const NOTIFICATION_TYPES: NotificationType[] = ['weather', 'tank', 'maintenance', 'neighbours'];

export default function SettingsScreen() {
  const router = useRouter();
  const { s, fill, number } = useI18n();
  const { project, preferences } = useProjectStore();
  const { updatePreferences, reset } = useProjectActions();
  const { building, household, roof, site } = project;

  const restart = () => {
    reset();
    router.replace('/welcome');
  };

  return (
    <Screen title={s.settings.title} hasTabBar right={<LanguageToggle />}>
      {building ? (
        <Card style={styles.home}>
          <IconBadge icon={HouseLine} tone="blue" size={48} round />
          <View style={styles.flex}>
            <AppText variant="subtitle">{building.address}</AppText>
            <AppText variant="caption">
              {fill(s.settings.homeValue, { people: household.people, area: number(roof.areaM2) })}
              {site.isCouree ? `, ${s.site.couree.toLowerCase()}` : ''}
            </AppText>
          </View>
        </Card>
      ) : null}

      <Card compact>
        <ListRow
          isFirst
          icon={Translate}
          title={s.settings.language}
          subtitle={s.settings.languageValue}
        />
        <ListRow
          icon={HouseLine}
          title={s.settings.home}
          subtitle={fill(s.settings.homeValue, {
            people: household.people,
            area: number(roof.areaM2),
          })}
          onPress={() => router.push('/setup/review')}
        />
        <ListRow
          icon={CurrencyEur}
          title={s.settings.price}
          subtitle={s.settings.priceHint}
          right={
            <Toggle
              label={s.settings.price}
              value={preferences.includeSewerCharge}
              onChange={(includeSewerCharge) => updatePreferences({ includeSewerCharge })}
            />
          }
        />
        <ListRow icon={ShieldCheck} title={s.settings.privacy} subtitle={s.settings.privacyValue} />
        <ListRow
          icon={Info}
          title={s.settings.sources}
          subtitle={s.settings.sourcesValue}
          onPress={() => router.push('/results/data')}
        />
      </Card>

      <AppText variant="label">{s.settings.notifications}</AppText>
      <Card compact>
        {NOTIFICATION_TYPES.map((type, index) => (
          <ListRow
            key={type}
            isFirst={index === 0}
            icon={Bell}
            iconTone="sand"
            title={s.settings.notificationTypes[type]}
            right={
              <Toggle
                label={s.settings.notificationTypes[type]}
                value={preferences.notifications[type]}
                onChange={(value) =>
                  updatePreferences({
                    notifications: { ...preferences.notifications, [type]: value },
                  })
                }
              />
            }
          />
        ))}
      </Card>

      <Button label={s.settings.restart} variant="quiet" onPress={restart} />
      <AppText variant="caption" align="center">
        {s.settings.footer}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  home: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
});
