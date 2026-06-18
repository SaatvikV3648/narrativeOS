import type { Activities, NarrativeRoadmaps, Profiles } from '@/lib/supabase/types';
import type { NarrativeAnalysis } from '@/lib/narrative/mock';

export type RoadmapSignal = {
  label: string;
  whyItMatters: string;
  evidencePresent: string;
  evidenceMissing: string;
  strongerNarrativePattern: string;
};

export type RoadmapOpportunity = {
  signal: string;
  currentEvidence: string;
  missingEvidence: string;
  whyItMatters: string;
  narrativeImpact: string;
  builders: {
    rank: number;
    title: string;
    verb: RoadmapActionVerb;
    action: string;
    description: string;
    timeframe: string;
    deadline: string;
    signalGapClosed: string;
    spikeTag: RoadmapSpikeTag;
    signalStrengthened: string;
    whyItMatters: string;
    whyItFits: string;
    narrativeImpact: string;
    narrativeShiftCreated: string;
    estimatedScoreImpact: string;
    difficulty: 'Low' | 'Medium' | 'High';
    proofType: string;
    level: 'participation' | 'leadership' | 'recognition';
    evidenceRequired: string[];
    status: RoadmapActionStatus;
    evidenceText?: string;
    evidenceLink?: string;
    completedAt?: string | null;
  }[];
};

export type RoadmapActionStatus = 'Not Started' | 'In Progress' | 'Completed';
export type RoadmapActionVerb = 'Submit' | 'Email' | 'Register' | 'Build' | 'Publish' | 'Apply' | 'Contact' | 'Create' | 'Enter' | 'Launch';
export type RoadmapSpikeTag = 'Business' | 'AI/ML' | 'Research' | 'Performing Arts' | 'Community Impact' | 'Civic Leadership' | 'Engineering' | 'Writing' | 'Athletics';

export type ScorePathStep = {
  from: number;
  to: number;
  narrativeChange: string;
  explanation: string;
};

export type NarrativeRoadmap = {
  currentNarrative: {
    archetype: string;
    summary: string;
    strongestSignals: string[];
    currentScore: number;
    signalImpact: string;
    scoreRelevance: string;
    details: {
      whyThisMatters: string;
      affectsNarrative: string;
      evidencePresent: string;
      evidenceMissing: string;
      futureConnection: string;
    };
  };
  narrativeTension: {
    headline: string;
    summary: string;
    signalImpact: string;
    scoreRelevance: string;
    details: NarrativeRoadmap['currentNarrative']['details'];
  };
  missingSignals: RoadmapSignal[];
  narrativeRisk: {
    headline: string;
    summary: string;
    signalImpact: string;
    scoreRelevance: string;
    details: NarrativeRoadmap['currentNarrative']['details'];
  };
  nextNarrativeStage: {
    currentStage: string;
    nextStage: string;
    futureStage: string;
    explanation: string;
    signalImpact: string;
    scoreRelevance: string;
    details: NarrativeRoadmap['currentNarrative']['details'];
  };
  signalBuilders: RoadmapOpportunity[];
  potentialScorePath: {
    currentScore: number;
    potentialScore: number;
    steps: ScorePathStep[];
    signalImpact: string;
    scoreRelevance: string;
    details: NarrativeRoadmap['currentNarrative']['details'];
  };
  futureNarrativeProjection: {
    headline: string;
    summary: string;
    readerInterpretation: string;
    signalImpact: string;
    scoreRelevance: string;
    details: NarrativeRoadmap['currentNarrative']['details'];
  };
  metadata: {
    generator: 'mock' | 'openai';
    model: string | null;
    version: number;
  };
};

type RoadmapInput = {
  profile: Profiles;
  activities: Activities[];
  analysis: NarrativeAnalysis;
};

function activitySummary(activities: Activities[]) {
  if (!activities.length) return 'your saved activities';
  return activities.slice(0, 3).map((activity) => activity.activity_name).join(', ');
}

function makeAction(
  action: Omit<RoadmapOpportunity['builders'][number], 'status' | 'evidenceText' | 'evidenceLink' | 'completedAt' | 'narrativeShiftCreated'> & {
    narrativeShiftCreated?: string;
  },
): RoadmapOpportunity['builders'][number] {
  const { narrativeShiftCreated, ...rest } = action;

  return {
    ...rest,
    narrativeShiftCreated: narrativeShiftCreated || `Current Narrative -> ${action.signalGapClosed}-backed Narrative`,
    status: 'Not Started',
    evidenceText: '',
    evidenceLink: '',
    completedAt: null,
  };
}

