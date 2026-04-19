import React, { createContext, useContext, useState, useEffect } from 'react';
import type { System } from '../../../server/shared_schema';

interface SystemContextType {
  activeSystemId: string | null;
  setActiveSystemId: (id: string | null) => void;
  systems: System[];
  refreshSystems: () => Promise<void>;
  isLoading: boolean;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode; apiBaseUrl: string }> = ({ children, apiBaseUrl }) => {
  const [activeSystemId, setActiveSystemId] = useState<string | null>(() => {
    return localStorage.getItem('activeSystemId');
  });
  const [systems, setSystems] = useState<System[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSystems = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/systems`, { credentials: 'include' });
      const data = await res.json();
      setSystems(data);
      
      // 最初の一つをデフォルトとして選択
      if (!activeSystemId && data.length > 0) {
        setActiveSystemId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch systems', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSystems();
  }, []);

  useEffect(() => {
    if (activeSystemId) {
      localStorage.setItem('activeSystemId', activeSystemId);
    }
  }, [activeSystemId]);

  return (
    <SystemContext.Provider value={{ activeSystemId, setActiveSystemId, systems, refreshSystems, isLoading }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
