/** Results tab: the summary screen plus a stack of detail pages opened from it. */
import { Stack } from 'expo-router';

export default function ResultsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
