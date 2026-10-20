
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { colors, globalStyles } from '../../../shared/global.styles'

export default function OverviewScreen() {
  // set by the Locate screen ("Use this roof")
  const { roofArea, address } = useLocalSearchParams<{ roofArea?: string; address?: string }>();
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>MyRain365</Text>

      <Text style={styles.subtitle}>
        Your rainwater harvesting overview
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Water collected
        </Text>
        <Text style={styles.value}>-- L</Text>
        <Text style={styles.description}>
          Your simulation results will appear here.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your roof</Text>
        <Text style={styles.value}>{roofArea ? `${roofArea} m²` : '-- m²'}</Text>
        <Text style={styles.description}>{address || 'Locate your building to measure it.'}</Text>
      </View>

      <Link href="/locate?auto=1" asChild>
        <Pressable style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>{roofArea ? 'Change building' : 'Find my building'}</Text>
        </Pressable>
      </Link>
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
    marginTop: 28,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttons,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
