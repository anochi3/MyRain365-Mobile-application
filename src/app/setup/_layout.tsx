/** The five setup steps are a simple stack: each step slides in over the previous one. */
import { Stack } from 'expo-router';

export default function SetupLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
