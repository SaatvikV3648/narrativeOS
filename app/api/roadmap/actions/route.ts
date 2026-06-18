import { NextResponse } from 'next/server';

import { calculateDynamicScorePath } from '@/lib/roadmap/progress';
import { roadmapToInsert, storedRoadmapToNarrative, type RoadmapActionStatus } from '@/lib/roadmap/mock';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { NarrativeRoadmaps } from '@/lib/supabase/types';

function isStatus(value: unknown): value is RoadmapActionStatus {
  return value === 'Not Started' || value === 'In Progress' || value === 'Completed';
}

export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'You need to sign in before updating roadmap actions.' }, { status: 401 });
  }

  let body: {
    roadmapId?: unknown;
    signalIndex?: unknown;
    builderIndex?: unknown;
    status?: unknown;
    evidenceText?: unknown;
    evidenceLink?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid roadmap action update.' }, { status: 400 });
  }

  if (typeof body.roadmapId !== 'string' || !body.roadmapId) {
    return NextResponse.json({ error: 'Missing roadmap id.' }, { status: 400 });
  }

  if (typeof body.signalIndex !== 'number' || typeof body.builderIndex !== 'number') {
    return NextResponse.json({ error: 'Missing roadmap action position.' }, { status: 400 });
  }

  if (!isStatus(body.status)) {
    return NextResponse.json({ error: 'Invalid roadmap action status.' }, { status: 400 });
  }

  const { data: roadmapData, error: loadError } = await supabase
    .from('narrative_roadmaps')
    .select('*')
    .eq('id', body.roadmapId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (loadError || !roadmapData) {
    return NextResponse.json({ error: 'Could not load this roadmap action.' }, { status: 404 });
  }

  const roadmap = storedRoadmapToNarrative(roadmapData as NarrativeRoadmaps);
  const signal = roadmap.signalBuilders[body.signalIndex];
  const action = signal?.builders[body.builderIndex];

  if (!signal || !action) {
    return NextResponse.json({ error: 'Could not find this roadmap action.' }, { status: 404 });
  }

  const evidenceText = typeof body.evidenceText === 'string' ? body.evidenceText.trim().slice(0, 1200) : '';
  const evidenceLink = typeof body.evidenceLink === 'string' ? body.evidenceLink.trim().slice(0, 400) : '';
  const completedAt = body.status === 'Completed'
    ? action.completedAt || new Date().toISOString()
    : null;

  roadmap.signalBuilders[body.signalIndex].builders[body.builderIndex] = {
    ...action,
    status: body.status,
    evidenceText,
    evidenceLink,
    completedAt,
  };

  const { data: updatedData, error: updateError } = await (supabase.from('narrative_roadmaps') as any)
    .update({
      signal_builders: roadmapToInsert(roadmap).signal_builders,
    })
    .eq('id', body.roadmapId)
    .eq('user_id', userData.user.id)
    .select('*')
    .single();

  if (updateError || !updatedData) {
    return NextResponse.json({ error: 'Could not save this roadmap action.' }, { status: 500 });
  }

  const updatedRoadmap = storedRoadmapToNarrative(updatedData as NarrativeRoadmaps);

  return NextResponse.json({
    roadmap: updatedRoadmap,
    proof: calculateDynamicScorePath(updatedRoadmap),
  });
}