export function createMockRoadmap({ profile, activities, analysis }: RoadmapInput): NarrativeRoadmap {
  const major = profile.intended_major || 'your intended field';
  const schools = profile.target_schools.length ? profile.target_schools.slice(0, 3).join(', ') : 'your target schools';
  const activitiesText = activitySummary(activities);
  const strongestSignals = analysis.signals.map((signal) => signal.label);
  const gap = analysis.gap.label;
  const midpoint = Math.min(analysis.potentialScore - 2, Math.max(analysis.score + 3, Math.round((analysis.score + analysis.potentialScore) / 2)));
  const firstActivity = activities[0]?.activity_name || 'your strongest activity';
  const founderLike = /founder|builder|startup|business|finance|econom/i.test(`${analysis.archetype} ${major} ${activitiesText}`);
  const roadmapActions: RoadmapOpportunity['builders'] = founderLike
    ? [
        makeAction({
          rank: 1,
          title: `Submit ${firstActivity} to Blue Ocean Entrepreneurship Challenge within 30 days`,
          verb: 'Submit',
          action: `Go to blueoceancompetition.org and draft a venture submission for ${firstActivity} with a 2-minute demo, the problem, target user, and current traction. This should take one focused morning to outline.`,
          description: `Prepare a concise venture submission that frames ${firstActivity} around a clear problem, user, solution, and early proof.`,
          timeframe: 'within 30 days',
          deadline: 'within 30 days',
          signalGapClosed: gap,
          spikeTag: 'Business',
          signalStrengthened: gap,
          whyItMatters: `This closes ${profile.full_name}'s ${gap} gap by turning ${firstActivity} from a self-reported venture into work reviewed by an outside entrepreneurship competition.`,
          whyItFits: `It fits a ${analysis.archetype} narrative because it creates third-party recognition around business judgment connected to ${firstActivity}.`,
          narrativeImpact: `It moves the story from self-started initiative to externally evaluated founder potential.`,
          estimatedScoreImpact: '+2 to +4',
          difficulty: 'Medium',
          proofType: 'Competition submission',
          level: 'recognition',
          evidenceRequired: ['competition submission', 'judge feedback', 'placement result or participation proof'],
        }),
        makeAction({
          rank: 2,
          title: `Email 25 target users from LinkedIn to test ${firstActivity} this week`,
          verb: 'Email',
          action: `Search LinkedIn for 25 relevant founders, students, operators, or small-business users and send a 4-sentence test request for ${firstActivity}. Track replies in a simple sheet.`,
          description: `Write one short outreach note, send it to 25 relevant students, founders, operators, or community users, and ask them to test the product or workflow.`,
          timeframe: 'this week',
          deadline: 'this week',
          signalGapClosed: 'Impact Scale',
          spikeTag: 'Business',
          signalStrengthened: 'Impact Scale',
          whyItMatters: `This closes ${profile.full_name}'s impact scale gap by turning ${firstActivity} from an idea or MVP into a platform with measurable user engagement.`,
          whyItFits: `It ties directly to an existing activity instead of adding a random new one, and gives readers concrete proof through user responses.`,
          narrativeImpact: `It shows the platform or project affects people beyond the idea stage.`,
          estimatedScoreImpact: '+3 to +5',
          difficulty: 'Medium',
          proofType: 'User feedback',
          level: 'participation',
          evidenceRequired: ['outreach list', 'response screenshots', 'tester feedback summary'],
        }),
        makeAction({
          rank: 3,
          title: `Publish a 1,000-word ${major} case study from ${firstActivity} within 14 days`,
          verb: 'Publish',
          action: `Write and publish a 1,000-word case study on Medium, Substack, or a personal site explaining one ${firstActivity} workflow, the problem, the implementation, and what changed.`,
          description: `Turn one real workflow, product decision, client result, or user problem from ${firstActivity} into a public case study with context, process, and outcome.`,
          timeframe: 'within 14 days',
          deadline: 'within 14 days',
          signalGapClosed: 'Domain Expertise',
          spikeTag: 'AI/ML',
          signalStrengthened: 'Domain Expertise',
          whyItMatters: `This strengthens ${profile.full_name}'s ${major} narrative by turning hands-on work into visible proof of technical and operational depth.`,
          whyItFits: `It connects the intended major to an existing activity and shows how ${profile.full_name} thinks, not just what they joined.`,
          narrativeImpact: `It gives admissions readers a concrete artifact that proves intellectual direction.`,
          estimatedScoreImpact: '+2 to +4',
          difficulty: 'Medium',
          proofType: 'Published case study',
          level: 'leadership',
          evidenceRequired: ['published link', '1,000-word case study', 'specific workflow or result'],
        }),
        makeAction({
          rank: 4,
          title: 'Register for the Wharton Global High School Investment Competition when registration opens',
          verb: 'Register',
          action: `Bookmark the Wharton Global High School Investment Competition page, prepare a team list and sample investment thesis, and register when the official registration window opens.`,
          description: `Track registration and prepare a team or individual investment thesis that connects business analysis to the founder arc.`,
          timeframe: 'when registration opens',
          deadline: 'when registration opens',
          signalGapClosed: 'Founder-Investor Credibility',
          spikeTag: 'Business',
          signalStrengthened: 'Founder-Investor Credibility',
          whyItMatters: `This connects ${profile.full_name}'s investing or business interest with the founder narrative, making the ${major} thread more cohesive.`,
          whyItFits: `For ${major}, this creates a bridge between business thinking, analytical judgment, and the ${analysis.archetype} arc.`,
          narrativeImpact: `It makes the story more credible for schools like ${schools} because the business signal is externally tested.`,
          estimatedScoreImpact: '+2 to +4',
          difficulty: 'High',
          proofType: 'Competition registration',
          level: 'recognition',
          evidenceRequired: ['submission artifact', 'team role', 'result, feedback, or reflection'],
        }),
        makeAction({
          rank: 5,
          title: `Create a one-page public traction dashboard for ${firstActivity} within 7 days`,
          verb: 'Create',
          action: `Create a Notion, Google Sites, or simple GitHub Pages dashboard for ${firstActivity} showing users contacted, testers, testimonials, product changes, and next milestone.`,
          description: `Make one public page that tracks users, pilots, testimonials, use cases, product changes, or community outcomes for ${firstActivity}.`,
          timeframe: 'within 7 days',
          deadline: 'within 7 days',
          signalGapClosed: 'Narrative Cohesion',
          spikeTag: 'Business',
          signalStrengthened: 'Narrative Cohesion',
          whyItMatters: `This gives admissions readers one clear artifact connecting ${firstActivity}, user outcomes, and measurable progress.`,
          whyItFits: `It organizes proof already implied in the profile into a visible narrative asset.`,
          narrativeImpact: `It helps the story read as one focused arc rather than separate activity claims.`,
          estimatedScoreImpact: '+2 to +3',
          difficulty: 'Low',
          proofType: 'Public dashboard',
          level: 'leadership',
          evidenceRequired: ['public dashboard link', 'three tracked metrics', 'one sentence positioning statement'],
        }),
      ]
    : [
        makeAction({
          rank: 1,
          title: `Submit ${firstActivity} to a selective school or community showcase within 30 days`,
          verb: 'Submit',
          action: `Find one named school showcase, local fair, or community exhibition that accepts student work and submit ${firstActivity} with a short narrative statement and proof artifact.`,
          description: `Find the most relevant school, local, or online showcase for ${firstActivity} and submit the work with a short narrative statement.`,
          timeframe: 'within 30 days',
          deadline: 'within 30 days',
          signalGapClosed: gap,
          spikeTag: 'Community Impact',
          signalStrengthened: gap,
          whyItMatters: `This closes ${profile.full_name}'s ${gap} gap by putting an existing story thread in front of an outside reviewer or audience.`,
          whyItFits: `It fits because it evaluates an existing story thread instead of inventing a disconnected activity.`,
          narrativeImpact: `It turns participation into recognized proof.`,
          estimatedScoreImpact: '+2 to +4',
          difficulty: 'Medium',
          proofType: 'Submission',
          level: 'recognition',
          evidenceRequired: ['submission proof', 'feedback or result', 'reflection on what changed'],
        }),
        makeAction({
          rank: 2,
          title: `Publish a 1,000-word ${major} case study from ${firstActivity} within 14 days`,
          verb: 'Publish',
          action: `Publish a 1,000-word case study on Medium, Substack, Google Sites, or a personal site explaining what ${firstActivity} does, why it matters, and what evidence exists.`,
          description: `Create a public artifact explaining the problem, approach, result, and lesson from the activity.`,
          timeframe: 'within 14 days',
          deadline: 'within 14 days',
          signalGapClosed: 'Domain Expertise',
          spikeTag: 'Writing',
          signalStrengthened: 'Domain Expertise',
          whyItMatters: `This closes ${profile.full_name}'s domain expertise gap by making the thinking behind ${firstActivity} visible and inspectable.`,
          whyItFits: `It connects the intended major to the student’s real work and shows how they think.`,
          narrativeImpact: `It makes the profile feel more intellectually anchored.`,
          estimatedScoreImpact: '+2 to +3',
          difficulty: 'Medium',
          proofType: 'Published case study',
          level: 'leadership',
          evidenceRequired: ['published link', 'methods or process notes', 'outcome or learning summary'],
        }),
        makeAction({
          rank: 3,
          title: `Email 10 ${major} teachers, mentors, or practitioners for feedback on ${firstActivity} this week`,
          verb: 'Email',
          action: `Make a list of 10 ${major} teachers, mentors, practitioners, or local experts and email each one a link or summary of ${firstActivity} with one specific feedback question.`,
          description: `Send a concise request with one artifact and one specific question, then document the feedback and revision plan.`,
          timeframe: 'this week',
          deadline: 'this week',
          signalGapClosed: 'Academic Credibility',
          spikeTag: 'Research',
          signalStrengthened: 'Credibility',
          whyItMatters: `This closes ${profile.full_name}'s credibility gap by adding outside critique to the work instead of relying only on self-description.`,
          whyItFits: `It gives outside perspective on the work already present in the profile.`,
          narrativeImpact: `It reduces the risk that the story feels self-contained or unverified.`,
          estimatedScoreImpact: '+1 to +3',
          difficulty: 'Low',
          proofType: 'Reviewer feedback',
          level: 'participation',
          evidenceRequired: ['feedback note', 'reviewer context', 'revision or next-step proof'],
        }),
        makeAction({
          rank: 4,
          title: `Build a one-page portfolio case study for ${activitiesText} within 7 days`,
          verb: 'Build',
          action: `Use Notion, Google Sites, or GitHub Pages to build one page that connects ${activitiesText} into a problem, process, proof, and takeaway.`,
          description: `Create one page that connects the activities into a problem, process, proof, and takeaway.`,
          timeframe: 'within 7 days',
          deadline: 'within 7 days',
          signalGapClosed: 'Narrative Cohesion',
          spikeTag: 'Writing',
          signalStrengthened: 'Narrative Cohesion',
          whyItMatters: `This closes ${profile.full_name}'s narrative cohesion gap by showing how the activities connect into one application identity.`,
          whyItFits: `It connects separate activities into one visible narrative thread with problem, process, result, and lesson.`,
          narrativeImpact: `It helps the application read as one coherent identity rather than a set of separate accomplishments.`,
          estimatedScoreImpact: '+2 to +3',
          difficulty: 'Low',
          proofType: 'Portfolio artifact',
          level: 'leadership',
          evidenceRequired: ['portfolio link', 'activity connections', 'before/after proof'],
        }),
        makeAction({
          rank: 5,
          title: `Contact one local organization to pilot ${firstActivity} within 14 days`,
          verb: 'Contact',
          action: `Contact a named school club, nonprofit, local business, lab, or community group and propose a small pilot for ${firstActivity} with one clear deliverable.`,
          description: `Reach out to a school club, nonprofit, local business, lab, or community group and propose a small pilot connected to the activity.`,
          timeframe: 'within 14 days',
          deadline: 'within 14 days',
          signalGapClosed: 'Impact Scale',
          spikeTag: 'Community Impact',
          signalStrengthened: 'Impact Scale',
          whyItMatters: `This closes ${profile.full_name}'s impact scale gap by testing ${firstActivity} with a real audience outside the profile.`,
          whyItFits: `It uses an existing activity and adds a concrete external audience.`,
          narrativeImpact: `It converts effort into measurable influence.`,
          estimatedScoreImpact: '+2 to +4',
          difficulty: 'Medium',
          proofType: 'Pilot proof',
          level: 'leadership',
          evidenceRequired: ['outreach message', 'pilot agreement or response', 'pilot result summary'],
        }),
      ];

  return {
    currentNarrative: {
      archetype: analysis.archetype,
      summary: `${profile.full_name}'s current story reads as ${analysis.archetype}: a student building momentum in ${major} through ${activitiesText}. The throughline is strongest when the activities feel connected to one clear application identity.`,
      strongestSignals,
      currentScore: analysis.score,
      signalImpact: strongestSignals[0] || 'Narrative coherence',
      scoreRelevance: `This baseline sits at ${analysis.score}/100 because the story has visible direction, but still needs sharper proof around ${gap}.`,
      details: {
        whyThisMatters: 'Admissions readers remember profiles that resolve into a clear identity, not just a list of impressive efforts.',
        affectsNarrative: `The ${analysis.archetype} frame gives the application a recognizable center of gravity.`,
        evidencePresent: `Saved activities include ${activitiesText}, plus the latest analysis identifies ${strongestSignals.join(', ')} as active signals.`,
        evidenceMissing: `The main missing layer is ${gap}: proof that makes the story harder to dismiss as only potential.`,
        futureConnection: `Strengthening ${gap} creates the bridge from current narrative to the next stage.`,
      },
    },
    narrativeTension: {
      headline: `Strong ${strongestSignals[0] || 'initiative'}, but ${gap.toLowerCase()} is still underdeveloped.`,
      summary: `The tension is not that the profile lacks activity. It is that the strongest activities need more visible proof, scale, or credibility to make the story feel inevitable.`,
      signalImpact: gap,
      scoreRelevance: `Resolving this tension is the clearest path from ${analysis.score} toward ${analysis.potentialScore}.`,
      details: {
        whyThisMatters: 'Narrative tension explains why a promising profile may still feel unfinished.',
        affectsNarrative: 'It shows the difference between a student with interesting work and a student whose work clearly means something.',
        evidencePresent: analysis.narrative,
        evidenceMissing: analysis.gap.summary,
        futureConnection: 'The next stage should directly answer this tension with proof, focus, or scale.',
      },
    },
    missingSignals: [
      {
        label: gap,
        whyItMatters: analysis.admissionsImpact.body,
        evidencePresent: strongestSignals.join(', '),
        evidenceMissing: analysis.gap.summary,
        strongerNarrativePattern: `Stronger ${analysis.archetype} profiles usually make this signal visible through measurable outcomes, third-party proof, or sustained depth.`,
      },
      {
        label: 'Domain Depth',
        whyItMatters: `Depth helps readers believe the interest in ${major} is durable rather than cosmetic.`,
        evidencePresent: `Activities such as ${activitiesText} begin to establish a pattern.`,
        evidenceMissing: 'More advanced work, public proof, or clear learning progression would make the story stronger.',
        strongerNarrativePattern: 'Stronger narratives show increasing sophistication inside the same domain over time.',
      },
    ],
    narrativeRisk: {
      headline: `Readers may see the story as promising but not fully proven.`,
      summary: `The main risk is that the ${analysis.archetype} narrative depends on self-reported effort without enough outside evidence that the work mattered to people, institutions, or a community.`,
      signalImpact: gap,
      scoreRelevance: 'Reducing this risk is what turns potential score into believable score movement.',
      details: {
        whyThisMatters: 'A thoughtful risk section keeps the roadmap honest without using fear.',
        affectsNarrative: 'It names the reader doubt the student needs to resolve.',
        evidencePresent: `There is already a coherent base around ${activitiesText}.`,
        evidenceMissing: `The proof layer around ${gap} needs to become more concrete.`,
        futureConnection: 'The roadmap should create evidence that answers this doubt before application season.',
      },
    },
    nextNarrativeStage: {
      currentStage: analysis.archetype,
      nextStage: analysis.archetype.includes('Founder') ? 'Validated Founder' : `Validated ${analysis.archetype}`,
      futureStage: analysis.archetype.includes('Founder') ? 'Industry Builder' : `Recognized ${analysis.archetype}`,
      explanation: `The story evolves when ${profile.full_name} keeps the same narrative center but adds stronger proof that the work has depth, credibility, and effect beyond participation.`,
      signalImpact: `${gap}, Domain Depth, Real-World Impact`,
      scoreRelevance: `This stage shift is the narrative reason ${analysis.potentialScore} is reachable.`,
      details: {
        whyThisMatters: 'Stages make progress legible: the student is not doing more random things, they are becoming a clearer version of themselves.',
        affectsNarrative: 'It turns the application from a snapshot into an arc.',
        evidencePresent: analysis.archetypeDetails.description,
        evidenceMissing: analysis.archetypeDetails.blindSpots.join(', '),
        futureConnection: 'Each signal builder should support this stage transition.',
      },
    },
    signalBuilders: roadmapActions.map((action) => ({
      signal: action.signalGapClosed,
      currentEvidence: `Current evidence comes from ${activitiesText} and the strongest signals: ${strongestSignals.join(', ')}.`,
      missingEvidence: action.signalGapClosed === gap ? analysis.gap.summary : `The profile needs more visible proof of ${action.signalGapClosed}.`,
      whyItMatters: action.whyItMatters,
      narrativeImpact: action.narrativeImpact,
      builders: [action],
    })),
    potentialScorePath: {
      currentScore: analysis.score,
      potentialScore: analysis.potentialScore,
      steps: [
        {
          from: analysis.score,
          to: midpoint,
          narrativeChange: `Turn ${firstActivity} from a saved activity into a proof-based story.`,
          explanation: `Document outcomes, testimonials, adoption, revenue, publication, or community impact so ${gap} becomes visible instead of implied.`,
        },
        {
          from: midpoint,
          to: analysis.potentialScore,
          narrativeChange: `Tie ${activitiesText} into one ${major} positioning artifact.`,
          explanation: `A public case study, research writeup, portfolio page, or competition story can connect proof, depth, and positioning for ${schools}.`,
        },
      ],
      signalImpact: `${gap} and narrative coherence`,
      scoreRelevance: `The score path is not about more activities. It is about evidence that changes how the same story is interpreted.`,
      details: {
        whyThisMatters: 'Students need to know what creates score movement, not just what number they received.',
        affectsNarrative: 'Each jump is tied to a specific narrative change.',
        evidencePresent: `Current score is ${analysis.score}.`,
        evidenceMissing: `Potential score depends on strengthening ${gap}.`,
        futureConnection: 'Future roadmap updates can compare new activities against this path.',
      },
    },
    futureNarrativeProjection: {
      headline: `${profile.full_name} could become a more validated version of ${analysis.archetype}.`,
      summary: `If the strongest signals are developed, the application could read as a student with a clear identity, a focused domain, and enough proof for readers to understand why the story matters.`,
      readerInterpretation: `Admissions readers would be more likely to see the profile as intentional and evolving, rather than simply active across ${activities.length} activities.`,
      signalImpact: `Future-stage proof around ${gap}`,
      scoreRelevance: `This is the realistic story behind a move toward ${analysis.potentialScore}/100.`,
      details: {
        whyThisMatters: 'The future projection gives the student an identity to grow into.',
        affectsNarrative: 'It makes the next moves feel connected instead of transactional.',
        evidencePresent: analysis.narrative,
        evidenceMissing: 'The evolved story still needs concrete evidence created over time.',
        futureConnection: 'The next roadmap should update as new activities, outcomes, and analyses are saved.',
      },
    },
    metadata: {
      generator: 'mock',
      model: null,
      version: 1,
    },
  };
}

