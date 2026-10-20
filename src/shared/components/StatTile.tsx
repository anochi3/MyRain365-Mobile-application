/** Small tile with a label, a big number and a hint; rows of two tiles. */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/global.styles';

import AppText from './AppText';
import { Tile, type CardTone } from './Card';

type Props = {
  label: string;
  value: string;
  hint?: string;
  color?: string;
  size?: 'large' | 'medium';
  tone?: CardTone;
};

export default function StatTile({
  label,
  value,
  hint,
  color = colors.primaryText,
  size = 'large',
  tone,
}: Props) {
  return (
    <Tile tone={tone}>
      <AppText variant="label">{label}</AppText>
      <AppText
        variant="stat"
        color={color}
        style={[styles.value, size === 'medium' && styles.medium]}
        numberOfLines={size === 'medium' ? 2 : 1}
      >
        {value}
      </AppText>
      {hint ? <AppText variant="caption">{hint}</AppText> : null}
    </Tile>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function StatRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  value: {
    marginTop: 2,
  },
  medium: {
    fontSize: 19,
    lineHeight: 24,
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
