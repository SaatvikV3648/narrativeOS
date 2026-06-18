import { NextResponse } from 'next/server';

import { generationLimitMessage, getGenerationAccess } from '@/lib/generation-access';
import { generateNarrative } from '@/lib/narrative/generate';
import { analysisToInsert, storedAnalysisToNarrative } from '@/lib/narrative/mock';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Activities, Profiles } from '@/lib/supabase/types';

const narrativeGenerationLocks = new Map<string, number>();
const RECENT_GENERATION_WINDOW_MS = 20_000;

function safeGenerationError(error: unknown) {
  const details = error as {
    status?: number;
    code?: string;
    type?: string;
    error?: {
      code?: string;
      type?: string;
    };
  };

  const status = details.status;
  const code = details.code || details.error?.code;
  const type = details.type || details.error?.type;

  if (status === 429 && (code === 'insufficient_quota' || type === 'insufficient_quota')) {
    return {
      status: 429,
      message: 'Spikd analysis is temporarily unavailable. Please try again later.',
    };
  }

  if (status === 429) {
    return {
      status: 429,
      message: 'Spikd is receiving too many analysis requests. Please wait a moment and try again.',
    };
  }

  if (status === 401) {
    return {
      status: 500,
      message: 'Spikd analysis is not configured correctly on the server.',
    };
  }

  if (error instanceof SyntaxError || error instanceof Error && error.message.includes('AI response')) {
    return {
      status: 502,
      message: 'Spikd returned a response it could not validate. Please try again.',
    };
  }

  return {
    status: 500,
    message: 'Could not generate your narrative yet. Please try again.',
  };
}

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'You need to sign in before generating a narrative.' }, { status: 401 });
  }

  if (narrativeGenerationLocks.has(userData.user.id)) {
    console.log('OpenAI call blocked: duplicate narrative request in progress.', {
      route: 'narrative',
      userId: userData.user.id,
    });
    return NextResponse.json({ error: 'Your narrative is already generating. Please wait a moment.' }, { status: 409 });
  }

  if (process.env.OPENAI_API_KEY) {
    const access = await getGenerationAccess(supabase as any, userData.user.id);
    if (!access.allowed && !access.isPro) {
      return NextResponse.json({
        error: generationLimitMessage(access.limit),
        upgradeRequired: true,
        used: access.used,
        limit: access.limit,
      }, { status: 402 });
    }
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (profileError || !profileData) {
    return NextResponse.json({ error: 'Complete onboarding before generating a narrative.' }, { status: 404 });
  }

  const profile = profileData as Profiles;

  if (!profile.onboarded) {
    return NextResponse.json({ error: 'Complete onboarding before generating a narrative.' }, { status: 409 });
  }

  const { data: activityData, error: activitiesError } = await supabase
    .from('activities')
    .select('*')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true });

  if (activitiesError) {
    return NextResponse.json({ error: 'Could not load your activities.' }, { status: 500 });
  }

  const activities = (activityData as Activities[] | null) ?? [];

  if (!activities.length) {
    return NextResponse.json({ error: 'Add at least one activity before generating a narrative.' }, { status: 400 });
  }

  const { data: recentAnalysisData } = await (supabase.from('analyses') as any)
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentAnalysisData?.created_at) {
    const recentAgeMs = Date.now() - new Date(recentAnalysisData.created_at).getTime();
    if (recentAgeMs >= 0 && recentAgeMs < RECENT_GENERATION_WINDOW_MS) {
      console.log('OpenAI cache hit: recent narrative reused before generation.', {
        route: 'narrative',
        userId: userData.user.id,
        recentAgeMs,
      });
      return NextResponse.json({
        analysis: storedAnalysisToNarrative(recentAnalysisData),
        saved: true,
        reused: true,
        generator: 'cached',
      });
    }
  }

  let analysis;
  narrativeGenerationLocks.set(userData.user.id, Date.now());
  try {
    console.log('Narrative generation route starting:', {
      route: 'narrative',
      userId: userData.user.id,
      generator: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
      activityCount: activities.length,
    });
    analysis = await generateNarrative({ profile, activities });
  } catch (generateError) {
    const safeError = safeGenerationError(generateError);
    console.error('Narrative generation failed:', {
      status: safeError.status,
      message: safeError.message,
      cause: generateError instanceof Error ? generateError.message : 'Unknown generation error',
    });
    narrativeGenerationLocks.delete(userData.user.id);
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }

  const { data: savedAnalysisData, error: saveError } = await (supabase.from('analyses') as any)
    .insert({
      user_id: userData.user.id,
      profile_id: profile.id,
      ...analysisToInsert(analysis),
    })
    .select('*')
    .single();

  if (saveError) {
    console.error('Narrative analysis save failed:', {
      route: 'narrative',
      userId: userData.user.id,
      profileId: profile.id,
      saveError,
    });
    narrativeGenerationLocks.delete(userData.user.id);
    return NextResponse.json({ error: 'Could not save your analysis.' }, { status: 500 });
  }

  console.log('Narrative analysis saved:', {
    route: 'narrative',
    userId: userData.user.id,
    analysisId: savedAnalysisData.id,
    generator: analysis.metadata.generator,
  });

  narrativeGenerationLocks.delete(userData.user.id);

  return NextResponse.json({
    analysis: storedAnalysisToNarrative(savedAnalysisData),
    saved: true,
    reused: false,
    generator: analysis.metadata.generator,
  });
}
