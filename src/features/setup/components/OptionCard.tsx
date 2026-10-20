/** Large tappable card used as a radio button or a checkbox. */
import { Check, CheckCircle, Square, type Icon } from 'phosphor-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/shared/components/AppText';
import IconBadge from '@/shared/components/IconBadge';
import { colors, radii } from '@/shared/global.styles';

type Props = {
  title: string;
  hint?: string;
  icon?: Icon;
  isSelected: boolean;
  onPress: () => void;
  mode?: 'radio' | 'checkbox';
};

export default function OptionCard({
  title,
  hint,
  icon,
  isSelected,
  onPress,
  mode = 'radio',
}: Props) {
  const indicator =
    mode === 'radio' ? (
      isSelected ? (
        <CheckCircle size={24} weight="fill" color={colors.teal} />
      ) : (
        <View style={styles.radio} />
      )
    ) : isSelected ? (
      <View style={styles.checkbox}>
        <Check size={14} weight="bold" color={colors.buttonText} />
      </View>
    ) : (
      <Square size={24} color={colors.cardBorder} />
    );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={mode}
      accessibilityState={{ checked: isSelected }}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <IconBadge icon={icon} tone={isSelected ? 'card' : 'sand'} weight="regular" /> : null}
      <View style={styles.text}>
        <AppText variant="subtitle" style={styles.title}>
          {title}
        </AppText>
        {hint ? <AppText variant="caption">{hint}</AppText> : null}
      </View>
      {indicator}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBackground,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.teal,
    backgroundColor: colors.greenBackground,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
  },
  radio: {
    width: 22,
    height: 22,
    margin: 1,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
  },
});
