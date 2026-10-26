import { useRouter } from 'expo-router';
import { Info, Lifebuoy } from 'phosphor-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTankStatus, type TankStatus } from '@/data/hooks/useTankStatus';
import { waterPrice } from '@/data/calculations/finance';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Card from '@/shared/components/Card';
import { StateMessage } from '@/shared/components/Notice';
import Screen from '@/shared/components/Screen';
import StatTile, { StatRow } from '@/shared/components/StatTile';
import WeatherIcon from '@/shared/components/WeatherIcon';
import { colors, radii } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

import TankGauge from '../components/TankGauge';

export default function TankScreen() {
  const router = useRouter();
  const { s } = useI18n();
  const state = useTankStatus();

  return (
    <Screen title={s.tank.title} hasTabBar info="tankStatus">
      {state.status === 'missing' ? (
        <StateMessage
          title={s.common.noBuilding}
          hint={s.common.noBuildingHint}
          actionLabel={s.common.findBuilding}
          onAction={() => router.push('/building')}
        />
      ) : state.status === 'loading' ? (
        <StateMessage title={s.common.loading} isLoading />
      ) : state.status === 'error' ? (
        <StateMessage title={s.common.offline} hint={s.common.offlineHint} />
      ) : (
        <TankContent tank={state.tank} />
      )}
    </Screen>
  );
}

function TankContent({ tank }: { tank: TankStatus }) {
  const router = useRouter();
  const { s, fill, number, date } = useI18n();
  const { preferences } = useProjectStore();
  const weekday = (iso: string) => date(iso, { weekday: 'short' });

  const advice = tank.overflowDay
    ? {
        title: fill(s.tank.adviceOverflow, {
          value: number(Math.ceil(tank.overflowExpectedL / 50) * 50),
          day: date(tank.overflowDay, { weekday: 'long' }),
        }),
        text: s.tank.adviceOverflowHint,
        color: colors.buttons,
      }
    : tank.isLow
      ? { title: s.tank.adviceLow, text: s.tank.adviceLowHint, color: colors.warningTitle }
      : { title: s.tank.adviceFine, text: s.tank.adviceFineHint, color: colors.teal };

  return (
    <>
      <Card style={styles.levelCard}>
        <TankGauge fill={tank.fill} label={`${Math.round(tank.fill * 100)}%`} />
        <View style={styles.levelText}>
          <AppText variant="label">{s.tank.now}</AppText>
          <AppText variant="number" style={styles.levelValue}>
            {fill(s.common.litres, { value: number(tank.levelL) })}
          </AppText>
          <AppText>
            {fill(s.tank.ofCapacity, {
              value: number(tank.fill * 100),
              capacity: number(tank.capacityL),
            })}
          </AppText>
          <View style={styles.estimate}>
            <Info size={14} color={colors.secondaryText} />
            <AppText variant="caption">{s.tank.estimated}</AppText>
          </View>
        </View>
      </Card>

      <Card style={styles.forecastCard}>
        <AppText variant="label">{s.tank.nextDays}</AppText>
        <View style={styles.forecast}>
          {tank.forecast.map((day, index) => (
            <View key={day.date} style={[styles.day, index === 0 && styles.today]}>
              <AppText variant="caption">{weekday(day.date)}</AppText>
              <WeatherIcon code={day.weatherCode} />
              <AppText variant="subtitle" style={styles.dayValue}>
                {`${number(day.mm, day.mm < 10 ? 1 : 0)} mm`}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <Card style={[styles.advice, { borderLeftColor: advice.color }]}>
        <AppText variant="subtitle">{advice.title}</AppText>
        <AppText>{advice.text}</AppText>
      </Card>

      <StatRow>
        <StatTile
          label={s.tank.saved}
          value={fill(s.common.euros, {
            value: number(tank.savedThisMonthM3 * waterPrice(preferences.includeSewerCharge)),
          })}
          color={colors.green}
        />
        <StatTile
          label={s.tank.avoided}
          value={fill(s.common.cubicMetres, { value: number(tank.savedThisMonthM3, 1) })}
        />
      </StatRow>

      <Pressable onPress={() => router.push('/results/water-cut')} accessibilityRole="button">
        <Card tone="info" style={styles.waterCut}>
          <Lifebuoy size={24} weight="fill" color={colors.buttons} />
          <View style={styles.levelText}>
            <AppText variant="label" color={colors.primaryText}>
              {s.tank.waterCut}
            </AppText>
            <AppText variant="subtitle" color={colors.buttons}>
              {fill(s.tank.waterCutValue, { value: number(tank.waterCut.autonomyDays, 1) })}
            </AppText>
          </View>
        </Card>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 18,
  },
  levelText: {
    flex: 1,
    gap: 4,
  },
  levelValue: {
    fontSize: 36,
    lineHeight: 40,
  },
  estimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  forecastCard: {
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  forecast: {
    flexDirection: 'row',
    gap: 8,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    padding: 10,
    borderRadius: radii.tile,
    backgroundColor: colors.inactiveTab,
  },
  today: {
    backgroundColor: colors.blueSoft,
  },
  dayValue: {
    fontSize: 14,
  },
  advice: {
    gap: 4,
    borderLeftWidth: 5,
  },
  waterCut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
