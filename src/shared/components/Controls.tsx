import { Check, Minus, Plus } from 'phosphor-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radii, shadows } from '@/shared/global.styles';

import AppText from './AppText';

type ChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export function Chip({ label, isSelected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      style={[styles.chip, isSelected && styles.chipSelected]}
    >
      {isSelected && <Check size={14} weight="bold" color={colors.green} />}
      <AppText style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{label}</AppText>
    </Pressable>
  );
}

type SegmentedProps<T extends string | number> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <AppText
              numberOfLines={1}
              style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={[styles.toggle, value && styles.toggleOn]}
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

type StepperProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
};

export function Stepper({ value, min, max, onChange, label }: StepperProps) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel={`${label} -1`}
        style={[styles.stepButton, value <= min && styles.stepDisabled]}
      >
        <Minus size={18} weight="bold" color={colors.primaryText} />
      </Pressable>
      <AppText variant="number" style={styles.stepValue} accessibilityLabel={`${label} ${value}`}>
        {value}
      </AppText>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel={`${label} +1`}
        style={[styles.stepButton, styles.stepButtonPrimary, value >= max && styles.stepDisabled]}
      >
        <Plus size={18} weight="bold" color={colors.buttonText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.greenBackground,
  },
  chipLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primaryText,
  },
  chipLabelSelected: {
    fontFamily: fonts.semibold,
    color: colors.green,
  },
  segmented: {
    flexDirection: 'row',
    height: 44,
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.inactiveTab,
  },
  segment: {
    flex: 1,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentActive: {
    backgroundColor: colors.cardBackground,
    ...shadows.raised,
  },
  segmentLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.secondaryText,
  },
  segmentLabelActive: {
    fontFamily: fonts.semibold,
    color: colors.primaryText,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.cardBorder,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: colors.teal,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.buttonText,
    ...shadows.raised,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonPrimary: {
    backgroundColor: colors.buttons,
    borderColor: colors.buttons,
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepValue: {
    minWidth: 26,
    textAlign: 'center',
  },
});
