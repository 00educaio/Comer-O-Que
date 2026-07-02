import { fallbackCatalog } from '@/data/fallbackCatalog';
import type { RouletteGroup } from '@/types/catalog';

export async function getCatalog(): Promise<RouletteGroup[]> {
  return fallbackCatalog;
}
