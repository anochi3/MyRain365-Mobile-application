/** Coloured square (or circle) holding an icon. */
import type { Icon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/shared/global.styles';

export type BadgeTone = 'teal' | 'blue' | 'brick' | 'sand' | 'card';

const TONES: Record<BadgeTone, { background: string; foreground: string }> = {
  teal: { background: colors.greenBackground, foreground: colors.green },
  blue: { background: colors.blueSoft, foreground: colors.buttons },
  brick: { background: colors.warningBackground, foreground: colors.warningTitle },
  sand: { background: colors.inactiveTab, foreground: colors.secondaryText },
  card: { background: colors.cardBackground, foreground: colors.green },
};

type Props = {
  icon: Icon;
  tone?: BadgeTone;
  size?: number;
  round?: boolean;
  weight?: 'regular' | 'fill' | 'bold';
};

export default function IconBadge({
  icon: IconComponent,
  tone = 'blue',
  size = 40,
  round = false,
  weight = 'fill',
}: Props) {
  const { background, foreground } = TONES[tone];
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: background },
        round && styles.round,
      ]}
    >
      <IconComponent size={size * 0.52} color={foreground} weight={weight} />
    </View>
  );
}

export const badgeColor = (tone: BadgeTone) => TONES[tone].foreground;

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.icon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: {
    borderRadius: radii.pill,
  },
});
