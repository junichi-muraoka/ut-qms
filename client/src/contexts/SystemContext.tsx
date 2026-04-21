import { createContext, useContext } from 'react';
import type { System } from '../../../server/shared_schema';

export interface SystemContextType {
  activeSystemId: string | null;
  setActiveSystemId: (id: string | null) => void;
  systems: System[];
  refreshSystems: () => Promise<void>;
  isLoading: boolean;
}

export const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
