import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

import AppText from './AppText';
import InfoButton, { type InfoTopic } from './InfoButton';
import LanguageToggle from './LanguageToggle';

type Props = {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  hasTabBar?: boolean;
  info?: InfoTopic;
};

export default function Screen({
  title,
  showBack = false,
  right,
  footer,
  children,
  scroll = true,
  hasTabBar = false,
  info,
}: Props) {
  const router = useRouter();
  const { s } = useI18n();
  const edges = hasTabBar ? (['top'] as const) : (['top', 'bottom'] as const);

  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {title ? (
        <View style={styles.appBar}>
          <View style={styles.titleRow}>
            {showBack && (
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                accessibilityRole="button"
                accessibilityLabel={s.common.back}
                hitSlop={6}
                style={styles.iconButton}
              >
                <CaretLeft size={20} color={colors.primaryText} />
              </Pressable>
            )}
            <AppText variant="title" numberOfLines={1} style={styles.title}>
              {title}
            </AppText>
            {info ? <InfoButton topic={info} size={20} /> : null}
          </View>
          {right ?? <LanguageToggle />}
        </View>
      ) : null}

      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.body]}>{children}</View>
      )}

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
}: {
  icon: ReactNode;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={styles.iconButton}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: spacing.screen,
    paddingTop: 4,
    paddingBottom: 10,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flexShrink: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingTop: 2,
    paddingBottom: 24,
    gap: spacing.gap,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
    backgroundColor: colors.background,
  },
});
