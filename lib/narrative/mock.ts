export type NarrativeSignal = {
  label: string;
  evidence: string;
};

export type RoadmapPreviewItem = {
  title: string;
  locked: true;
};

export type NarrativeArchetype =
  | 'Focused Founder'
  | 'Technical Builder'
  | 'Community Leader'
  | 'Emerging Researcher'
  | 'Civic Advocate'
  | 'Creative Performer'
  | 'Systems Explorer'
  | 'Builder'
  | 'Leader'
  | 'Researcher'
  | 'Advocate'
  | 'Explorer'
  | 'Performer';

export type ScoreBreakdown = {
  coherence: number;
  depth: number;
  impact: number;
  differentiation: number;
};

export type NarrativeAnalysis = {
  archetype: NarrativeArchetype;
  archetypeDetails: {
    description: string;
    strengths: string[];
    blindSpots: string[];
  };
  score: number;
  potentialScore: number;
  scoreBreakdown: ScoreBreakdown;
  narrative: string;
  signals: [NarrativeSignal, NarrativeSignal, NarrativeSignal];
  gap: {
    label: string;
    summary: string;
  };
  admissionsImpact: {
    headline: string;
    body: string;
  };
  proPreview: {
    headline: string;
    lockedItems: string[];
  };
  roadmapPreview: [RoadmapPreviewItem, RoadmapPreviewItem, RoadmapPreviewItem];
  metadata: {
    generator: 'mock' | 'openai';
    version: number;
  };
};

type StoredAnalysisLike = {
  id?: string;
  archetype: string;
  score: number;
  narrative: string;
  signals: unknown;
  biggest_gap: unknown;
  admissions_impact: unknown;
  created_at?: string;
};

export const mockNarrativeAnalysis: NarrativeAnalysis = {
  archetype: 'Focused Founder',
  archetypeDetails: {
    description:
      'A student whose strongest story comes from repeatedly creating ventures, tests, and market-facing projects around a clear problem space.',
    strengths: ['High initiative', 'Clear ownership', 'Bias toward execution'],
    blindSpots: ['External validation', 'Leadership scale', 'Depth of proof'],
  },
  score: 81,
  potentialScore: 92,
  scoreBreakdown: {
    coherence: 88,
    depth: 78,
    impact: 76,
    differentiation: 82,
  },
  narrative:
    'Your application currently reads as a focused entrepreneurial story: you notice problems, build small experiments, and keep returning to the same kind of opportunity instead of collecting unrelated activities. The strongest signal is ownership. To move from impressive to truly compelling, the story needs more outside proof that your work changed behavior, earned validation, or created value beyond your own learning.',
  signals: [
    {
      label: 'Narrative Coherence',
      evidence: 'Your activities point in the same direction, making the profile feel intentional rather than scattered.',
    },
    {
      label: 'Ownership',
      evidence: 'The profile suggests you create your own opportunities instead of only participating in existing ones.',
    },
    {
      label: 'Market Curiosity',
      evidence: 'Your work appears connected to real users, customers, or financial decisions, which gives the story practical energy.',
    },
  ],
  gap: {
    label: 'External Validation',
    summary:
      'The highest-leverage missing signal is proof from outside your own effort: customers, revenue, awards, partnerships, press, selective programs, or measurable adoption.',
  },
  admissionsImpact: {
    headline: 'Your story is coherent, but the proof layer is still catching up.',
    body:
      'Competitive entrepreneurship-oriented applicants often show not only that they built something, but that the outside world responded. Your current narrative has a clear throughline and strong initiative. The next jump comes from evidence that your work mattered to people beyond you.',
  },
  proPreview: {
    headline: 'Prescription unlocks the exact moves that could lift this story.',
    lockedItems: [
      'Recommended activity pivots',
      'Recommended leadership opportunities',
      'Recommended competitions',
      'Recommended summer opportunities',
      'Recommended narrative positioning',
      'Month-by-month roadmap',
      'Expected score improvement',
    ],
  },
  roadmapPreview: [
    { title: 'Earn external validation for the strongest venture', locked: true },
    { title: 'Turn one project into measurable user impact', locked: true },
    { title: 'Position the founder story around one durable problem', locked: true },
  ],
  metadata: {
    generator: 'mock',
    version: 1,
  },
};

