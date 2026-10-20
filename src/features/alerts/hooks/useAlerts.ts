/** Builds the alert list from the forecast, the tank estimate, the upkeep calendar and the settings. */
import {
  CloudRain,
  CurrencyEur,
  DropHalfBottom,
  Funnel,
  Lifebuoy,
  UsersThree,
  type Icon,
} from 'phosphor-react-native';

import { waterPrice } from '@/data/calculations/finance';
import { useTankStatus } from '@/data/hooks/useTankStatus';
import { useProjectStore } from '@/data/store/ProjectProvider';
import type { BadgeTone } from '@/shared/components/IconBadge';
import { useI18n } from '@/shared/i18n';

export type AlertCategory = 'weather' | 'tank' | 'couree';

export type AppAlert = {
  id: string;
  category: AlertCategory;
  icon: Icon;
  tone: BadgeTone;
  title: string;
  detail: string;
  when: string;
};

// 10 mm or more in a day counts as heavy rain.
const HEAVY_RAIN_MM = 10;
// Warn when the tank would not cover three days of a water cut.
const WATER_CUT_COMFORT_DAYS = 3;
// The gutter filter should be cleaned every six months.
const FILTER_INTERVAL_MONTHS = 6;

/** Whole months between a date and today. */
const monthsBetween = (from: string, to: Date) =>
  (to.getFullYear() - Number(from.slice(0, 4))) * 12 + to.getMonth() + 1 - Number(from.slice(5, 7));

export function useAlerts(): AppAlert[] {
  const { s, fill, number, date } = useI18n();
  const { project, preferences } = useProjectStore();
  const tankState = useTankStatus();
  const alerts: AppAlert[] = [];
  const today = new Date();
  const notify = preferences.notifications;

  if (tankState.status === 'ready') {
    const { tank } = tankState;
    const heavy = tank.forecast.find((day) => day.mm >= HEAVY_RAIN_MM);
    if (heavy && notify.weather) {
      const isTomorrow = tank.forecast.indexOf(heavy) === 1;
      alerts.push({
        id: `rain-${heavy.date}`,
        category: 'weather',
        icon: CloudRain,
        tone: 'blue',
        title: fill(s.alerts.heavyRain.title, {
          day: isTomorrow ? s.alerts.tomorrow : date(heavy.date, { weekday: 'long' }),
        }),
        detail: fill(s.alerts.heavyRain.detail, { value: number(heavy.mm) }),
        when: s.alerts.today,
      });
    }
    if (tank.overflowDay && notify.tank) {
      alerts.push({
        id: `overflow-${tank.overflowDay}`,
        category: 'tank',
        icon: DropHalfBottom,
        tone: 'blue',
        title: s.alerts.overflow.title,
        detail: fill(s.alerts.overflow.detail, {
          value: number(Math.ceil(tank.overflowExpectedL / 50) * 50),
          day: date(tank.overflowDay, { weekday: 'long' }),
        }),
        when: s.alerts.today,
      });
    }
    if (tank.isLow && notify.tank) {
      alerts.push({
        id: 'low',
        category: 'tank',
        icon: DropHalfBottom,
        tone: 'brick',
        title: s.alerts.low.title,
        detail: fill(s.alerts.low.detail, { value: number(tank.levelL) }),
        when: s.alerts.today,
      });
    }
    if (tank.waterCut.autonomyDays < WATER_CUT_COMFORT_DAYS && notify.tank) {
      alerts.push({
        id: 'water-cut',
        category: 'tank',
        icon: Lifebuoy,
        tone: 'brick',
        title: s.alerts.waterCut.title,
        detail: fill(s.alerts.waterCut.detail, { value: number(tank.waterCut.autonomyDays, 1) }),
        when: s.alerts.today,
      });
    }
  }

  if (
    notify.maintenance &&
    project.installedOn &&
    monthsBetween(project.installedOn, today) % FILTER_INTERVAL_MONTHS === 0
  ) {
    alerts.push({
      id: 'filter',
      category: 'tank',
      icon: Funnel,
      tone: 'teal',
      title: s.alerts.filter.title,
      detail: s.alerts.filter.detail,
      when: date(project.installedOn, { day: 'numeric', month: 'short' }),
    });
  }

  alerts.push({
    id: 'price',
    category: 'tank',
    icon: CurrencyEur,
    tone: 'sand',
    title: fill(s.alerts.price.title, { year: today.getFullYear() }),
    detail: fill(s.alerts.price.detail, {
      value: number(waterPrice(preferences.includeSewerCharge), 2),
    }),
    when: '',
  });

  if (notify.neighbours && (project.site.isCouree || project.site.kind === 'shared')) {
    alerts.push({
      id: 'couree',
      category: 'couree',
      icon: UsersThree,
      tone: 'teal',
      title: s.alerts.neighbours.title,
      detail: s.alerts.neighbours.detail,
      when: '',
    });
  }

  return alerts;
}
