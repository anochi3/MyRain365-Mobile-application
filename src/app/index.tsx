/** Entry route: returning users go straight to their results, new users to the welcome screen. */
import { Redirect } from 'expo-router';

import { useProjectStore } from '@/data/store/ProjectProvider';

export default function Index() {
  const { project } = useProjectStore();
  return <Redirect href={project.completedAt ? '/results' : '/welcome'} />;
}
