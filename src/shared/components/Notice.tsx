import { Info, WarningCircle, type Icon } from 'phosphor-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/shared/global.styles';

import AppText from './AppText';
import Button from './Button';
import Card from './Card';

type NoticeProps = {
  text: string;
  tone?: 'info' | 'warning';
  icon?: Icon;
};

export function Notice({ text, tone = 'info', icon }: NoticeProps) {
  const IconComponent = icon ?? (tone === 'info' ? Info : WarningCircle);
  const color = tone === 'info' ? colors.buttons : colors.warningTitle;
  return (
    <Card tone={tone} style={styles.notice}>
      <IconComponent size={22} weight="fill" color={color} />
      <AppText style={styles.noticeText} color={colors.primaryText}>
        {text}
      </AppText>
    </Card>
  );
}

type StateProps = {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
};

export function StateMessage({
  title,
  hint,
  actionLabel,
  onAction,
  isLoading = false,
}: StateProps) {
  return (
    <View style={styles.state}>
      {isLoading && <ActivityIndicator color={colors.buttons} />}
      <AppText variant="subtitle" align="center">
        {title}
      </AppText>
      {hint ? <AppText align="center">{hint}</AppText> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.stateButton} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 60,
  },
  stateButton: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
});
