import type { RouletteGroup } from '@/types/catalog';

export const fallbackCatalog: RouletteGroup[] = [
  {
    id: 'sobremesa',
    name: 'Sobremesa',
    slug: 'sobremesa',
    description: 'Para quando sempre cabe um docinho.',
    emoji: '🍰',
    foods: [],
  },
  {
    id: 'fome-grande',
    name: 'Fome grande',
    slug: 'fome-grande',
    description: 'Pratos que resolvem uma fome de respeito.',
    emoji: '🍔',
    foods: [],
  },
  {
    id: 'regional',
    name: 'Culinária regional',
    slug: 'regional',
    description: 'Sabores brasileiros para matar a saudade.',
    emoji: '🇧🇷',
    foods: [],
  },
  {
    id: 'estrangeira',
    name: 'Culinária estrangeira',
    slug: 'estrangeira',
    description: 'Uma pequena viagem sem sair da mesa.',
    emoji: '🌍',
    foods: [],
  },
];
