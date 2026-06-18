import type { NarrativeRoadmap, RoadmapActionStatus, RoadmapActionVerb, RoadmapOpportunity, RoadmapSignal, RoadmapSpikeTag, ScorePathStep } from '@/lib/roadmap/mock';

const approvedVerbs: RoadmapActionVerb[] = ['Submit', 'Email', 'Register', 'Build', 'Publish', 'Apply', 'Contact', 'Create', 'Enter', 'Launch'];
const approvedSpikeTags: RoadmapSpikeTag[] = ['Business', 'AI/ML', 'Research', 'Performing Arts', 'Community Impact', 'Civic Leadership', 'Engineering', 'Writing', 'Athletics'];
const fallbackDetails = {
  whyThisMatters: 'This gives the roadmap enough context to stay useful while Spikd preserves the generated roadmap.',
  affectsNarrative: 'This section explains how the action changes the way the application story is read.',
  evidencePresent: 'Evidence comes from the saved profile, activities, and latest narrative analysis.',
  evidenceMissing: 'The roadmap identifies proof that would make the story stronger.',
  futureConnection: 'Future roadmap updates can improve this section as more evidence is saved.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pick(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in record) return record[key];
  }
  return undefined;
}

function pickString(record: Record<string, unknown>, keys: string[], fallback = '') {
  const value = pick(record, keys);
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function pickNumber(record: Record<string, unknown>, keys: string[], fallback: number) {
  const value = pick(record, keys);
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Math.round(Number(value));
  return fallback;
}

function normalizeVerb(value: unknown, title: string): RoadmapActionVerb {
  const titleVerb = title.split(/\s+/)[0] || '';
  if (approvedVerbs.includes(titleVerb as RoadmapActionVerb)) {
    return titleVerb as RoadmapActionVerb;
  }

  const rawVerb = typeof value === 'string' && value.trim() ? value.trim() : '';
  return approvedVerbs.includes(rawVerb as RoadmapActionVerb) ? rawVerb as RoadmapActionVerb : 'Build';
}

function normalizeSpikeTag(value: unknown): RoadmapSpikeTag {
  return approvedSpikeTags.includes(value as RoadmapSpikeTag) ? value as RoadmapSpikeTag : 'Business';
}

function normalizeDifficulty(value: unknown): 'Low' | 'Medium' | 'High' {
  if (value === 'Low' || value === 'Medium' || value === 'High') return value;
  if (value === 'low') return 'Low';
  if (value === 'high') return 'High';
  return 'Medium';
}

function normalizeLevel(value: unknown): 'participation' | 'leadership' | 'recognition' {
  if (value === 'participation' || value === 'leadership' || value === 'recognition') return value;
  return 'participation';
}

function normalizeStringArray(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const normalized = value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim());
    if (normalized.length) return normalized;
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return fallback;
}

function normalizeDetails(value: unknown): NarrativeRoadmap['currentNarrative']['details'] {
  const record = isRecord(value) ? value : {};
  return {
    whyThisMatters: pickString(record, ['whyThisMatters', 'why_this_matters'], fallbackDetails.whyThisMatters),
    affectsNarrative: pickString(record, ['affectsNarrative', 'affects_narrative'], fallbackDetails.affectsNarrative),
    evidencePresent: pickString(record, ['evidencePresent', 'evidence_present'], fallbackDetails.evidencePresent),
    evidenceMissing: pickString(record, ['evidenceMissing', 'evidence_missing'], fallbackDetails.evidenceMissing),
    futureConnection: pickString(record, ['futureConnection', 'future_connection'], fallbackDetails.futureConnection),
  };
}

