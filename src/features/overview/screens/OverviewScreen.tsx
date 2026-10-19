
import { Text, View, StyleSheet } from 'react-native';
import { colors, globalStyles } from '../../../shared/global.styles'

export default function OverviewScreen() {
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
});
