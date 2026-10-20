import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import Screen from '@/shared/components/Screen';
import { colors, radii } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

export const SETUP_STEPS = 5;

type Props = {
  title: string;
  step: number;
  actionLabel: string;
  onAction: () => void;
  isActionDisabled?: boolean;
  children: ReactNode;
};

export default function SetupScaffold({
  title,
  step,
  actionLabel,
  onAction,
  isActionDisabled,
  children,
}: Props) {
  const { s, fill } = useI18n();

  return (
    <Screen
      title={title}
      showBack
      footer={<Button label={actionLabel} onPress={onAction} isDisabled={isActionDisabled} />}
    >
      <View
        style={styles.progress}
        accessibilityLabel={fill(s.setup.step, { current: step, total: SETUP_STEPS })}
      >
        {Array.from({ length: SETUP_STEPS }, (_, index) => (
          <View key={index} style={[styles.segment, index < step && styles.segmentDone]} />
        ))}
      </View>
      <AppText variant="caption">
        {fill(s.setup.step, { current: step, total: SETUP_STEPS })}
      </AppText>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.inactiveTab,
  },
  segmentDone: {
    backgroundColor: colors.teal,
  },
});
