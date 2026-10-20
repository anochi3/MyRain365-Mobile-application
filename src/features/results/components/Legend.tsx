import { StyleSheet, View } from 'react-native';

import AppText from '@/shared/components/AppText';

export type LegendItem = {
  label: string;
  color: string;
  shape: 'box' | 'line';
};

export default function Legend({ items }: { items: LegendItem[] }) {
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View
            style={[
              styles.swatch,
              item.shape === 'line' && styles.line,
              { backgroundColor: item.color },
            ]}
          />
          <AppText variant="caption">{item.label}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  line: {
    height: 3,
  },
});
