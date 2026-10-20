import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { AddressSuggestion } from '@/data/services/ignService';
import { colors, shadows } from '@/shared/global.styles';

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
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Ionicons name="search-outline" size={22} color={colors.secondaryText} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={() => setTimeout(onBlur, BLUR_DELAY_MS)}
          onSubmitEditing={onSubmit}
          placeholder="Search your address"
          placeholderTextColor={colors.secondaryText}
          returnKeyType="search"
          autoCorrect={false}
          style={styles.input}
          accessibilityLabel="Search your address"
        />

        <Pressable
          onPress={onLocatePress}
          disabled={isLocating}
          hitSlop={6}
          style={({ pressed }) => [styles.locateButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Use my location"
        >
          {isLocating ? (
            <ActivityIndicator color={colors.buttons} />
          ) : (
            <Ionicons name="locate-outline" size={22} color={colors.buttons} />
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
              <Ionicons name="location-outline" size={18} color={colors.secondaryText} />
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
    height: 58,
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
    fontSize: 16,
    paddingVertical: 8,
  },
  locateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inactiveTab,
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
    fontSize: 15,
  },
});
