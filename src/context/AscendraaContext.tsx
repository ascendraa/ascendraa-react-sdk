import { createContext, useContext } from 'react';
import type { AscendraaContextValue } from '../core/types';

export const AscendraaContext = createContext<AscendraaContextValue | null>(null);

/**
 * Hook to access Ascendraa context
 * @throws Error if used outside AscendraaProvider
 */
export function useAscendraaContext(): AscendraaContextValue {
  const context = useContext(AscendraaContext);
  if (!context) {
    throw new Error('useAscendraaContext must be used within an AscendraaProvider');
  }
  return context;
}