function normalizeAction(value: unknown, index: number, signal: string): RoadmapOpportunity['builders'][number] | null {
  if (!isRecord(value)) return null;

  const title = pickString(value, ['title'], '');
  const description = pickString(value, ['description', 'action'], title || 'Build a proof artifact for this roadmap signal.');
  const verb = normalizeVerb(pick(value, ['verb']), title);
  const safeTitle = title || `${verb} a proof artifact for ${signal} within 14 days`;
  const timeframe = pickString(value, ['timeframe', 'deadline'], 'within 14 days');
  const signalGapClosed = pickString(value, ['signalGapClosed', 'signal_gap_closed', 'signal'], signal || 'Narrative Cohesion');
  const whyItMatters = pickString(
    value,
    ['whyItMatters', 'why_it_matters', 'why'],
    `This strengthens ${signalGapClosed} by turning the roadmap action into visible evidence.`,
  );
  const proofType = pickString(value, ['proofType', 'proof_type'], 'proof artifact');

  return {
    rank: Math.max(1, Math.min(5, pickNumber(value, ['rank'], index + 1))),
    title: safeTitle,
    verb,
    action: pickString(value, ['action'], description),
    description,
    timeframe,
    deadline: pickString(value, ['deadline', 'timeframe'], timeframe),
    signalGapClosed,
    spikeTag: normalizeSpikeTag(pick(value, ['spikeTag', 'spike_tag'])),
    signalStrengthened: pickString(value, ['signalStrengthened', 'signal_strengthened', 'signal'], signalGapClosed),
    whyItMatters,
    whyItFits: pickString(value, ['whyItFits', 'why_it_fits'], whyItMatters),
    narrativeImpact: pickString(value, ['narrativeImpact', 'narrative_impact'], whyItMatters),
    narrativeShiftCreated: pickString(value, ['narrativeShiftCreated', 'narrative_shift_created'], `Current Narrative -> ${signalGapClosed}-backed Narrative`),
    estimatedScoreImpact: pickString(value, ['estimatedScoreImpact', 'estimated_score_impact', 'score_impact'], '+1 to +3'),
    difficulty: normalizeDifficulty(pick(value, ['difficulty'])),
    proofType,
    level: normalizeLevel(pick(value, ['level'])),
    evidenceRequired: normalizeStringArray(pick(value, ['evidenceRequired', 'evidence_required']), [proofType]),
    status: 'Not Started',
    evidenceText: '',
    evidenceLink: '',
    completedAt: null,
  };
}

function actionToSignalBuilder(action: RoadmapOpportunity['builders'][number], fallbackSignal: string): RoadmapOpportunity {
  return {
    signal: action.signalGapClosed || fallbackSignal,
    currentEvidence: 'Current evidence comes from the saved profile, activities, and latest analysis.',
    missingEvidence: `The profile needs more visible proof of ${action.signalGapClosed || fallbackSignal}.`,
    whyItMatters: action.whyItMatters,
    narrativeImpact: action.narrativeImpact,
    builders: [action],
  };
}

function normalizeSignalBuilder(value: unknown, index: number): RoadmapOpportunity | null {
  if (!isRecord(value)) return null;
  const signal = pickString(value, ['signal'], `Roadmap Signal ${index + 1}`);
  const rawBuilders = pick(value, ['builders', 'actions', 'roadmap']);
  const buildersArray = Array.isArray(rawBuilders) ? rawBuilders : [value];
  const builder = normalizeAction(buildersArray[0], index, signal);
  if (!builder) return null;

  return {
    signal,
    currentEvidence: pickString(value, ['currentEvidence', 'current_evidence'], 'Current evidence comes from the saved profile, activities, and latest analysis.'),
    missingEvidence: pickString(value, ['missingEvidence', 'missing_evidence'], `The profile needs more visible proof of ${builder.signalGapClosed}.`),
    whyItMatters: pickString(value, ['whyItMatters', 'why_it_matters'], builder.whyItMatters),
    narrativeImpact: pickString(value, ['narrativeImpact', 'narrative_impact'], builder.narrativeImpact),
    builders: [builder],
  };
}

