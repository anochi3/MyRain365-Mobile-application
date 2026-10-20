import type { Range, Rating } from '@/data/calculations/finance';
import { colors } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

const MAX_SHOWN_YEARS = 100;

export const ratingColor = (rating: Rating) =>
  rating === 'good' ? colors.green : rating === 'fair' ? colors.buttons : colors.warningTitle;

export function useResultFormat() {
  const i18n = useI18n();
  const { s, fill, number } = i18n;

  const percent = (fraction: number) => fill(s.common.percent, { value: number(fraction * 100) });
  const euros = (value: number) => fill(s.common.euros, { value: number(value) });
  const euroRange = ([low, high]: Range, digits = 0) =>
    fill(s.common.euroRange, { low: number(low, digits), high: number(high, digits) });
  const m3 = (value: number, digits = 0) =>
    fill(s.common.cubicMetres, { value: number(value, digits) });
  const litres = (value: number) => fill(s.common.litres, { value: number(value) });

  const years = ([low, high]: Range) => {
    if (!Number.isFinite(low) || low > MAX_SHOWN_YEARS) return s.common.never;
    if (!Number.isFinite(high) || high > MAX_SHOWN_YEARS)
      return fill(s.common.yearsPlus, { value: number(low) });
    return fill(s.common.yearRange, { low: number(low), high: number(high) });
  };

  const rating = (value: Rating) => s.common[value];
  const compactEuros = (value: number) =>
    value >= 1000 ? fill(s.common.thousandEuros, { value: number(value / 1000, 1) }) : euros(value);
  const thousands = (value: number) =>
    `${value < 0 ? '−' : '+'}${fill(s.common.thousandEuros, { value: number(Math.abs(value) / 1000, 1) })}`;

  return { ...i18n, percent, euros, euroRange, m3, litres, years, rating, thousands, compactEuros };
}
