import { StyleSheet } from 'react-native';

export const colors = {
    background: '#F7F5F0',

    primaryText: '#1B222D',
    secondaryText: '#5B6678',

    iconBackground: '#FFFEFC',
    iconText: '#1B222D',

    buttons: '#1E527F',

    warningTitle: '#CF4D2A',
    warningBackground: '#F8E6DE',
    warningBorder: '#EFD1C5',

    green: '#218579',

    labelText: '#5B6678',
    cardBorder: '#E6E2DB',
    cardBackground: '#FFFEFC',

    inactiveTab:'#EFEBE3',
    activeTab: '#FFFEFC',
    }

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 30,
    marginBottom: 16,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});