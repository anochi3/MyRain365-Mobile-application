
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../../../shared/global.styles';

type Props = {
  address: string;
  roofArea: string;
  onRoofAreaChange: (value: string) => void;
  onContinue: () => void;
};

export default function RoofDetailsPanel({
  address,
  roofArea,
  onRoofAreaChange,
  onContinue,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.headingRow}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="home-outline"
            size={26}
            color={colors.green}
          />
        </View>

        <View style={styles.headingText}>
          <Text style={styles.title}>Choose your building</Text>
          <Text style={styles.subtitle}>
            Move the map to place the pin over your roof.
          </Text>
        </View>
      </View>

      <Text style={styles.address} numberOfLines={2}>
        {address}
      </Text>

      <Text style={styles.label}>Roof area (m²)</Text>

      <TextInput
        value={roofArea}
        onChangeText={onRoofAreaChange}
        placeholder="Enter roof area, e.g. 52"
        placeholderTextColor={colors.secondaryText}
        keyboardType="decimal-pad"
        style={styles.input}
        accessibilityLabel="Roof area in square metres"
      />

      <Text style={styles.helperText}>
        Enter a measured or verified area. The map pin does not
        automatically measure the roof.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onContinue}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Use this roof</Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -18,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.cardBorder,
    alignSelf: 'center',
    marginBottom: 22,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#DFF0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    flex: 1,
  },
  title: {
    color: colors.primaryText,
    fontSize: 21,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  address: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 22,
    marginBottom: 18,
  },
  label: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.primaryText,
  },
  helperText: {
    color: colors.secondaryText,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 9,
    marginBottom: 18,
  },
  button: {
    minHeight: 58,
    borderRadius: 32,
    backgroundColor: colors.buttons,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