export function roadmapToInsert(roadmap: NarrativeRoadmap) {
  return {
    current_narrative: roadmap.currentNarrative,
    narrative_tension: roadmap.narrativeTension,
    missing_signals: roadmap.missingSignals,
    narrative_risk: roadmap.narrativeRisk,
    next_narrative_stage: roadmap.nextNarrativeStage,
    signal_builders: roadmap.signalBuilders,
    potential_score_path: roadmap.potentialScorePath,
    future_narrative_projection: roadmap.futureNarrativeProjection,
    model: roadmap.metadata.model,
    generated_with: roadmap.metadata.generator,
  };
}

function normalizeStatus(value: unknown): RoadmapActionStatus {
  if (value === 'Completed' || value === 'In Progress' || value === 'Not Started') {
    return value;
  }
  return 'Not Started';
}

function normalizeVerb(value: unknown, title: string): RoadmapActionVerb {
  const firstWord = title.split(/\s+/)[0];
  const verb = typeof value === 'string' && value.trim() ? value.trim() : firstWord;
  if (
    verb === 'Submit' ||
    verb === 'Email' ||
    verb === 'Register' ||
    verb === 'Build' ||
    verb === 'Publish' ||
    verb === 'Apply' ||
    verb === 'Contact' ||
    verb === 'Create' ||
    verb === 'Enter' ||
    verb === 'Launch'
  ) {
    return verb;
  }
  return 'Build';
}