function normalizeRoadmap(value: unknown) {
  if (!isRecord(value)) return value;

  const currentNarrativeValue = pick(value, ['currentNarrative', 'current_narrative']);
  const currentNarrativeRecord = isRecord(currentNarrativeValue) ? currentNarrativeValue : {};
  const nextStageValue = pick(value, ['nextNarrativeStage', 'next_narrative_stage']);
  const nextStageRecord = isRecord(nextStageValue) ? nextStageValue : {};
  const scorePathValue = pick(value, ['potentialScorePath', 'potential_score_path']);
  const scorePathRecord = isRecord(scorePathValue) ? scorePathValue : {};
  const projectionValue = pick(value, ['futureNarrativeProjection', 'future_narrative_projection']);
  const projectionRecord = isRecord(projectionValue) ? projectionValue : {};
  const tensionValue = pick(value, ['narrativeTension', 'narrative_tension']);
  const tensionRecord = isRecord(tensionValue) ? tensionValue : {};
  const riskValue = pick(value, ['narrativeRisk', 'narrative_risk']);
  const riskRecord = isRecord(riskValue) ? riskValue : {};

  const rawSignalBuilders = pick(value, ['signalBuilders', 'signal_builders']);
  const rawFlatActions = pick(value, ['roadmap', 'actions']);
  const signalBuilders = (Array.isArray(rawSignalBuilders) ? rawSignalBuilders : [])
    .map((item, index) => normalizeSignalBuilder(item, index))
    .filter((item): item is RoadmapOpportunity => Boolean(item));
  const flatActionBuilders = !signalBuilders.length && Array.isArray(rawFlatActions)
    ? rawFlatActions.map((item, index) => normalizeAction(item, index, `Roadmap Signal ${index + 1}`)).filter((item): item is RoadmapOpportunity['builders'][number] => Boolean(item))
    : [];
  const normalizedSignalBuilders = (signalBuilders.length ? signalBuilders : flatActionBuilders.map((action, index) => actionToSignalBuilder(action, `Roadmap Signal ${index + 1}`)))
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      builders: item.builders.slice(0, 1).map((builder) => ({ ...builder, rank: index + 1 })),
    }));

  if (normalizedSignalBuilders.length < 5) {
    console.warn('Narrative roadmap repaired with fewer than 5 actions:', {
      actionCount: normalizedSignalBuilders.length,
      missingActions: 5 - normalizedSignalBuilders.length,
    });
  }

  const missingSignalsValue = pick(value, ['missingSignals', 'missing_signals']);
  const rawMissingSignals = Array.isArray(missingSignalsValue) ? missingSignalsValue : [];
  const missingSignals = rawMissingSignals.length ? rawMissingSignals.map((item) => {
    const record = isRecord(item) ? item : {};
    return {
      label: pickString(record, ['label'], 'Narrative Signal'),
      whyItMatters: pickString(record, ['whyItMatters', 'why_it_matters'], 'This signal affects how clearly the application story reads.'),
      evidencePresent: pickString(record, ['evidencePresent', 'evidence_present'], 'Current evidence comes from the saved profile and activities.'),
      evidenceMissing: pickString(record, ['evidenceMissing', 'evidence_missing'], 'More proof would make this signal stronger.'),
      strongerNarrativePattern: pickString(record, ['strongerNarrativePattern', 'stronger_narrative_pattern'], 'Stronger narratives turn this signal into visible evidence.'),
    };
  }) : normalizedSignalBuilders.map((item) => ({
    label: item.signal,
    whyItMatters: item.whyItMatters,
    evidencePresent: item.currentEvidence,
    evidenceMissing: item.missingEvidence,
    strongerNarrativePattern: item.narrativeImpact,
  }));

  const currentScore = pickNumber(currentNarrativeRecord, ['currentScore', 'current_score'], pickNumber(scorePathRecord, ['currentScore', 'current_score'], 70));
  const potentialScore = pickNumber(scorePathRecord, ['potentialScore', 'potential_score'], Math.min(97, currentScore + 10));

  return {
    currentNarrative: {
      archetype: pickString(currentNarrativeRecord, ['archetype'], 'Builder'),
      summary: pickString(currentNarrativeRecord, ['summary'], pickString(value, ['current_narrative', 'currentNarrative'], 'Your roadmap is built from your saved profile, activities, and latest narrative analysis.')),
      strongestSignals: normalizeStringArray(pick(currentNarrativeRecord, ['strongestSignals', 'strongest_signals']), ['Initiative']),
      currentScore,
      signalImpact: pickString(currentNarrativeRecord, ['signalImpact', 'signal_impact'], normalizedSignalBuilders[0]?.signal || 'Narrative Cohesion'),
      scoreRelevance: pickString(currentNarrativeRecord, ['scoreRelevance', 'score_relevance'], 'This score can move as roadmap actions turn into evidence.'),
      details: normalizeDetails(pick(currentNarrativeRecord, ['details'])),
    },
    narrativeTension: {
      headline: pickString(tensionRecord, ['headline'], 'The story has promise, but needs stronger proof.'),
      summary: pickString(tensionRecord, ['summary'], 'The roadmap focuses on turning existing activity into visible evidence.'),
      signalImpact: pickString(tensionRecord, ['signalImpact', 'signal_impact'], normalizedSignalBuilders[0]?.signal || 'Narrative Cohesion'),
      scoreRelevance: pickString(tensionRecord, ['scoreRelevance', 'score_relevance'], 'Resolving this tension supports score movement.'),
      details: normalizeDetails(pick(tensionRecord, ['details'])),
    },
    missingSignals,
    narrativeRisk: {
      headline: pickString(riskRecord, ['headline'], 'The reader may need clearer proof.'),
      summary: pickString(riskRecord, ['summary'], 'Without concrete artifacts, strong work can read as self-reported potential.'),
      signalImpact: pickString(riskRecord, ['signalImpact', 'signal_impact'], normalizedSignalBuilders[0]?.signal || 'Narrative Cohesion'),
      scoreRelevance: pickString(riskRecord, ['scoreRelevance', 'score_relevance'], 'Reducing this risk can make the story more credible.'),
      details: normalizeDetails(pick(riskRecord, ['details'])),
    },
    nextNarrativeStage: {
      currentStage: pickString(nextStageRecord, ['currentStage', 'current_stage'], 'Current Stage'),
      nextStage: pickString(nextStageRecord, ['nextStage', 'next_stage'], pickString(value, ['next_stage'], 'Validated Builder')),
      futureStage: pickString(nextStageRecord, ['futureStage', 'future_stage'], 'Recognized Builder'),
      explanation: pickString(nextStageRecord, ['explanation'], pickString(value, ['next_stage_description'], 'The next stage begins when the student turns activity into visible proof.')),
      signalImpact: pickString(nextStageRecord, ['signalImpact', 'signal_impact'], normalizedSignalBuilders.map((item) => item.signal).join(', ') || 'Narrative Cohesion'),
      scoreRelevance: pickString(nextStageRecord, ['scoreRelevance', 'score_relevance'], 'The next stage explains how the potential score becomes realistic.'),
      details: normalizeDetails(pick(nextStageRecord, ['details'])),
    },
    signalBuilders: normalizedSignalBuilders,
    potentialScorePath: {
      currentScore,
      potentialScore,
      steps: Array.isArray(scorePathRecord.steps) && scorePathRecord.steps.length
        ? scorePathRecord.steps.map((step, index) => {
            const stepRecord = isRecord(step) ? step : {};
            return {
              from: pickNumber(stepRecord, ['from'], index === 0 ? currentScore : Math.min(potentialScore, currentScore + 5)),
              to: pickNumber(stepRecord, ['to'], index === 0 ? Math.min(potentialScore, currentScore + 5) : potentialScore),
              narrativeChange: pickString(stepRecord, ['narrativeChange', 'narrative_change'], 'Complete roadmap actions and attach evidence.'),
              explanation: pickString(stepRecord, ['explanation'], 'Evidence makes the narrative more credible.'),
            };
          })
        : [
            {
              from: currentScore,
              to: Math.min(potentialScore, currentScore + 5),
              narrativeChange: 'Complete the first roadmap actions and attach evidence.',
              explanation: 'Evidence makes the narrative more credible without adding random activities.',
            },
          ],
      signalImpact: pickString(scorePathRecord, ['signalImpact', 'signal_impact'], normalizedSignalBuilders.map((item) => item.signal).join(', ') || 'Proof'),
      scoreRelevance: pickString(scorePathRecord, ['scoreRelevance', 'score_relevance'], 'Score movement depends on completing actions and saving proof.'),
      details: normalizeDetails(pick(scorePathRecord, ['details'])),
    },
    futureNarrativeProjection: {
      headline: pickString(projectionRecord, ['headline'], 'A more evidence-backed narrative.'),
      summary: pickString(projectionRecord, ['summary'], 'The future story becomes stronger as actions produce proof.'),
      readerInterpretation: pickString(projectionRecord, ['readerInterpretation', 'reader_interpretation'], 'Readers would see a clearer pattern of initiative, depth, and impact.'),
      signalImpact: pickString(projectionRecord, ['signalImpact', 'signal_impact'], normalizedSignalBuilders.map((item) => item.signal).join(', ') || 'Proof'),
      scoreRelevance: pickString(projectionRecord, ['scoreRelevance', 'score_relevance'], 'The projection is tied to evidence, not promises.'),
      details: normalizeDetails(pick(projectionRecord, ['details'])),
    },
  };
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Roadmap response is missing ${key}.`);
  }
  return value.trim();
}

function readOptionalString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function readOptionalNullableString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readStatus(record: Record<string, unknown>): RoadmapActionStatus {
  const value = record.status;
  if (value === 'Not Started' || value === 'In Progress' || value === 'Completed') {
    return value;
  }
  return 'Not Started';
}

function readNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Roadmap response is missing numeric ${key}.`);
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function readRank(record: Record<string, unknown>) {
  const rank = readNumber(record, 'rank');
  if (rank < 1 || rank > 5) {
    throw new Error('Roadmap action rank must be between 1 and 5.');
  }
  return rank;
}

