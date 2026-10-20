/** Shows each data source being fetched, then opens the results as soon as the simulation is ready. */
import { useRouter } from 'expo-router';
import { Check, CircleNotch } from 'phosphor-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useProjectResults } from '@/data/hooks/useProjectResults';
import { HISTORY_PERIOD } from '@/data/services/weatherService';
import { useProjectActions } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import Screen from '@/shared/components/Screen';
import { colors, radii } from '@/shared/global.styles';
import { useI18n } from '@/shared/i18n';

// Ten years from 2015 to 2024, including leap days.
const SIMULATED_DAYS = 3653;

export default function AnalysingScreen() {
  const router = useRouter();
  const { s, fill, number } = useI18n();
  const results = useProjectResults();
  const { complete } = useProjectActions();
  const isReady = results.status === 'ready';

  // As soon as the results are ready, mark the analysis complete and open them.
  useEffect(() => {
    if (!isReady) return;
    complete();
    const timer = setTimeout(() => router.replace('/results'), 600);
    return () => clearTimeout(timer);
  }, [isReady, complete, router]);

  const steps = [
    { title: s.analysing.outline, source: s.analysing.outlineSource, done: true },
    { title: s.analysing.material, source: s.analysing.materialSource, done: true },
    {
      title: s.analysing.rain,
      source: fill(s.analysing.rainSource, HISTORY_PERIOD),
      done: isReady,
    },
    { title: s.analysing.price, source: s.analysing.priceSource, done: true },
    {
      title: fill(s.analysing.simulate, { days: number(SIMULATED_DAYS) }),
      source: s.analysing.simulateSource,
      done: isReady,
    },
  ];
  const progress = steps.filter((step) => step.done).length / steps.length;

  return (
    <Screen>
      <AppText variant="heading" style={styles.title}>
        {s.analysing.title}
      </AppText>
      <AppText>{s.analysing.subtitle}</AppText>
      <Card compact>
        {steps.map((step, index) => (
          <View key={step.title} style={[styles.step, index > 0 && styles.divider]}>
            <View style={[styles.marker, step.done ? styles.markerDone : styles.markerPending]}>
              {step.done ? (
                <Check size={18} weight="bold" color={colors.green} />
              ) : (
                <CircleNotch size={18} weight="bold" color={colors.buttons} />
              )}
            </View>
            <View style={styles.flex}>
              <AppText variant="subtitle" style={styles.stepTitle}>
                {step.title}
              </AppText>
              <AppText variant="caption">{step.source}</AppText>
            </View>
          </View>
        ))}
      </Card>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${progress * 100}%` }]} />
      </View>
      {results.status === 'error' ? (
        <>
          <AppText align="center">{s.common.offline}</AppText>
          <Button label={s.common.retry} onPress={results.retry} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  marker: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: {
    backgroundColor: colors.greenBackground,
  },
  markerPending: {
    backgroundColor: colors.blueSoft,
  },
  flex: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
  },
  track: {
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: colors.inactiveTab,
  },
  bar: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.teal,
  },
});
