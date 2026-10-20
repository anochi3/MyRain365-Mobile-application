import type { Icon } from 'phosphor-react-native';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radii } from '@/shared/global.styles';

import AppText from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
  icon?: Icon;
  iconPosition?: 'start' | 'end';
  isDisabled?: boolean;
  isLoading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon: IconComponent,
  iconPosition = 'start',
  isDisabled = false,
  isLoading = false,
  compact = false,
  style,
}: Props) {
  const color =
    variant === 'primary'
      ? colors.buttonText
      : variant === 'quiet'
        ? colors.primaryText
        : colors.buttons;
  const icon = IconComponent ? <IconComponent size={18} color={color} weight="bold" /> : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || isLoading}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {iconPosition === 'start' && icon}
          <AppText style={[styles.label, { color }]} numberOfLines={1}>
            {label}
          </AppText>
          {iconPosition === 'end' && icon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  compact: {
    height: 48,
  },
  primary: {
    backgroundColor: colors.buttons,
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: colors.buttons,
  },
  quiet: {
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
