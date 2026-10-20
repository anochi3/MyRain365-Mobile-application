import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F7F5F0',

  primaryText: '#1C2430',
  secondaryText: '#5B6573',

  iconBackground: '#FFFEFC',
  iconText: '#1C2430',

  buttons: '#1F4E79',
  buttonText: '#FFFFFF',
  blueSoft: '#E3ECF5',
  blueBorder: '#CFDDEC',

  warningTitle: '#C2502E',
  warningBackground: '#F8E6DE',
  warningBorder: '#EECDBF',

  teal: '#2A9D8F',
  green: '#1E7A70',
  greenBackground: '#E1F1EE',

  labelText: '#5B6573',
  cardBorder: '#E6E1D8',
  cardBackground: '#FFFEFC',

  inactiveTab: '#EFEBE3',
  activeTab: '#FFFEFC',

  mapBackground: '#2B2F2A',
  mapOverlay: '#0E1928',
  shadow: '#1C2430',
};

export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  extrabold: 'Geist_800ExtraBold',
};

export const radii = {
  card: 20,
  tile: 14,
  icon: 12,
  pill: 999,
};

export const spacing = {
  screen: 20,
  gap: 12,
};

export const shadows = StyleSheet.create({
  floating: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  raised: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: spacing.screen,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.primaryText,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.secondaryText,
    marginTop: 30,
    marginBottom: 16,
  },
  empty: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