function readVerb(record: Record<string, unknown>, title: string): RoadmapActionVerb {
  const verb = readString(record, 'verb');
  if (!approvedVerbs.includes(verb as RoadmapActionVerb)) {
    throw new Error('Roadmap action uses an unapproved verb.');
  }
  if (!title.startsWith(`${verb} `)) {
    throw new Error('Roadmap action title must start with its approved verb.');
  }
  return verb as RoadmapActionVerb;
}

function readDifficulty(record: Record<string, unknown>): 'Low' | 'Medium' | 'High' {
  const difficulty = readString(record, 'difficulty');
  if (difficulty !== 'Low' && difficulty !== 'Medium' && difficulty !== 'High') {
    throw new Error('Roadmap action has invalid difficulty.');
  }
  return difficulty;
}

function readSpikeTag(record: Record<string, unknown>): RoadmapSpikeTag {
  const spikeTag = readString(record, 'spikeTag');
  if (!approvedSpikeTags.includes(spikeTag as RoadmapSpikeTag)) {
    throw new Error('Roadmap action has invalid spike_tag.');
  }
  return spikeTag as RoadmapSpikeTag;
}

function readLevel(record: Record<string, unknown>): 'participation' | 'leadership' | 'recognition' {
  const level = readString(record, 'level');
  if (level !== 'participation' && level !== 'leadership' && level !== 'recognition') {
    throw new Error('Roadmap action has invalid level.');
  }
  return level;
}

