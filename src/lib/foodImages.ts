import { supabaseEnvironment } from '@/lib/supabase';
import type { Food } from '@/types/catalog';

const FOOD_IMAGE_BUCKET = 'food-images';

const FOOD_IMAGE_FILE_NAME_BY_NAME: Record<string, string> = {
  'açaí na tigela': 'acai.webp',
  'banoffee': 'banoffe.webp',
  'bobó de camarão': 'bobo-de-camarao.webp',
  'carne de sol com macaxeira': 'carne-de-sol-macaxeira.webp',
  'costela barbecue': 'costela.webp',
  'croque monsieur': 'croque-monsieur.webp',
  'cuscuz com carne de sol': 'cucuz-carne-de-sol.webp',
  'cuscuz nordestino': 'cuscuz.webp',
  'escondidinho de carne-seca': 'escodidinho.webp',
  'fish and chips': 'fish-n-chips.webp',
  'hambúrguer artesanal': 'hamburgue.webp',
  'kebab': 'kebal.webp',
  'mousse de maracujá': 'mousse-de-maracuja.webp',
  'pão de queijo': 'pao-de-gueijo.webp',
  'petit gâteau': 'petii-gateau.webp',
  'strogonoff de frango': 'strogonoff.webp',
  'sushi combinado': 'sushi.webp',
  'tapioca recheada': 'tapioca.webp',
  'torta de limão': 'torta-de-limao.webp',
};

function slugifyFoodName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeStoredAssetKey(assetKey: string): string {
  return assetKey
    .trim()
    .replace(/^\/+/, '')
    .replace(new RegExp(`^${FOOD_IMAGE_BUCKET}/`), '')
    .replace(/^comidas\//, '');
}

function encodeStoragePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getFoodImageAssetKey(
  food: Pick<Food, 'name' | 'assetKey'>,
): string | null {
  if (food.assetKey && food.assetKey.trim().length > 0) {
    return normalizeStoredAssetKey(food.assetKey);
  }

  const normalizedName = food.name.trim().toLowerCase();
  const aliasedFileName = FOOD_IMAGE_FILE_NAME_BY_NAME[normalizedName];

  if (aliasedFileName) {
    return aliasedFileName;
  }

  const generatedSlug = slugifyFoodName(food.name);

  if (generatedSlug.length === 0) {
    return null;
  }

  return `${generatedSlug}.webp`;
}

export function getFoodImageUrl(
  food: Pick<Food, 'name' | 'assetKey'>,
): string | null {
  const assetKey = getFoodImageAssetKey(food);

  if (!assetKey || !supabaseEnvironment.url) {
    return null;
  }

  return `${supabaseEnvironment.url}/storage/v1/object/public/${FOOD_IMAGE_BUCKET}/${encodeStoragePath(assetKey)}`;
}

export { FOOD_IMAGE_BUCKET };
