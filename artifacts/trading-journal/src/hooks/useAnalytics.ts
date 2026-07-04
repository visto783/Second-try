import { useMemo } from 'react';
import { useTrades } from './useTrades';
import { computeAnalytics } from '../lib/analytics';

export function useAnalytics() {
  const { trades } = useTrades();
  return useMemo(() => computeAnalytics(trades), [trades]);
}