import type { NarrativeRoadmap, RoadmapOpportunity } from '@/lib/roadmap/mock';

export type RoadmapAction = RoadmapOpportunity['builders'][number] & {
  signal: string;
  signalIndex: number;
  builderIndex: number;
};

export function getRoadmapActions(signalBuilders: RoadmapOpportunity[]): RoadmapAction[] {
  return signalBuilders.flatMap((signalBuilder, signalIndex) =>
    signalBuilder.builders.map((builder, builderIndex) => ({
      ...builder,
      signal: signalBuilder.signal,
      signalIndex,
      builderIndex,
    })),
  );
}

export function hasActionEvidence(action: Pick<RoadmapAction, 'evidenceText' | 'evidenceLink'>) {
  return Boolean(action.evidenceText?.trim() || action.evidenceLink?.trim());
}

export function calculateProofScore(signalBuilders: RoadmapOpportunity[]) {
  const actions = getRoadmapActions(signalBuilders);
  const completedWithEvidence = actions.filter((action) => action.status === 'Completed' && hasActionEvidence(action)).length;
  const total = actions.length;

  return {
    completedWithEvidence,
    total,
    percentage: total ? Math.round((completedWithEvidence / total) * 100) : 0,
  };
}

export function calculateDerivedNarrativeScore(
  roadmap: Pick<NarrativeRoadmap, 'currentNarrative' | 'potentialScorePath' | 'signalBuilders'>,
) {
  const actions = getRoadmapActions(roadmap.signalBuilders);
  const currentScore = roadmap.currentNarrative.currentScore;
  const targetScore = (roadmap.potentialScorePath as NarrativeRoadmap['potentialScorePath'] & { targetScore?: number }).targetScore
    ?? roadmap.potentialScorePath.potentialScore;
  const completionBoost = actions.reduce((total, action) => {
    if (action.status !== 'Completed') return total;
    return total + (hasActionEvidence(action) ? 2 : 1);
  }, 0);

  return {
    currentScore,
    targetScore,
    completionBoost,
    derivedNarrativeScore: Math.min(targetScore, currentScore + completionBoost),
  };
}

export function calculateDynamicScorePath(roadmap: Pick<NarrativeRoadmap, 'potentialScorePath' | 'signalBuilders'>) {
  const proof = calculateProofScore(roadmap.signalBuilders);
  const currentScore = roadmap.potentialScorePath.currentScore;
  const potentialScore = roadmap.potentialScorePath.potentialScore;
  const availableGain = Math.max(0, potentialScore - currentScore);
  const earnedGain = Math.round(availableGain * (proof.percentage / 100));

  return {
    ...proof,
    currentScore,
    potentialScore,
    proofAdjustedScore: Math.min(potentialScore, currentScore + earnedGain),
    availableGain,
    earnedGain,
  };
}
