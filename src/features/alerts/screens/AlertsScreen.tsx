import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { Segmented } from '@/shared/components/Controls';
import IconBadge from '@/shared/components/IconBadge';
import { StateMessage } from '@/shared/components/Notice';
import Screen from '@/shared/components/Screen';
import { useI18n } from '@/shared/i18n';

import { useAlerts, type AlertCategory } from '../hooks/useAlerts';

type Filter = 'all' | AlertCategory;

export default function AlertsScreen() {
  const { s } = useI18n();
  const alerts = useAlerts();
  const [filter, setFilter] = useState<Filter>('all');
  const visible = alerts.filter((alert) => filter === 'all' || alert.category === filter);

  return (
    <Screen title={s.alerts.title} hasTabBar info="alerts">
      <Segmented
        options={(['all', 'weather', 'tank', 'couree'] as Filter[]).map((value) => ({
          value,
          label: s.alerts.filters[value],
        }))}
        value={filter}
        onChange={setFilter}
      />
      {visible.length === 0 ? <StateMessage title={s.alerts.empty} /> : null}
      {visible.map((alert) => (
        <Card key={alert.id} style={styles.alert}>
          <IconBadge icon={alert.icon} tone={alert.tone} />
          <View style={styles.text}>
            <View style={styles.header}>
              <AppText variant="subtitle" style={styles.title}>
                {alert.title}
              </AppText>
              {alert.when ? <AppText variant="caption">{alert.when}</AppText> : null}
            </View>
            <AppText style={styles.detail}>{alert.detail}</AppText>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
  },
  detail: {
    fontSize: 13,
    lineHeight: 18,
  },
});
