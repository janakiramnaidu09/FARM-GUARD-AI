import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.js';
import { Farm, Field } from '@farmguard/shared';

interface FarmContextType {
  farms: Farm[];
  selectedFarm: Farm | null;
  fields: Field[];
  loading: boolean;
  selectFarm: (farm: Farm) => void;
  refreshFarms: () => Promise<void>;
  refreshFields: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshFarms = useCallback(async () => {
    if (!user) {
      setFarms([]);
      setSelectedFarm(null);
      setFields([]);
      return;
    }

    try {
      setLoading(true);
      const farmList = await api.getFarms();
      setFarms(farmList);

      if (farmList.length > 0) {
        // Retain current selection if valid, otherwise pick first
        setSelectedFarm((prev) => {
          if (prev && farmList.some((f) => f.id === prev.id)) {
            return farmList.find((f) => f.id === prev.id)!;
          }
          return farmList[0];
        });
      } else {
        setSelectedFarm(null);
      }
    } catch (err) {
      console.warn('Failed to fetch user farms:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshFields = useCallback(async () => {
    if (!selectedFarm) {
      setFields([]);
      return;
    }
    try {
      const fieldList = await api.getFields(selectedFarm.id);
      setFields(fieldList);
    } catch (err) {
      console.warn('Failed to fetch farm fields:', err);
      setFields([]);
    }
  }, [selectedFarm]);

  useEffect(() => {
    refreshFarms();
  }, [refreshFarms]);

  useEffect(() => {
    refreshFields();
  }, [refreshFields]);

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarm,
        fields,
        loading,
        selectFarm: setSelectedFarm,
        refreshFarms,
        refreshFields,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}