function normalizeSpikeTag(value: unknown): RoadmapSpikeTag {
  if (
    value === 'Business' ||
    value === 'AI/ML' ||
    value === 'Research' ||
    value === 'Performing Arts' ||
    value === 'Community Impact' ||
    value === 'Civic Leadership' ||
    value === 'Engineering' ||
    value === 'Writing' ||
    value === 'Athletics'
  ) {
    return value;
  }
  return 'Business';
}

function normalizeDifficulty(value: unknown): 'Low' | 'Medium' | 'High' {
  if (value === 'Low' || value === 'Medium' || value === 'High') return value;
  return 'Medium';
}

function normalizeLevel(value: unknown): 'participation' | 'leadership' | 'recognition' {
  if (value === 'participation' || value === 'leadership' || value === 'recognition') return value;
  return 'participation';
}

function normalizeBuilderAction(value: unknown, signal: string, fallbackIndex: number) {
  const record = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const title = typeof record.title === 'string' && record.title.trim()
    ? record.title.trim()
    : `Build proof for ${signal} ${fallbackIndex + 1}`;

  return {
    rank: typeof record.rank === 'number' ? Math.max(1, Math.round(record.rank)) : fallbackIndex + 1,
    title,
    verb: normalizeVerb(record.verb, title),
    action: typeof record.action === 'string' && record.action.trim()
      ? record.action.trim()
      : `Start this action by creating a concrete artifact or outreach step for ${signal}.`,
    description: typeof record.description === 'string' && record.description.trim()
      ? record.description.trim()
      : `Create concrete evidence that makes ${signal} more visible in the application story.`,
    timeframe: typeof record.timeframe === 'string' && record.timeframe.trim()
      ? record.timeframe.trim()
      : 'within 14 days',
    deadline: typeof record.deadline === 'string' && record.deadline.trim()
      ? record.deadline.trim()
      : typeof record.timeframe === 'string' && record.timeframe.trim()
        ? record.timeframe.trim()
        : 'within 14 days',
    signalGapClosed: typeof record.signalGapClosed === 'string' && record.signalGapClosed.trim()
      ? record.signalGapClosed.trim()
      : signal,
    spikeTag: normalizeSpikeTag(record.spikeTag),
    signalStrengthened: typeof record.signalStrengthened === 'string' && record.signalStrengthened.trim()
      ? record.signalStrengthened.trim()
      : signal,
    whyItMatters: typeof record.whyItMatters === 'string' && record.whyItMatters.trim()
      ? record.whyItMatters.trim()
      : 'This matters because it turns the missing signal into visible proof.',
    whyItFits: typeof record.whyItFits === 'string' && record.whyItFits.trim()
      ? record.whyItFits.trim()
      : 'This action is tied to the saved roadmap signal and strengthens the story without adding random activity.',
    narrativeImpact: typeof record.narrativeImpact === 'string' && record.narrativeImpact.trim()
      ? record.narrativeImpact.trim()
      : 'It turns broad potential into visible proof.',
    narrativeShiftCreated: typeof record.narrativeShiftCreated === 'string' && record.narrativeShiftCreated.trim()
      ? record.narrativeShiftCreated.trim()
      : typeof record.narrative_shift_created === 'string' && record.narrative_shift_created.trim()
        ? record.narrative_shift_created.trim()
        : `Current Narrative -> ${signal}-backed Narrative`,
    estimatedScoreImpact: typeof record.estimatedScoreImpact === 'string' && record.estimatedScoreImpact.trim()
      ? record.estimatedScoreImpact.trim()
      : '+1 to +3',
    difficulty: normalizeDifficulty(record.difficulty),
    proofType: typeof record.proofType === 'string' && record.proofType.trim()
      ? record.proofType.trim()
      : 'Evidence artifact',
    level: normalizeLevel(record.level),
    evidenceRequired: Array.isArray(record.evidenceRequired)
      ? record.evidenceRequired.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
      : ['evidence text or link', 'outcome summary'],
    status: normalizeStatus(record.status),
    evidenceText: typeof record.evidenceText === 'string' ? record.evidenceText : '',
    evidenceLink: typeof record.evidenceLink === 'string' ? record.evidenceLink : '',
    completedAt: typeof record.completedAt === 'string' && record.completedAt.trim() ? record.completedAt : null,
  };
}

