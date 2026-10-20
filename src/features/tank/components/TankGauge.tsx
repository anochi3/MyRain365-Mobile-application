/** Drawing of a tank filled to the current level. */
import { StyleSheet, View } from 'react-native';

import { colors } from '@/shared/global.styles';

type Props = {
  fill: number;
  label: string;
};

export default function TankGauge({ fill, label }: Props) {
  const clamped = Math.max(0, Math.min(1, fill));
  return (
    <View style={styles.tank} accessibilityLabel={label}>
      <View style={[styles.water, { height: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tank: {
    width: 92,
    height: 168,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.buttons,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.cardBackground,
  },
  water: {
    width: '100%',
    backgroundColor: colors.teal,
  },
});
