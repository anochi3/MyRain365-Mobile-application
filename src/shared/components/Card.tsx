import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radii } from '@/shared/global.styles';

export type CardTone = 'plain' | 'selected' | 'accent' | 'warning' | 'info' | 'sand';

type Props = ViewProps & {
  tone?: CardTone;
  compact?: boolean;
};

const TONES: Record<
  CardTone,
  { backgroundColor: string; borderColor: string; borderWidth: number }
> = {
  plain: { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, borderWidth: 1 },
  selected: { backgroundColor: colors.cardBackground, borderColor: colors.teal, borderWidth: 2 },
  accent: { backgroundColor: colors.cardBackground, borderColor: colors.buttons, borderWidth: 2 },
  warning: {
    backgroundColor: colors.warningBackground,
    borderColor: colors.warningBorder,
    borderWidth: 1,
  },
  info: { backgroundColor: colors.blueSoft, borderColor: colors.blueBorder, borderWidth: 1 },
  sand: { backgroundColor: colors.inactiveTab, borderColor: colors.inactiveTab, borderWidth: 1 },
};

export default function Card({ tone = 'plain', compact = false, style, ...props }: Props) {
  return <View {...props} style={[styles.card, compact && styles.compact, TONES[tone], style]} />;
}

export function Tile({ tone = 'plain', style, ...props }: Props) {
  return <View {...props} style={[styles.tile, TONES[tone], style]} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: 16,
  },
  compact: {
    paddingVertical: 4,
  },
  tile: {
    flex: 1,
    borderRadius: radii.tile,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
