
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../../../shared/global.styles';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
};

export default function AddressSearchBar({
  value,
  onChangeText,
  onSearch,
  isSearching,
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={22}
        color={colors.secondaryText}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSearch}
        placeholder="Search street or address"
        placeholderTextColor={colors.secondaryText}
        returnKeyType="search"
        style={styles.input}
        accessibilityLabel="Search for a building address"
      />

      <TouchableOpacity
        onPress={onSearch}
        disabled={isSearching}
        style={styles.button}
        accessibilityLabel="Search address"
      >
        {isSearching ? (
          <ActivityIndicator color={colors.buttons} />
        ) : (
          <Ionicons
            name="arrow-forward"
            size={21}
            color={colors.buttons}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 18,
    right: 18,
    height: 58,
    backgroundColor: colors.cardBackground,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 7,
    gap: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    fontSize: 16,
    paddingVertical: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.inactiveTab,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
