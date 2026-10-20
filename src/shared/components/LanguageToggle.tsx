import { Pressable, StyleSheet, View } from 'react-native';

import { useProjectActions, useProjectStore } from '@/data/store/ProjectProvider';
import type { Language } from '@/data/store/projectTypes';
import { colors, fonts, radii } from '@/shared/global.styles';

import AppText from './AppText';

const LANGUAGES: Language[] = ['en', 'fr'];

export default function LanguageToggle() {
  const { preferences } = useProjectStore();
  const { updatePreferences } = useProjectActions();

  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {LANGUAGES.map((language) => {
        const isActive = preferences.language === language;
        return (
          <Pressable
            key={language}
            onPress={() => updatePreferences({ language })}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={language === 'en' ? 'English' : 'Français'}
            style={[styles.option, isActive && styles.active]}
          >
            <AppText style={[styles.label, isActive && styles.activeLabel]}>
              {language.toUpperCase()}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 36,
    padding: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.inactiveTab,
  },
  option: {
    width: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.buttons,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.secondaryText,
  },
  activeLabel: {
    color: colors.buttonText,
  },
});
