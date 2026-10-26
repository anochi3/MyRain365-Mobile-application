import type { ReactNode } from 'react';

import type { ProjectResults } from '@/data/hooks/useProjectResults';
import type { InfoTopic } from '@/shared/components/InfoButton';
import Screen from '@/shared/components/Screen';

import ResultsGate from './ResultsGate';

type Props = {
  title: string;
  footer?: ReactNode;
  info?: InfoTopic;
  children: (results: ProjectResults) => ReactNode;
};

export default function ResultDetail({ title, footer, info, children }: Props) {
  return (
    <Screen title={title} showBack hasTabBar footer={footer} info={info}>
      <ResultsGate>{children}</ResultsGate>
    </Screen>
  );
}
