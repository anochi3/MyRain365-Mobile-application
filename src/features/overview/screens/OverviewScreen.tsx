import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, globalStyles } from '@/shared/global.styles';

type RoofParams = {
  roofAreaM2?: string;
  address?: string;
};

export default function OverviewScreen() {
  const router = useRouter();
  const { roofAreaM2, address } = useLocalSearchParams<RoofParams>();

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>MyRain365</Text>

      <Text style={styles.subtitle}>Your rainwater harvesting overview</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Water collected</Text>
        <Text style={styles.value}>-- L</Text>
        <Text style={styles.description}>Your simulation results will appear here.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your roof</Text>
        <Text style={styles.value}>{roofAreaM2 ? `${roofAreaM2} m²` : '-- m²'}</Text>
        <Text style={styles.description}>
          {address || 'Choose your building to measure its roof.'}
        </Text>
      </View>

      <Pressable
        onPress={() => router.navigate('/building')}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {roofAreaM2 ? 'Change building' : 'Choose a building'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.secondaryText,
    fontSize: 15,
    marginTop: 8,
  },
  card: {
    marginTop: 28,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  value: {
    color: colors.primaryText,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  description: {
    color: colors.secondaryText,
    fontSize: 13,
    marginTop: 6,
  },
  button: {
    height: 56,
    marginTop: 28,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttons,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 17,
    fontWeight: '700',
  },
});
