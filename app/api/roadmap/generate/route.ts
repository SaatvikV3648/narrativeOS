import { NextResponse } from 'next/server';

import { generationLimitMessage, getGenerationAccess } from '@/lib/generation-access';
import { storedAnalysisToNarrative } from '@/lib/narrative/mock';
import { generateNarrativeRoadmap } from '@/lib/roadmap/generate';
import { roadmapToInsert, storedRoadmapToNarrative } from '@/lib/roadmap/mock';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Activities, Analyses, Profiles } from '@/lib/supabase/types';

const roadmapGenerationLocks = new Map<string, number>();
const RECENT_GENERATION_WINDOW_MS = 20_000;

function safeRoadmapError(error: unknown) {
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
      message: 'Spikd roadmap analysis is temporarily unavailable. Please try again later.',
    };
  }

  if (status === 429) {
    return {
      status: 429,
      message: 'Spikd is receiving too many roadmap requests. Please wait a moment and try again.',
    };
  }

  if (status === 401) {
    return {
      status: 500,
      message: 'Spikd roadmap analysis is not configured correctly on the server.',
    };
  }

  if (
    error instanceof SyntaxError ||
    error instanceof Error && (
      error.message.includes('Roadmap response') ||
      error.message.includes('Roadmap action') ||
      error.message.includes('roadmap action') ||
      error.message.includes('Roadmap validation failed')
    )
  ) {
    return {
      status: 502,
      message: 'Spikd returned a roadmap it could not validate. Please try again.',
    };
  }

  return {
    status: 500,
    message: 'Could not generate your roadmap yet. Please try again.',
  };
}

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'You need to sign in before generating a roadmap.' }, { status: 401 });
  }

  if (roadmapGenerationLocks.has(userData.user.id)) {
    console.log('OpenAI call blocked: duplicate roadmap request in progress.', {
      route: 'roadmap',
      userId: userData.user.id,
    });
    return NextResponse.json({ error: 'Your roadmap is already generating. Please wait a moment.' }, { status: 409 });
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
    return NextResponse.json({ error: 'Complete onboarding before generating a roadmap.' }, { status: 404 });
  }

  const profile = profileData as Profiles;

  const { data: analysisData, error: analysisError } = await (supabase.from('analyses') as any)
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (analysisError || !analysisData) {
    return NextResponse.json({ error: 'Generate your narrative analysis before creating a roadmap.' }, { status: 404 });
  }

  const latestAnalysisRow = analysisData as Analyses;
  const latestAnalysis = storedAnalysisToNarrative(latestAnalysisRow);

  const { data: activityData, error: activitiesError } = await supabase
    .from('activities')
    .select('*')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true });

  if (activitiesError) {
    return NextResponse.json({ error: 'Could not load your activities for the roadmap.' }, { status: 500 });
  }

  const activities = (activityData as Activities[] | null) ?? [];

  if (!activities.length) {
    return NextResponse.json({ error: 'Add at least one activity before generating a roadmap.' }, { status: 400 });
  }

  const { data: recentRoadmapData } = await (supabase.from('narrative_roadmaps') as any)
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('analysis_id', latestAnalysisRow.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentRoadmapData?.created_at) {
    const recentAgeMs = Date.now() - new Date(recentRoadmapData.created_at).getTime();
    if (recentAgeMs >= 0 && recentAgeMs < RECENT_GENERATION_WINDOW_MS) {
      console.log('OpenAI cache hit: recent roadmap reused before generation.', {
        route: 'roadmap',
        userId: userData.user.id,
        recentAgeMs,
      });
      return NextResponse.json({
        roadmap: storedRoadmapToNarrative(recentRoadmapData),
        saved: true,
        reused: true,
        generator: 'cached',
        aiCalls: 0,
      });
    }
  }

  let roadmap;
  roadmapGenerationLocks.set(userData.user.id, Date.now());
  try {
    console.log('Roadmap generation route starting:', {
      route: 'roadmap',
      userId: userData.user.id,
      generator: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
      activityCount: activities.length,
      analysisId: latestAnalysisRow.id,
    });
    roadmap = await generateNarrativeRoadmap({
      profile,
      activities,
      analysis: latestAnalysis,
    });
  } catch (roadmapError) {
    const safeError = safeRoadmapError(roadmapError);
    console.error('Narrative roadmap generation failed:', {
      status: safeError.status,
      message: safeError.message,
      cause: roadmapError instanceof Error ? roadmapError.message : 'Unknown roadmap generation error',
    });
    roadmapGenerationLocks.delete(userData.user.id);
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }

  const { data: savedRoadmapData, error: saveError } = await (supabase.from('narrative_roadmaps') as any)
    .insert({
      user_id: userData.user.id,
      profile_id: profile.id,
      analysis_id: latestAnalysisRow.id,
      ...roadmapToInsert(roadmap),
    })
    .select('*')
    .single();

  if (saveError || !savedRoadmapData) {
    console.error('Narrative roadmap save failed:', {
      userId: userData.user.id,
      profileId: profile.id,
      analysisId: latestAnalysisRow.id,
      saveError,
    });
    roadmapGenerationLocks.delete(userData.user.id);
    return NextResponse.json({ error: 'Could not save your roadmap.' }, { status: 500 });
  }

  console.log('Narrative roadmap saved:', {
    userId: userData.user.id,
    roadmapId: savedRoadmapData.id,
    generator: roadmap.metadata.generator,
    model: roadmap.metadata.model,
    actionCount: roadmap.signalBuilders.flatMap((signal) => signal.builders).length,
    aiCalls: roadmap.metadata.generator === 'openai' ? 1 : 0,
  });

  roadmapGenerationLocks.delete(userData.user.id);

  return NextResponse.json({
    roadmap: storedRoadmapToNarrative(savedRoadmapData),
    saved: true,
    reused: false,
    generator: roadmap.metadata.generator,
    aiCalls: roadmap.metadata.generator === 'openai' ? 1 : 0,
  });
}
