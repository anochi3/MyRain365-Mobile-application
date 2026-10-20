import { CaretRight, type Icon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/shared/global.styles';

import AppText from './AppText';
import IconBadge, { type BadgeTone } from './IconBadge';

type Props = {
  title: string;
  subtitle?: string;
  icon?: Icon;
  iconTone?: BadgeTone;
  right?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  isFirst?: boolean;
};

export default function ListRow({
  title,
  subtitle,
  icon,
  iconTone = 'blue',
  right,
  onPress,
  showChevron = Boolean(onPress),
  isFirst = false,
}: Props) {
  const content = (
    <>
      {icon && <IconBadge icon={icon} tone={iconTone} weight="regular" />}
      <View style={styles.text}>
        <AppText variant="subtitle" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </View>
      {right}
      {showChevron && <CaretRight size={18} color={colors.secondaryText} />}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, !isFirst && styles.divider]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, !isFirst && styles.divider, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    minHeight: 52,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
  },
});