export function analysisToInsert(analysis: NarrativeAnalysis) {
  return {
    archetype: analysis.archetype,
    score: analysis.score,
    narrative: analysis.narrative,
    signals: analysis.signals,
    biggest_gap: {
      ...analysis.gap,
      potentialScore: analysis.potentialScore,
      scoreBreakdown: analysis.scoreBreakdown,
    },
    admissions_impact: {
      ...analysis.admissionsImpact,
      archetypeDetails: analysis.archetypeDetails,
      proPreview: analysis.proPreview,
      roadmapPreview: analysis.roadmapPreview,
    },
  };
}

export function storedAnalysisToNarrative(row: StoredAnalysisLike): NarrativeAnalysis {
  const signals = Array.isArray(row.signals) && row.signals.length >= 3
    ? row.signals.slice(0, 3)
    : mockNarrativeAnalysis.signals;

  const gap = row.biggest_gap && typeof row.biggest_gap === 'object'
    ? row.biggest_gap
    : mockNarrativeAnalysis.gap;

  const admissionsImpact = row.admissions_impact && typeof row.admissions_impact === 'object'
    ? row.admissions_impact
    : mockNarrativeAnalysis.admissionsImpact;

  const gapRecord = gap as Partial<NarrativeAnalysis['gap']> & {
    potentialScore?: unknown;
    scoreBreakdown?: unknown;
  };
  const admissionsRecord = admissionsImpact as Partial<NarrativeAnalysis['admissionsImpact']> & {
    archetypeDetails?: unknown;
    proPreview?: unknown;
    roadmapPreview?: unknown;
  };

  return {
    archetype: row.archetype as NarrativeAnalysis['archetype'],
    score: row.score,
    potentialScore: typeof gapRecord.potentialScore === 'number'
      ? gapRecord.potentialScore
      : mockNarrativeAnalysis.potentialScore,
    scoreBreakdown: gapRecord.scoreBreakdown && typeof gapRecord.scoreBreakdown === 'object'
      ? gapRecord.scoreBreakdown as ScoreBreakdown
      : mockNarrativeAnalysis.scoreBreakdown,
    narrative: row.narrative,
    signals: signals as NarrativeAnalysis['signals'],
    gap: {
      label: typeof gapRecord.label === 'string' ? gapRecord.label : mockNarrativeAnalysis.gap.label,
      summary: typeof gapRecord.summary === 'string' ? gapRecord.summary : mockNarrativeAnalysis.gap.summary,
    },
    admissionsImpact: {
      headline: typeof admissionsRecord.headline === 'string'
        ? admissionsRecord.headline
        : mockNarrativeAnalysis.admissionsImpact.headline,
      body: typeof admissionsRecord.body === 'string'
        ? admissionsRecord.body
        : mockNarrativeAnalysis.admissionsImpact.body,
    },
    archetypeDetails: admissionsRecord.archetypeDetails && typeof admissionsRecord.archetypeDetails === 'object'
      ? admissionsRecord.archetypeDetails as NarrativeAnalysis['archetypeDetails']
      : mockNarrativeAnalysis.archetypeDetails,
    proPreview: admissionsRecord.proPreview && typeof admissionsRecord.proPreview === 'object'
      ? admissionsRecord.proPreview as NarrativeAnalysis['proPreview']
      : mockNarrativeAnalysis.proPreview,
    roadmapPreview: Array.isArray(admissionsRecord.roadmapPreview) && admissionsRecord.roadmapPreview.length >= 3
      ? admissionsRecord.roadmapPreview.slice(0, 3) as NarrativeAnalysis['roadmapPreview']
      : mockNarrativeAnalysis.roadmapPreview,
    metadata: mockNarrativeAnalysis.metadata,
  };
}
