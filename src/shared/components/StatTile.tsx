import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/global.styles';

import AppText from './AppText';
import { Tile, type CardTone } from './Card';
import InfoButton, { type InfoTopic } from './InfoButton';

type Props = {
  label: string;
  value: string;
  hint?: string;
  color?: string;
  size?: 'large' | 'medium';
  tone?: CardTone;
  info?: InfoTopic;
};

export default function StatTile({
  label,
  value,
  hint,
  color = colors.primaryText,
  size = 'large',
  tone,
  info,
}: Props) {
  return (
    <Tile tone={tone}>
      <View style={styles.labelRow}>
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
        {info ? <InfoButton topic={info} size={15} /> : null}
      </View>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    flexShrink: 1,
  },
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
