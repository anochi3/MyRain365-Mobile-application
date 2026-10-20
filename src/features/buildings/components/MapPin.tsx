import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '@/shared/global.styles';

const PIN_SIZE = 48;
const PIN_TIP_OFFSET = 4;
const LIFT_HEIGHT = 14;

type Props = {
  isLifted: boolean;
};

export default function MapPin({ isLifted }: Props) {
  const [lift] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(lift, {
      toValue: isLifted ? 1 : 0,
      useNativeDriver: true,
      speed: isLifted ? 40 : 14,
      bounciness: isLifted ? 0 : 12,
    }).start();
  }, [isLifted, lift]);

  const translateY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -LIFT_HEIGHT] });
  const shadowScale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.shadow, { transform: [{ scaleX: shadowScale }] }]} />
      <Animated.View style={[styles.pin, { transform: [{ translateY }] }]}>
        <Ionicons name="location" size={PIN_SIZE} color={colors.warningTitle} style={styles.icon} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: PIN_SIZE,
    height: PIN_SIZE,
    marginLeft: -PIN_SIZE / 2,
    marginTop: -PIN_SIZE + PIN_TIP_OFFSET,
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  shadow: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 14,
    height: 5,
    marginLeft: -7,
    marginTop: -2.5,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
});
