import { mockNarrativeAnalysis, type NarrativeAnalysis, type NarrativeSignal, type ScoreBreakdown } from '@/lib/narrative/mock';

const archetypes: NarrativeAnalysis['archetype'][] = [
  'Focused Founder',
  'Technical Builder',
  'Community Leader',
  'Emerging Researcher',
  'Civic Advocate',
  'Creative Performer',
  'Systems Explorer',
  'Builder',
  'Leader',
  'Researcher',
  'Advocate',
  'Explorer',
  'Performer',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function validateStringArray(value: unknown, label: string, minItems = 1) {
  if (!Array.isArray(value) || value.length < minItems) {
    throw new Error(`AI response must include ${label}.`);
  }

  const items = value.map((item) => readString(item)).filter(Boolean);
  if (items.length < minItems) {
    throw new Error(`AI response must include ${label}.`);
  }

  return items;
}

function validateScore(value: unknown, label: string) {
  const score = typeof value === 'number' ? Math.round(value) : Number.NaN;
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new Error(`AI response ${label} must be an integer from 0 to 100.`);
  }

  return score;
}

function validateScoreBreakdown(value: unknown): ScoreBreakdown {
  if (!isRecord(value)) {
    throw new Error('AI response must include score breakdown.');
  }

  return {
    coherence: validateScore(value.coherence, 'coherence score'),
    depth: validateScore(value.depth, 'depth score'),
    impact: validateScore(value.impact, 'impact score'),
    differentiation: validateScore(value.differentiation, 'differentiation score'),
  };
}

function validateSignals(value: unknown): [NarrativeSignal, NarrativeSignal, NarrativeSignal] {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new Error('AI response must include exactly 3 narrative signals.');
  }

  const signals = value.map((signal) => {
    if (!isRecord(signal)) {
      throw new Error('Each narrative signal must be an object.');
    }

    const label = readString(signal.label);
    const evidence = readString(signal.evidence);

    if (!label || !evidence) {
      throw new Error('Each narrative signal must include label and evidence.');
    }

    return { label, evidence };
  });

  return signals as [NarrativeSignal, NarrativeSignal, NarrativeSignal];
}

export function validateNarrativeAnalysis(value: unknown): NarrativeAnalysis {
  if (!isRecord(value)) {
    throw new Error('AI response must be a JSON object.');
  }

  const archetype = readString(value.archetype) as NarrativeAnalysis['archetype'];
  if (!archetypes.includes(archetype)) {
    throw new Error('AI response included an unsupported archetype.');
  }

  const score = validateScore(value.score, 'score');
  const potentialScore = validateScore(value.potentialScore, 'potential score');
  if (potentialScore < score) {
    throw new Error('AI response potential score must be greater than or equal to current score.');
  }

  const scoreBreakdown = validateScoreBreakdown(value.scoreBreakdown);

  const narrative = readString(value.narrative);
  if (!narrative || narrative.split(/\s+/).length < 40) {
    throw new Error('AI response narrative is too short.');
  }

  const gap = isRecord(value.gap) ? value.gap : null;
  const gapLabel = readString(gap?.label);
  const gapSummary = readString(gap?.summary);
  if (!gapLabel || !gapSummary) {
    throw new Error('AI response must include a biggest gap label and summary.');
  }

  const archetypeDetails = isRecord(value.archetypeDetails) ? value.archetypeDetails : null;
  const archetypeDescription = readString(archetypeDetails?.description);
  const archetypeStrengths = validateStringArray(archetypeDetails?.strengths, 'archetype strengths', 2);
  const archetypeBlindSpots = validateStringArray(archetypeDetails?.blindSpots, 'archetype blind spots', 2);
  if (!archetypeDescription) {
    throw new Error('AI response must include an archetype description.');
  }

  const admissionsImpact = isRecord(value.admissionsImpact) ? value.admissionsImpact : null;
  const impactHeadline = readString(admissionsImpact?.headline);
  const impactBody = readString(admissionsImpact?.body);
  if (!impactHeadline || !impactBody) {
    throw new Error('AI response must include admissions impact headline and body.');
  }

  const proPreview = isRecord(value.proPreview) ? value.proPreview : null;
  const proHeadline = readString(proPreview?.headline);
  const proItems = validateStringArray(proPreview?.lockedItems, 'Pro preview locked items', 5);
  if (!proHeadline) {
    throw new Error('AI response must include a Pro preview headline.');
  }

  return {
    archetype,
    archetypeDetails: {
      description: archetypeDescription,
      strengths: archetypeStrengths,
      blindSpots: archetypeBlindSpots,
    },
    score,
    potentialScore,
    scoreBreakdown,
    narrative,
    signals: validateSignals(value.signals),
    gap: {
      label: gapLabel,
      summary: gapSummary,
    },
    admissionsImpact: {
      headline: impactHeadline,
      body: impactBody,
    },
    proPreview: {
      headline: proHeadline,
      lockedItems: proItems,
    },
    roadmapPreview: mockNarrativeAnalysis.roadmapPreview,
    metadata: {
      generator: 'mock',
      version: 1,
    },
  };
}
