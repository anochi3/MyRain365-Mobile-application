import type { ReactNode } from 'react';

import type { ProjectResults } from '@/data/hooks/useProjectResults';
import Screen from '@/shared/components/Screen';

import ResultsGate from './ResultsGate';

type Props = {
  title: string;
  footer?: ReactNode;
  children: (results: ProjectResults) => ReactNode;
};

export default function ResultDetail({ title, footer, children }: Props) {
  return (
    <Screen title={title} showBack hasTabBar footer={footer}>
      <ResultsGate>{children}</ResultsGate>
    </Screen>
  );
}
