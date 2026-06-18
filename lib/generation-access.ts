import type { SupabaseClient } from '@supabase/supabase-js';

export const FREE_GENERATION_LIMIT = 2;

export type GenerationAccess = {
  used: number;
  limit: number;
  allowed: boolean;
  isPro: boolean;
};

export async function getGenerationAccess(supabase: SupabaseClient, userId: string): Promise<GenerationAccess> {
  const [{ count: analysisCount }, { count: roadmapCount }] = await Promise.all([
    (supabase.from('analyses') as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    (supabase.from('narrative_roadmaps') as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const used = (analysisCount ?? 0) + (roadmapCount ?? 0);

  return {
    used,
    limit: FREE_GENERATION_LIMIT,
    allowed: used < FREE_GENERATION_LIMIT,
    isPro: false,
  };
}

export function generationLimitMessage(limit = FREE_GENERATION_LIMIT) {
  return `You've used your ${limit} free analyses. Upgrade to Pro for unlimited narrative analysis, roadmap analysis, benchmark access, and future intelligence features.`;
}
