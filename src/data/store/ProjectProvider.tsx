import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

import { defaultPreferences, emptyProject, exampleProject } from './defaults';
import type {
  AccessNeed,
  Building,
  Household,
  Preferences,
  Project,
  Quality,
  Roof,
  Site,
} from './projectTypes';

const STORAGE_KEY = 'myrain365:state:v1';

type State = {
  project: Project;
  preferences: Preferences;
};

type Action =
  | { type: 'hydrate'; state: State }
  | { type: 'setBuilding'; building: Building; roof: Partial<Roof> }
  | { type: 'updateRoof'; roof: Partial<Roof> }
  | { type: 'updateHousehold'; household: Partial<Household> }
  | { type: 'updateSite'; site: Partial<Site> }
  | { type: 'updateQuality'; quality: Partial<Quality> }
  | { type: 'toggleAccess'; need: AccessNeed }
  | { type: 'setTank'; tankLitres: number }
  | { type: 'complete' }
  | { type: 'loadExample' }
  | { type: 'reset' }
  | { type: 'updatePreferences'; preferences: Partial<Preferences> };

const today = () => new Date().toISOString().slice(0, 10);

function reducer(state: State, action: Action): State {
  const { project } = state;
  const withProject = (next: Partial<Project>): State => ({
    ...state,
    project: { ...project, ...next },
  });

  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'setBuilding':
      return withProject({
        building: action.building,
        roof: { ...project.roof, ...action.roof },
        completedAt: null,
      });
    case 'updateRoof':
      return withProject({ roof: { ...project.roof, ...action.roof } });
    case 'updateHousehold':
      return withProject({
        household: {
          ...project.household,
          ...action.household,
          uses: { ...project.household.uses, ...action.household.uses },
        },
      });
    case 'updateSite':
      return withProject({ site: { ...project.site, ...action.site } });
    case 'updateQuality':
      return withProject({ quality: { ...project.quality, ...action.quality } });
    case 'toggleAccess':
      return withProject({
        access: project.access.includes(action.need)
          ? project.access.filter((need) => need !== action.need)
          : [...project.access, action.need],
      });
    case 'setTank':
      return withProject({ tankLitres: action.tankLitres });
    case 'complete':
      return withProject({ completedAt: today(), installedOn: project.installedOn ?? today() });
    case 'loadExample':
      return {
        ...state,
        project: { ...exampleProject, completedAt: today(), installedOn: today() },
      };
    case 'reset':
      return { ...state, project: emptyProject };
    case 'updatePreferences':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.preferences,
          notifications: {
            ...state.preferences.notifications,
            ...action.preferences.notifications,
          },
        },
      };
  }
}

type ProjectContextValue = State & {
  isHydrated: boolean;
  dispatch: (action: Action) => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    project: emptyProject,
    preferences: defaultPreferences,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          const parsed = JSON.parse(saved) as State;
          dispatch({
            type: 'hydrate',
            state: {
              project: { ...emptyProject, ...parsed.project },
              preferences: { ...defaultPreferences, ...parsed.preferences },
            },
          });
        }
      })
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (isHydrated) {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const value = useMemo(() => ({ ...state, isHydrated, dispatch }), [state, isHydrated]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectStore(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectStore must be used inside ProjectProvider');
  }
  return context;
}

export function useProjectActions() {
  const { dispatch } = useProjectStore();

  return {
    setBuilding: useCallback(
      (building: Building, roof: Partial<Roof>) =>
        dispatch({ type: 'setBuilding', building, roof }),
      [dispatch],
    ),
    updateRoof: useCallback(
      (roof: Partial<Roof>) => dispatch({ type: 'updateRoof', roof }),
      [dispatch],
    ),
    updateHousehold: useCallback(
      (household: Partial<Household>) => dispatch({ type: 'updateHousehold', household }),
      [dispatch],
    ),
    updateSite: useCallback(
      (site: Partial<Site>) => dispatch({ type: 'updateSite', site }),
      [dispatch],
    ),
    updateQuality: useCallback(
      (quality: Partial<Quality>) => dispatch({ type: 'updateQuality', quality }),
      [dispatch],
    ),
    toggleAccess: useCallback(
      (need: AccessNeed) => dispatch({ type: 'toggleAccess', need }),
      [dispatch],
    ),
    setTank: useCallback(
      (tankLitres: number) => dispatch({ type: 'setTank', tankLitres }),
      [dispatch],
    ),
    complete: useCallback(() => dispatch({ type: 'complete' }), [dispatch]),
    loadExample: useCallback(() => dispatch({ type: 'loadExample' }), [dispatch]),
    reset: useCallback(() => dispatch({ type: 'reset' }), [dispatch]),
    updatePreferences: useCallback(
      (preferences: Partial<Preferences>) => dispatch({ type: 'updatePreferences', preferences }),
      [dispatch],
    ),
  };
}