function readStringArray(record: Record<string, unknown>, key: string, min = 1) {
  const value = record[key];
  if (!Array.isArray(value) || value.length < min || !value.every((item) => typeof item === 'string' && item.trim())) {
    throw new Error(`Roadmap response is missing ${key}.`);
  }
  return value.map((item) => String(item).trim());
}

function readDetails(record: Record<string, unknown>) {
  const details = record.details;
  if (!isRecord(details)) {
    throw new Error('Roadmap response is missing details.');
  }

  return {
    whyThisMatters: readString(details, 'whyThisMatters'),
    affectsNarrative: readString(details, 'affectsNarrative'),
    evidencePresent: readString(details, 'evidencePresent'),
    evidenceMissing: readString(details, 'evidenceMissing'),
    futureConnection: readString(details, 'futureConnection'),
  };
}

function readCurrentNarrative(value: unknown): NarrativeRoadmap['currentNarrative'] {
  if (!isRecord(value)) throw new Error('Roadmap response is missing currentNarrative.');

  return {
    archetype: readString(value, 'archetype'),
    summary: readString(value, 'summary'),
    strongestSignals: readStringArray(value, 'strongestSignals', 1),
    currentScore: readNumber(value, 'currentScore'),
    signalImpact: readString(value, 'signalImpact'),
    scoreRelevance: readString(value, 'scoreRelevance'),
    details: readDetails(value),
  };
}

