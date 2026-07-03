import AsyncStorage from '@react-native-async-storage/async-storage';

import { fallbackCatalog } from '@/data/fallbackCatalog';
import { supabase } from '@/lib/supabase';
import type { Food, RouletteGroup, RouletteGroupFood } from '@/types/catalog';

const CATALOG_CACHE_KEY = '@comer-o-que/catalog:v1';
const CATALOG_GROUP_ORDER = [
  'sobremesa',
  'fome-grande',
  'regional',
  'estrangeira',
] as const;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(record: UnknownRecord, key: string): string {
  const value = record[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Campo obrigatório inválido: ${key}.`);
  }

  return value;
}

function readNullableString(record: UnknownRecord, key: string): string | null {
  const value = record[key];

  if (value !== null && typeof value !== 'string') {
    throw new Error(`Campo opcional inválido: ${key}.`);
  }

  return value;
}

function readPositiveInteger(record: UnknownRecord, key: string): number {
  const value = record[key];

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(`Número positivo inválido: ${key}.`);
  }

  return value;
}

function parseRemoteTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error('Tags remotas inválidas.');
  }

  return value.map((tagRow) => {
    if (!isRecord(tagRow)) {
      throw new Error('Tag remota inválida.');
    }

    return readString(tagRow, 'tag');
  });
}

function parseRemoteFood(value: unknown): Food {
  if (!isRecord(value)) {
    throw new Error('Comida remota inválida.');
  }

  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    description: readNullableString(value, 'description'),
    emoji: readNullableString(value, 'emoji'),
    assetKey: readNullableString(value, 'asset_key'),
    searchQuery: readString(value, 'search_query'),
    tags: parseRemoteTags(value.food_tags),
  };
}

function parseRemoteGroupFood(value: unknown): RouletteGroupFood {
  if (!isRecord(value)) {
    throw new Error('Vínculo de roleta remoto inválido.');
  }

  return {
    food: parseRemoteFood(value.food),
    weight: readPositiveInteger(value, 'weight'),
  };
}

function parseRemoteGroup(value: unknown): RouletteGroup {
  if (!isRecord(value) || !Array.isArray(value.roulette_group_foods)) {
    throw new Error('Grupo de roleta remoto inválido.');
  }

  const foods = value.roulette_group_foods.map(parseRemoteGroupFood);

  if (foods.length === 0) {
    throw new Error('Grupo de roleta remoto sem comidas.');
  }

  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    slug: readString(value, 'slug'),
    description: readNullableString(value, 'description'),
    emoji: readNullableString(value, 'emoji'),
    foods,
  };
}

function parseCachedFood(value: unknown): Food {
  if (!isRecord(value) || !Array.isArray(value.tags)) {
    throw new Error('Comida em cache inválida.');
  }

  const tags = value.tags.map((tag) => {
    if (typeof tag !== 'string' || tag.trim().length === 0) {
      throw new Error('Tag em cache inválida.');
    }

    return tag;
  });

  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    description: readNullableString(value, 'description'),
    emoji: readNullableString(value, 'emoji'),
    assetKey: readNullableString(value, 'assetKey'),
    searchQuery: readString(value, 'searchQuery'),
    tags,
  };
}

function parseCachedGroupFood(value: unknown): RouletteGroupFood {
  if (!isRecord(value)) {
    throw new Error('Vínculo de roleta em cache inválido.');
  }

  return {
    food: parseCachedFood(value.food),
    weight: readPositiveInteger(value, 'weight'),
  };
}

function parseCachedGroup(value: unknown): RouletteGroup {
  if (!isRecord(value) || !Array.isArray(value.foods)) {
    throw new Error('Grupo de roleta em cache inválido.');
  }

  const foods = value.foods.map(parseCachedGroupFood);

  if (foods.length === 0) {
    throw new Error('Grupo de roleta em cache sem comidas.');
  }

  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    slug: readString(value, 'slug'),
    description: readNullableString(value, 'description'),
    emoji: readNullableString(value, 'emoji'),
    foods,
  };
}

function validateAndSortCatalog(catalog: RouletteGroup[]): RouletteGroup[] {
  const groupsBySlug = new Map<string, RouletteGroup>();

  for (const group of catalog) {
    if (groupsBySlug.has(group.slug)) {
      throw new Error(`Grupo duplicado no catálogo: ${group.slug}.`);
    }

    groupsBySlug.set(group.slug, group);
  }

  return CATALOG_GROUP_ORDER.map((slug) => {
    const group = groupsBySlug.get(slug);

    if (!group) {
      throw new Error(`Grupo obrigatório ausente no catálogo: ${slug}.`);
    }

    return group;
  });
}

function parseRemoteCatalog(value: unknown): RouletteGroup[] {
  if (!Array.isArray(value)) {
    throw new Error('Catálogo remoto inválido.');
  }

  return validateAndSortCatalog(value.map(parseRemoteGroup));
}

function parseCachedCatalog(value: unknown): RouletteGroup[] {
  if (!Array.isArray(value)) {
    throw new Error('Catálogo em cache inválido.');
  }

  return validateAndSortCatalog(value.map(parseCachedGroup));
}

function logDevelopmentWarning(message: string, error: unknown) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`[catalogService] ${message}`, error);
  }
}

async function fetchRemoteCatalog(): Promise<RouletteGroup[]> {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase
    .from('roulette_groups')
    .select(`
      id,
      name,
      slug,
      description,
      emoji,
      roulette_group_foods (
        weight,
        food:foods!inner (
          id,
          name,
          description,
          emoji,
          asset_key,
          search_query,
          food_tags (tag)
        )
      )
    `)
    .eq('is_active', true)
    .in('slug', [...CATALOG_GROUP_ORDER]);

  if (error) {
    throw error;
  }

  return parseRemoteCatalog(data);
}

async function readCachedCatalog(): Promise<RouletteGroup[] | null> {
  const cachedValue = await AsyncStorage.getItem(CATALOG_CACHE_KEY);

  if (!cachedValue) {
    return null;
  }

  const parsedCache: unknown = JSON.parse(cachedValue);

  return parseCachedCatalog(parsedCache);
}

async function writeCatalogCache(catalog: RouletteGroup[]): Promise<void> {
  await AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(catalog));
}

export async function getCatalog(): Promise<RouletteGroup[]> {
  try {
    const remoteCatalog = await fetchRemoteCatalog();

    try {
      await writeCatalogCache(remoteCatalog);
    } catch (error) {
      logDevelopmentWarning('Não foi possível atualizar o cache do catálogo.', error);
    }

    return remoteCatalog;
  } catch (error) {
    logDevelopmentWarning('Falha ao carregar o catálogo remoto.', error);
  }

  try {
    const cachedCatalog = await readCachedCatalog();

    if (cachedCatalog) {
      return cachedCatalog;
    }
  } catch (error) {
    logDevelopmentWarning('Falha ao ler o cache do catálogo.', error);
  }

  return fallbackCatalog;
}
