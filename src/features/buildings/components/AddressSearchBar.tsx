/** Search bar over the map, with address suggestions and the GPS button. */
import { Crosshair, MagnifyingGlass, MapPin } from 'phosphor-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { AddressSuggestion } from '@/data/services/ignService';
import { colors, fonts, shadows } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

const BLUR_DELAY_MS = 150;

type Props = {
  value: string;
  isSearching: boolean;
  suggestions: AddressSuggestion[];
  isLocating: boolean;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: () => void;
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  onLocatePress: () => void;
};

export default function AddressSearchBar({
  value,
  isSearching,
  suggestions,
  isLocating,
  onChangeText,
  onFocus,
  onBlur,
  onSubmit,
  onSelectSuggestion,
  onLocatePress,
}: Props) {
  const { s } = useI18n();

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <MagnifyingGlass size={20} color={colors.secondaryText} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={() => setTimeout(onBlur, BLUR_DELAY_MS)}
          onSubmitEditing={onSubmit}
          placeholder={s.locate.search}
          placeholderTextColor={colors.secondaryText}
          returnKeyType="search"
          autoCorrect={false}
          style={styles.input}
          accessibilityLabel={s.locate.search}
        />

        <Pressable
          onPress={onLocatePress}
          disabled={isLocating}
          hitSlop={6}
          style={({ pressed }) => [styles.locateButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={s.locate.useLocation}
        >
          {isLocating ? (
            <ActivityIndicator color={colors.buttons} />
          ) : (
            <Crosshair size={22} weight="fill" color={colors.buttons} />
          )}
        </Pressable>
      </View>

      {isSearching && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={`${suggestion.label}-${index}`}
              onPress={() => onSelectSuggestion(suggestion)}
              style={({ pressed }) => [
                styles.suggestion,
                index > 0 && styles.suggestionDivider,
                pressed && styles.suggestionPressed,
              ]}
              accessibilityRole="button"
            >
              <MapPin size={18} color={colors.secondaryText} />
              <Text style={styles.suggestionText} numberOfLines={1}>
                {suggestion.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 18,
    right: 18,
  },
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 18,
    paddingRight: 7,
    borderRadius: 30,
    backgroundColor: colors.cardBackground,
    ...shadows.floating,
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: 8,
  },
  locateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSoft,
  },
  pressed: {
    opacity: 0.7,
  },
  suggestions: {
    marginTop: 8,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    ...shadows.floating,
  },
  suggestion: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  suggestionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  suggestionPressed: {
    backgroundColor: colors.inactiveTab,
  },
  suggestionText: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
});