function readMilestone(value: unknown, key: string): NarrativeRoadmap['narrativeTension'] {
  if (!isRecord(value)) throw new Error(`Roadmap response is missing ${key}.`);

  return {
    headline: readString(value, 'headline'),
    summary: readString(value, 'summary'),
    signalImpact: readString(value, 'signalImpact'),
    scoreRelevance: readString(value, 'scoreRelevance'),
    details: readDetails(value),
  };
}

function readMissingSignals(value: unknown): RoadmapSignal[] {
  if (!Array.isArray(value) || value.length < 1) {
    throw new Error('Roadmap response is missing missingSignals.');
  }

  return value.map((item) => {
    if (!isRecord(item)) throw new Error('Roadmap response has an invalid missing signal.');
    return {
      label: readString(item, 'label'),
      whyItMatters: readString(item, 'whyItMatters'),
      evidencePresent: readString(item, 'evidencePresent'),
      evidenceMissing: readString(item, 'evidenceMissing'),
      strongerNarrativePattern: readString(item, 'strongerNarrativePattern'),
    };
  });
}

function readNextStage(value: unknown): NarrativeRoadmap['nextNarrativeStage'] {
  if (!isRecord(value)) throw new Error('Roadmap response is missing nextNarrativeStage.');

  return {
    currentStage: readString(value, 'currentStage'),
    nextStage: readString(value, 'nextStage'),
    futureStage: readString(value, 'futureStage'),
    explanation: readString(value, 'explanation'),
    signalImpact: readString(value, 'signalImpact'),
    scoreRelevance: readString(value, 'scoreRelevance'),
    details: readDetails(value),
  };
}

