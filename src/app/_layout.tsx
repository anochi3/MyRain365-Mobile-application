/** Root of the app: loads the Geist fonts and the saved project, then shows the screens. */
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/geist';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ResultsProvider } from '@/data/hooks/useProjectResults';
import { ProjectProvider, useProjectStore } from '@/data/store/ProjectProvider';
import { colors } from '@/shared/global.styles';

void SplashScreen.preventAutoHideAsync();

function AppStack() {
  const { isHydrated } = useProjectStore();
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
  });
  const isReady = isHydrated && fontsLoaded;

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ResultsProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ResultsProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProjectProvider>
        <AppStack />
      </ProjectProvider>
    </SafeAreaProvider>
  );
}
