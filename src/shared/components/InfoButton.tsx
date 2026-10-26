import { ArrowSquareOut, Info } from 'phosphor-react-native';
import { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';
import type { Dictionary } from '@/shared/i18n/en';

import AppText from './AppText';
import Button from './Button';

export type InfoTopic = keyof Dictionary['info']['topics'];

const OPEN_METEO_HISTORY = 'https://open-meteo.com/en/docs/historical-weather-api';
const OPEN_METEO_FORECAST = 'https://open-meteo.com/en/docs';
const IGN_BD_TOPO = 'https://geoservices.ign.fr/bdtopo';
const ILEO_TARIFF = 'https://www.mel-ileo.fr/assets/pdf/Grille_tarifaire_2026.pdf';

const SOURCE_LINKS: Partial<Record<InfoTopic, string>> = {
  address: 'https://geoservices.ign.fr/documentation/services/services-geoplateforme/geocodage',
  outline: IGN_BD_TOPO,
  material: 'https://geoservices.ign.fr/bdortho',
  quality: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000019386409',
  simulation: OPEN_METEO_HISTORY,
  collected: OPEN_METEO_HISTORY,
  month: OPEN_METEO_HISTORY,
  saved: ILEO_TARIFF,
  money: ILEO_TARIFF,
  tankStatus: OPEN_METEO_FORECAST,
  alerts: OPEN_METEO_FORECAST,
};

type Props = {
  topic: InfoTopic;
  size?: number;
};

export default function InfoButton({ topic, size = 18 }: Props) {
  const { s, fill } = useI18n();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const info = s.info.topics[topic];
  const link = SOURCE_LINKS[topic];
  const close = () => setIsOpen(false);

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        hitSlop={13}
        accessibilityRole="button"
        accessibilityLabel={fill(s.info.about, { title: info.title })}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Info size={size} color={colors.secondaryText} />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={s.info.close}
          />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.handle} />
            <View style={styles.text}>
              <AppText variant="label">{s.info.eyebrow}</AppText>
              <AppText variant="subtitle" style={styles.title}>
                {info.title}
              </AppText>
              <AppText color={colors.primaryText} style={styles.body}>
                {info.body}
              </AppText>
            </View>
            <View style={styles.source}>
              <AppText style={styles.sourceLabel}>{s.info.source}</AppText>
              <AppText variant="caption">{info.source}</AppText>
              {link ? (
                <Pressable
                  onPress={() => void Linking.openURL(link)}
                  hitSlop={8}
                  accessibilityRole="link"
                  style={({ pressed }) => [styles.link, pressed && styles.pressed]}
                >
                  <AppText style={styles.linkText}>{s.info.openSource}</AppText>
                  <ArrowSquareOut size={14} color={colors.buttons} />
                </Pressable>
              ) : null}
            </View>
            <Button label={s.info.close} compact onPress={close} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.5,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  sheet: {
    gap: 16,
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.cardBorder,
  },
  text: {
    gap: 6,
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  source: {
    gap: 2,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  sourceLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.primaryText,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
  },
  linkText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.buttons,
  },
});