function readSignalBuilders(value: unknown): RoadmapOpportunity[] {
  if (!Array.isArray(value) || value.length < 1) {
    throw new Error('Roadmap response is missing signalBuilders.');
  }

  const signalBuilders = value.map((item, signalIndex) => {
    if (!isRecord(item)) throw new Error('Roadmap response has an invalid signal builder.');

    const builders = item.builders;
    if (!Array.isArray(builders) || builders.length < 1) {
      throw new Error('Roadmap response is missing specific narrative builders.');
    }

    return {
      signal: readString(item, 'signal'),
      currentEvidence: readString(item, 'currentEvidence'),
      missingEvidence: readString(item, 'missingEvidence'),
      whyItMatters: readString(item, 'whyItMatters'),
      narrativeImpact: readString(item, 'narrativeImpact'),
      builders: builders.map((builder, builderIndex) => {
        try {
          if (!isRecord(builder)) throw new Error('Roadmap response has an invalid narrative builder.');
          const title = readString(builder, 'title');
          const action = readString(builder, 'action');
          const description = readString(builder, 'description');
          const timeframe = readString(builder, 'timeframe');
          const deadline = readString(builder, 'deadline');
          const whyItMatters = readString(builder, 'whyItMatters');

          return {
            rank: readRank(builder),
            title,
            verb: readVerb(builder, title),
            action,
            description,
            timeframe,
            deadline,
            signalGapClosed: readString(builder, 'signalGapClosed'),
            spikeTag: readSpikeTag(builder),
            signalStrengthened: readString(builder, 'signalStrengthened'),
            whyItMatters,
            whyItFits: readString(builder, 'whyItFits'),
            narrativeImpact: readString(builder, 'narrativeImpact'),
            narrativeShiftCreated: readString(builder, 'narrativeShiftCreated'),
            estimatedScoreImpact: readString(builder, 'estimatedScoreImpact'),
            difficulty: readDifficulty(builder),
            proofType: readString(builder, 'proofType'),
            level: readLevel(builder),
            evidenceRequired: readStringArray(builder, 'evidenceRequired', 1),
            status: readStatus(builder),
            evidenceText: readOptionalString(builder, 'evidenceText'),
            evidenceLink: readOptionalString(builder, 'evidenceLink'),
            completedAt: readOptionalNullableString(builder, 'completedAt'),
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown action validation error.';
          throw new Error(`Roadmap validation failed at signalBuilders[${signalIndex}].builders[${builderIndex}]: ${message}`);
        }
      }),
    };
  });

  const actions = signalBuilders.flatMap((signalBuilder) => signalBuilder.builders);
  if (actions.length < 1) {
    throw new Error('Roadmap response must include at least 1 usable action.');
  }

  if (actions.length < 5) {
    console.warn('Narrative roadmap validation continuing with fewer than 5 usable actions:', {
      actionCount: actions.length,
      missingActions: 5 - actions.length,
    });
  }

  const ranks = actions.map((action) => action.rank).sort((a, b) => a - b);
  const expectedRanks = Array.from({ length: actions.length }, (_, index) => index + 1).join(',');
  if (ranks.join(',') !== expectedRanks) {
    throw new Error('Roadmap actions must be ranked consecutively.');
  }

  return signalBuilders.map((signalBuilder) => ({
    ...signalBuilder,
    builders: [...signalBuilder.builders].sort((a, b) => a.rank - b.rank),
  })).sort((a, b) => a.builders[0].rank - b.builders[0].rank);
}

function readScorePath(value: unknown): NarrativeRoadmap['potentialScorePath'] {
  if (!isRecord(value)) throw new Error('Roadmap response is missing potentialScorePath.');
  const steps = value.steps;

  if (!Array.isArray(steps) || steps.length < 1) {
    throw new Error('Roadmap response is missing score path steps.');
  }

  return {
    currentScore: readNumber(value, 'currentScore'),
    potentialScore: readNumber(value, 'potentialScore'),
    steps: steps.map((step): ScorePathStep => {
      if (!isRecord(step)) throw new Error('Roadmap response has an invalid score step.');
      return {
        from: readNumber(step, 'from'),
        to: readNumber(step, 'to'),
        narrativeChange: readString(step, 'narrativeChange'),
        explanation: readString(step, 'explanation'),
      };
    }),
    signalImpact: readString(value, 'signalImpact'),
    scoreRelevance: readString(value, 'scoreRelevance'),
    details: readDetails(value),
  };
}

function readFutureProjection(value: unknown): NarrativeRoadmap['futureNarrativeProjection'] {
  if (!isRecord(value)) throw new Error('Roadmap response is missing futureNarrativeProjection.');

  return {
    headline: readString(value, 'headline'),
    summary: readString(value, 'summary'),
    readerInterpretation: readString(value, 'readerInterpretation'),
    signalImpact: readString(value, 'signalImpact'),
    scoreRelevance: readString(value, 'scoreRelevance'),
    details: readDetails(value),
  };
}

export function validateNarrativeRoadmap(value: unknown, model: string | null, generator: 'mock' | 'openai'): NarrativeRoadmap {
  const repaired = normalizeRoadmap(value);

  if (!isRecord(repaired)) {
    throw new Error('Roadmap response was not valid JSON.');
  }

  return {
    currentNarrative: readCurrentNarrative(repaired.currentNarrative),
    narrativeTension: readMilestone(repaired.narrativeTension, 'narrativeTension'),
    missingSignals: readMissingSignals(repaired.missingSignals),
    narrativeRisk: readMilestone(repaired.narrativeRisk, 'narrativeRisk'),
    nextNarrativeStage: readNextStage(repaired.nextNarrativeStage),
    signalBuilders: readSignalBuilders(repaired.signalBuilders),
    potentialScorePath: readScorePath(repaired.potentialScorePath),
    futureNarrativeProjection: readFutureProjection(repaired.futureNarrativeProjection),
    metadata: {
      generator,
      model,
      version: 1,
    },
  };
}
