import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

import { useProjectResults, type ProjectResults } from '@/data/hooks/useProjectResults';
import { StateMessage } from '@/shared/components/Notice';
import { useI18n } from '@/shared/i18n';

type Props = {
  children: (results: ProjectResults) => ReactNode;
};

export default function ResultsGate({ children }: Props) {
  const router = useRouter();
  const { s } = useI18n();
  const state = useProjectResults();

  switch (state.status) {
    case 'missing':
      return (
        <StateMessage
          title={s.common.noBuilding}
          hint={s.common.noBuildingHint}
          actionLabel={s.common.findBuilding}
          onAction={() => router.push('/building')}
        />
      );
    case 'loading':
      return <StateMessage title={s.common.loading} isLoading />;
    case 'error':
      return (
        <StateMessage
          title={s.common.offline}
          hint={s.common.offlineHint}
          actionLabel={s.common.retry}
          onAction={state.retry}
        />
      );
    case 'ready':
      return <>{children(state.results)}</>;
  }
}