export function storedRoadmapToNarrative(row: NarrativeRoadmaps): NarrativeRoadmap {
  const rawSignalBuilders = Array.isArray(row.signal_builders) ? row.signal_builders : [];
  const signalBuilders = rawSignalBuilders.map((builder) => {
    const record = builder && typeof builder === 'object' && !Array.isArray(builder)
      ? builder as Record<string, unknown>
      : {};
    const signal = typeof record.signal === 'string' ? record.signal : 'Narrative Signal';
    const evidenceExamples = Array.isArray(record.evidenceExamples)
      ? record.evidenceExamples.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
      : [];

    return {
      signal,
      currentEvidence: typeof record.currentEvidence === 'string'
        ? record.currentEvidence
        : 'Existing activities and latest narrative analysis provide the current baseline evidence.',
      missingEvidence: typeof record.missingEvidence === 'string'
        ? record.missingEvidence
        : evidenceExamples.join(', ') || 'More concrete proof is needed to make this signal visible.',
      whyItMatters: typeof record.whyItMatters === 'string'
        ? record.whyItMatters
        : 'This signal matters because it helps the story feel more credible and specific.',
      narrativeImpact: typeof record.narrativeImpact === 'string'
        ? record.narrativeImpact
        : 'Strengthening this signal makes the narrative easier for readers to understand and trust.',
      builders: Array.isArray(record.builders)
        ? record.builders.map((item, index) => normalizeBuilderAction(item, signal, index))
        : (evidenceExamples.length ? evidenceExamples : ['Create a public proof artifact', 'Earn third-party feedback']).map((example) => ({
            rank: 1,
            title: example,
            verb: normalizeVerb(undefined, example),
            action: 'Start this action by creating a concrete artifact or outreach step tied to the missing signal.',
            description: 'Create a concrete proof artifact tied to this narrative signal.',
            timeframe: 'within 14 days',
            deadline: 'within 14 days',
            signalGapClosed: signal,
            spikeTag: 'Business' as RoadmapSpikeTag,
            signalStrengthened: signal,
            whyItMatters: 'This matters because it turns the missing signal into visible proof.',
            whyItFits: 'This is adapted from an earlier saved roadmap and remains tied to the missing signal.',
            narrativeImpact: 'It turns broad advice into visible evidence for the application story.',
            narrativeShiftCreated: `Current Narrative -> ${signal}-backed Narrative`,
            estimatedScoreImpact: '+1 to +3',
            difficulty: 'Medium' as const,
            proofType: 'Evidence artifact',
            level: 'participation' as const,
            evidenceRequired: ['evidence text or link', 'outcome summary'],
            status: 'Not Started' as RoadmapActionStatus,
            evidenceText: '',
            evidenceLink: '',
            completedAt: null,
          })),
    };
  });

  return {
    currentNarrative: row.current_narrative as NarrativeRoadmap['currentNarrative'],
    narrativeTension: row.narrative_tension as NarrativeRoadmap['narrativeTension'],
    missingSignals: row.missing_signals as NarrativeRoadmap['missingSignals'],
    narrativeRisk: row.narrative_risk as NarrativeRoadmap['narrativeRisk'],
    nextNarrativeStage: row.next_narrative_stage as NarrativeRoadmap['nextNarrativeStage'],
    signalBuilders: signalBuilders as NarrativeRoadmap['signalBuilders'],
    potentialScorePath: row.potential_score_path as NarrativeRoadmap['potentialScorePath'],
    futureNarrativeProjection: row.future_narrative_projection as NarrativeRoadmap['futureNarrativeProjection'],
    metadata: {
      generator: row.generated_with === 'openai' ? 'openai' : 'mock',
      model: row.model,
      version: 1,
    },
  };
}
