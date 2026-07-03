import type { InterviewQuestion } from '@/types/interview';

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: 'sabor',
    prompt: 'Você quer doce ou salgado?',
    options: [
      {
        id: 'doce',
        label: 'Doce',
        emoji: '🍰',
        tagScores: [{ tag: 'doce', points: 5 }],
      },
      {
        id: 'salgado',
        label: 'Salgado',
        emoji: '🍕',
        tagScores: [{ tag: 'salgado', points: 5 }],
      },
    ],
  },
  {
    id: 'fome',
    prompt: 'Qual é o tamanho da fome?',
    options: [
      {
        id: 'pequena',
        label: 'Pequena',
        emoji: '🐣',
        tagScores: [{ tag: 'fome-pequena', points: 4 }],
      },
      {
        id: 'media',
        label: 'Média',
        emoji: '🙂',
        tagScores: [{ tag: 'fome-media', points: 4 }],
      },
      {
        id: 'grande',
        label: 'Grande',
        emoji: '🦁',
        tagScores: [{ tag: 'fome-grande', points: 4 }],
      },
    ],
  },
  {
    id: 'intensidade',
    prompt: 'Quer algo mais leve ou mais pesado?',
    options: [
      {
        id: 'leve',
        label: 'Mais leve',
        emoji: '🥗',
        tagScores: [{ tag: 'leve', points: 3 }],
      },
      {
        id: 'pesado',
        label: 'Mais pesado',
        emoji: '🍔',
        tagScores: [{ tag: 'pesado', points: 3 }],
      },
    ],
  },
  {
    id: 'temperatura',
    prompt: 'Quer algo quente ou frio?',
    options: [
      {
        id: 'quente',
        label: 'Quente',
        emoji: '♨️',
        tagScores: [{ tag: 'quente', points: 3 }],
      },
      {
        id: 'frio',
        label: 'Frio',
        emoji: '❄️',
        tagScores: [{ tag: 'frio', points: 3 }],
      },
    ],
  },
  {
    id: 'origem',
    prompt: 'Comida brasileira ou de fora?',
    options: [
      {
        id: 'brasileira',
        label: 'Brasileira',
        emoji: '🇧🇷',
        tagScores: [{ tag: 'brasileira', points: 3 }],
      },
      {
        id: 'estrangeira',
        label: 'De fora',
        emoji: '🌍',
        tagScores: [{ tag: 'estrangeira', points: 3 }],
      },
    ],
  },
  {
    id: 'preco',
    prompt: 'Quer algo mais barato ou tanto faz?',
    options: [
      {
        id: 'barato',
        label: 'Mais barato',
        emoji: '🪙',
        tagScores: [{ tag: 'barato', points: 2 }],
      },
      {
        id: 'tanto-faz',
        label: 'Tanto faz',
        emoji: '🤷',
        tagScores: [],
      },
    ],
  },
  {
    id: 'preparo',
    prompt: 'Quer algo rápido ou mais elaborado?',
    options: [
      {
        id: 'rapido',
        label: 'Rápido',
        emoji: '⚡',
        tagScores: [{ tag: 'rapido', points: 2 }],
      },
      {
        id: 'elaborado',
        label: 'Pode caprichar',
        emoji: '👩‍🍳',
        tagScores: [{ tag: 'elaborado', points: 2 }],
      },
    ],
  },
  {
    id: 'restricao',
    prompt: 'Tem alguma restrição importante?',
    options: [
      {
        id: 'vegetariana',
        label: 'Precisa ser vegetariana',
        emoji: '🌱',
        tagScores: [{ tag: 'vegetariano', points: 6 }],
        requiredTags: ['vegetariano'],
      },
      {
        id: 'nenhuma',
        label: 'Nenhuma dessas',
        emoji: '👍',
        tagScores: [],
      },
    ],
  },
];
