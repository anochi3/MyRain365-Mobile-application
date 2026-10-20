import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, fonts } from '@/shared/global.styles';

export type TextVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'number'
  | 'stat'
  | 'caption';

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export default function AppText({ variant = 'body', color, align, style, ...props }: Props) {
  return (
    <Text
      {...props}
      style={[
        styles[variant],
        color ? { color } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 37,
    letterSpacing: -1,
    color: colors.primaryText,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: colors.primaryText,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: colors.primaryText,
  },
  subtitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.primaryText,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondaryText,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 17,
    color: colors.secondaryText,
  },
  number: {
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: colors.primaryText,
  },
  stat: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.6,
    color: colors.primaryText,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.secondaryText,
  },
});
