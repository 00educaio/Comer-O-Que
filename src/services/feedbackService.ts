import { supabase } from '@/lib/supabase';
import type { AppFeedbackInput } from '@/types/feedback';

const FEEDBACK_FALLBACK_ERROR =
  'Não conseguimos salvar sua mensagem agora. Tente novamente em instantes.';
const FEEDBACK_CONNECTION_ERROR =
  'Não conseguimos falar com a caixinha de sugestões agora. Confira sua internet e tente de novo.';

function requireFeedbackSupabase() {
  if (!supabase) {
    throw new Error(FEEDBACK_FALLBACK_ERROR);
  }

  return supabase;
}

function normalizeAppFeedback({
  message,
  name,
}: AppFeedbackInput): AppFeedbackInput {
  const normalizedName = name.trim();
  const normalizedMessage = message.trim();

  if (normalizedName.length < 2 || normalizedName.length > 80) {
    throw new Error('Escreva um nome entre 2 e 80 caracteres.');
  }

  if (normalizedMessage.length < 6 || normalizedMessage.length > 1200) {
    throw new Error('A mensagem precisa ter entre 6 e 1200 caracteres.');
  }

  return {
    message: normalizedMessage,
    name: normalizedName,
  };
}

function toFriendlyFeedbackError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message.trim();

    if (
      /Could not find the table 'public\.app_feedback' in the schema cache/i.test(message)
    ) {
      return new Error(
        'A tabela de sugestões ainda não existe no Supabase configurado. ' +
          'Aplique a migration do app_feedback no banco remoto e tente novamente.',
      );
    }

    if (/Failed to fetch|Network request failed|fetch failed|connection/i.test(message)) {
      return new Error(FEEDBACK_CONNECTION_ERROR);
    }

    if (message.length > 0) {
      return new Error(message);
    }
  }

  return new Error(FEEDBACK_FALLBACK_ERROR);
}

export async function submitAppFeedback(input: AppFeedbackInput): Promise<void> {
  try {
    const client = requireFeedbackSupabase();
    const normalizedFeedback = normalizeAppFeedback(input);

    const { error } = await client.from('app_feedback').insert({
      message: normalizedFeedback.message,
      name: normalizedFeedback.name,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw toFriendlyFeedbackError(error);
  }
}
