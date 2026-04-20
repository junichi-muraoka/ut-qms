import React, { useState, useEffect } from 'react';
import type { System } from '../../../server/shared_schema';
import { SystemContext } from './SystemContext';

export const SystemProvider: React.FC<{ children: React.ReactNode; apiBaseUrl: string }> = ({ children, apiBaseUrl }) => {
  const [activeSystemId, setActiveSystemId] = useState<string | null>(() => {
    return localStorage.getItem('activeSystemId');
  });
  const [systems, setSystems] = useState<System[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSystems = React.useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/systems`, { credentials: 'include' });
      const data = await res.json();
      setSystems(data);
      
      if (!activeSystemId && data.length > 0) {
        setActiveSystemId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch systems', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, activeSystemId]);

  useEffect(() => {
    refreshSystems();
  }, [refreshSystems]);

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
