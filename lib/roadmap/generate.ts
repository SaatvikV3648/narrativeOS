import 'server-only';

import OpenAI from 'openai';

import { createMockRoadmap, type NarrativeRoadmap } from '@/lib/roadmap/mock';
import { validateNarrativeRoadmap } from '@/lib/roadmap/validate';
import type { NarrativeAnalysis } from '@/lib/narrative/mock';
import type { Activities, Profiles } from '@/lib/supabase/types';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const ROADMAP_MAX_TOKENS = 2800;

type RoadmapInput = {
  profile: Profiles;
  activities: Activities[];
  analysis: NarrativeAnalysis;
};

const roadmapSchema = {
  name: 'narrative_roadmap',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'currentNarrative',
      'narrativeTension',
      'missingSignals',
      'narrativeRisk',
      'nextNarrativeStage',
      'signalBuilders',
      'potentialScorePath',
      'futureNarrativeProjection',
    ],
    properties: {
      currentNarrative: {
        type: 'object',
        additionalProperties: false,
        required: ['archetype', 'summary', 'strongestSignals', 'currentScore', 'signalImpact', 'scoreRelevance', 'details'],
        properties: {
          archetype: { type: 'string' },
          summary: { type: 'string' },
          strongestSignals: { type: 'array', items: { type: 'string' }, minItems: 1 },
          currentScore: { type: 'integer', minimum: 0, maximum: 100 },
          signalImpact: { type: 'string' },
          scoreRelevance: { type: 'string' },
          details: { $ref: '#/$defs/details' },
        },
      },
      narrativeTension: { $ref: '#/$defs/milestone' },
      missingSignals: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['label', 'whyItMatters', 'evidencePresent', 'evidenceMissing', 'strongerNarrativePattern'],
          properties: {
            label: { type: 'string' },
            whyItMatters: { type: 'string' },
            evidencePresent: { type: 'string' },
            evidenceMissing: { type: 'string' },
            strongerNarrativePattern: { type: 'string' },
          },
        },
      },
      narrativeRisk: { $ref: '#/$defs/milestone' },
      nextNarrativeStage: {
        type: 'object',
        additionalProperties: false,
        required: ['currentStage', 'nextStage', 'futureStage', 'explanation', 'signalImpact', 'scoreRelevance', 'details'],
        properties: {
          currentStage: { type: 'string' },
          nextStage: { type: 'string' },
          futureStage: { type: 'string' },
          explanation: { type: 'string' },
          signalImpact: { type: 'string' },
          scoreRelevance: { type: 'string' },
          details: { $ref: '#/$defs/details' },
        },
      },
      signalBuilders: {
        type: 'array',
        minItems: 5,
        maxItems: 5,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['signal', 'currentEvidence', 'missingEvidence', 'whyItMatters', 'narrativeImpact', 'builders'],
          properties: {
            signal: { type: 'string' },
            currentEvidence: { type: 'string' },
            missingEvidence: { type: 'string' },
            whyItMatters: { type: 'string' },
            narrativeImpact: { type: 'string' },
            builders: {
              type: 'array',
              minItems: 1,
              maxItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                required: [
                  'rank',
                  'title',
                  'verb',
                  'action',
                  'description',
                  'timeframe',
                  'deadline',
                  'signalGapClosed',
                  'spikeTag',
                  'signalStrengthened',
                  'whyItMatters',
                  'whyItFits',
                  'narrativeImpact',
                  'narrativeShiftCreated',
                  'estimatedScoreImpact',
                  'difficulty',
                  'proofType',
                  'level',
                  'evidenceRequired',
                  'status',
                  'evidenceText',
                  'evidenceLink',
                  'completedAt',
                ],
                properties: {
                  rank: { type: 'integer', minimum: 1, maximum: 5 },
                  title: { type: 'string' },
                  verb: { type: 'string', enum: ['Submit', 'Email', 'Register', 'Build', 'Publish', 'Apply', 'Contact', 'Create', 'Enter', 'Launch'] },
                  action: { type: 'string' },
                  description: { type: 'string' },
                  timeframe: { type: 'string' },
                  deadline: { type: 'string' },
                  signalGapClosed: { type: 'string' },
                  spikeTag: { type: 'string', enum: ['Business', 'AI/ML', 'Research', 'Performing Arts', 'Community Impact', 'Civic Leadership', 'Engineering', 'Writing', 'Athletics'] },
                  signalStrengthened: { type: 'string' },
                  whyItMatters: { type: 'string' },
                  whyItFits: { type: 'string' },
                  narrativeImpact: { type: 'string' },
                  narrativeShiftCreated: { type: 'string' },
                  estimatedScoreImpact: { type: 'string' },
                  difficulty: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                  proofType: { type: 'string' },
                  level: { type: 'string', enum: ['participation', 'leadership', 'recognition'] },
                  evidenceRequired: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
                  status: { type: 'string', enum: ['Not Started', 'In Progress', 'Completed'] },
                  evidenceText: { type: 'string' },
                  evidenceLink: { type: 'string' },
                  completedAt: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
      potentialScorePath: {
        type: 'object',
        additionalProperties: false,
        required: ['currentScore', 'potentialScore', 'steps', 'signalImpact', 'scoreRelevance', 'details'],
        properties: {
          currentScore: { type: 'integer', minimum: 0, maximum: 100 },
          potentialScore: { type: 'integer', minimum: 0, maximum: 100 },
          steps: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['from', 'to', 'narrativeChange', 'explanation'],
              properties: {
                from: { type: 'integer', minimum: 0, maximum: 100 },
                to: { type: 'integer', minimum: 0, maximum: 100 },
                narrativeChange: { type: 'string' },
                explanation: { type: 'string' },
              },
            },
          },
          signalImpact: { type: 'string' },
          scoreRelevance: { type: 'string' },
          details: { $ref: '#/$defs/details' },
        },
      },
      futureNarrativeProjection: {
        type: 'object',
        additionalProperties: false,
        required: ['headline', 'summary', 'readerInterpretation', 'signalImpact', 'scoreRelevance', 'details'],
        properties: {
          headline: { type: 'string' },
          summary: { type: 'string' },
          readerInterpretation: { type: 'string' },
          signalImpact: { type: 'string' },
          scoreRelevance: { type: 'string' },
          details: { $ref: '#/$defs/details' },
        },
      },
    },
    $defs: {
      details: {
        type: 'object',
        additionalProperties: false,
        required: ['whyThisMatters', 'affectsNarrative', 'evidencePresent', 'evidenceMissing', 'futureConnection'],
        properties: {
          whyThisMatters: { type: 'string' },
          affectsNarrative: { type: 'string' },
          evidencePresent: { type: 'string' },
          evidenceMissing: { type: 'string' },
          futureConnection: { type: 'string' },
        },
      },
      milestone: {
        type: 'object',
        additionalProperties: false,
        required: ['headline', 'summary', 'signalImpact', 'scoreRelevance', 'details'],
        properties: {
          headline: { type: 'string' },
          summary: { type: 'string' },
          signalImpact: { type: 'string' },
          scoreRelevance: { type: 'string' },
          details: { $ref: '#/$defs/details' },
        },
      },
    },
  },
  strict: true,
} as const;

function buildPrompt(input: RoadmapInput) {
  return JSON.stringify({
    profile: {
      fullName: input.profile.full_name,
      gradeYear: input.profile.grade_year,
      intendedMajor: input.profile.intended_major || 'Undecided',
      targetSchools: input.profile.target_schools,
      passionStatement: input.profile.passion_statement || '',
    },
    latestAnalysis: {
      archetype: input.analysis.archetype,
      score: input.analysis.score,
      potentialScore: input.analysis.potentialScore,
      narrative: input.analysis.narrative,
      signals: input.analysis.signals.map((signal) => ({
        label: signal.label,
        evidence: signal.evidence,
      })),
      biggestGap: input.analysis.gap,
      missingSignals: [
        input.analysis.gap.label,
        ...input.analysis.archetypeDetails.blindSpots,
      ].slice(0, 5),
    },
    activities: input.activities.map((activity) => ({
      activityName: activity.activity_name,
      role: activity.role,
      yearsInvolved: activity.years_involved,
      hoursPerWeek: activity.hours_per_week,
      description: activity.description || '',
      biggestAchievement: activity.biggest_achievement || '',
    })),
  });
}

export async function generateNarrativeRoadmap(input: RoadmapInput): Promise<NarrativeRoadmap> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('OpenAI skipped: roadmap using mock fallback because OPENAI_API_KEY is missing.');
    return createMockRoadmap(input);
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildPrompt(input);

  console.log('OpenAI call started:', {
    route: 'roadmap',
    model,
    approximatePromptCharacters: prompt.length,
    maxTokens: ROADMAP_MAX_TOKENS,
  });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.35,
    max_tokens: ROADMAP_MAX_TOKENS,
    response_format: {
      type: 'json_schema',
      json_schema: roadmapSchema,
    },
    messages: [
      {
        role: 'system',
        content: [
          'You are Spikd Pro, a narrative intelligence system for ambitious high school students.',
          'You are also a hyper-specific college admissions strategist. You give students exact, named, actionable steps — not outcomes to achieve, not general advice.',
          'Return JSON only, exactly matching the schema.',
          'Create a personalized narrative evolution journey, not a productivity plan, admissions checklist, or generic extracurricular recommendation engine.',
          'Every checkpoint must be based on the user profile, activities, schools, latest analysis, archetype, strengths, blind spots, score, and potential score.',
          'Do not invent awards, outcomes, publications, revenue, users, leadership, or admissions chances.',
          'Do not say "you should do this activity." Instead say which narrative signal could be strengthened and what evidence would make that signal more believable.',
          'Every recommendation must explain what signal it strengthens, why it matters for this specific student, what evidence exists, what evidence is missing, and how it connects to a future narrative stage.',
          'Signal Builders must read like a strategic memo written specifically for this student.',
          'The roadmap must include exactly 5 total roadmap actions, ranked by narrative impact from 1 to 5, highest impact first.',
          'Represent each action as one signalBuilders item with exactly one nested builders item.',
          'For each Signal Builder include: signal, currentEvidence, missingEvidence, whyItMatters, narrativeImpact, and exactly one nested builder.',
          'Each nested builder is a roadmap action. It must include rank, title, verb, description, timeframe, signalGapClosed, spikeTag, signalStrengthened, whyItMatters, whyItFits, narrativeImpact, narrativeShiftCreated, estimatedScoreImpact, difficulty, proofType, evidenceRequired, status, evidenceText, evidenceLink, and completedAt.',
          'Every action title must start with one of these exact verbs only: Submit, Email, Register, Build, Publish, Apply, Contact, Create, Enter, Launch.',
          'Every action title must name a specific real thing when appropriate: competition, award, fellowship, accelerator, platform, publication venue, organization type, person type, school club, community group, outreach target, or portfolio artifact.',
          'Do not use exact calendar dates unless the input data already contains verified real deadline data. Prefer safe relative timing: this week, within 7 days, within 14 days, within 30 days, when applications open, or when registration opens.',
          'If a program may be age-restricted, closed, selective, or deadline-sensitive, phrase it safely with "if eligible", "if applications are open", "when applications open", or "when registration opens".',
          'Prefer actions tied to the student’s existing assets: existing startups, clubs, nonprofits, research, audience, projects, ventures, publications, school roles, or community relationships.',
          'The best actions transform an existing activity into proof. Examples: Chatr AI becomes a client workflow case study; VC Launchpad becomes a founder traction page; a nonprofit finance role becomes a fundraising impact report; YIS becomes an investment thesis or public writeup.',
          'Avoid weak generic actions unless they are made highly specific to the student’s existing work. Bad: "Create a personal website portfolio." Better: "Create a public VC Launchpad traction page showing founder signups, mentor matches, and testimonials within 7 days."',
          'Make outreach realistic for a high school student. Bad: "Contact 10 venture capitalists." Better: "Email 20 high school founders to test VC Launchpad this week" or "Contact 5 accelerator mentors or startup operators for feedback within 14 days."',
          'Strong title examples: "Submit Chatr AI to Blue Ocean Entrepreneurship Competition within 30 days", "Register for Wharton Global High School Investment Competition when registration opens", "Publish an AI automation case study on LinkedIn and your personal website within 14 days", "Email 25 high school founders to test VC Launchpad this week", "Create a public traction dashboard for VC Launchpad within 7 days", "Contact 5 local startup founders for feedback on Chatr AI within 14 days", "Launch a founder interview series connected to VC Launchpad within 30 days", "Enter Diamond Challenge if the venture is eligible", "Apply to a student entrepreneurship accelerator if applications are open", "Build a public case study showing client workflow improvement from Chatr AI within 14 days".',
          'Bad titles: "Get 100 users", "Gain recognition", "Improve domain expertise", "Build leadership", "Find opportunities". Never describe outcomes as actions.',
          'Every action must include a concrete safe timeframe: this week, within 7 days, within 14 days, within 30 days, when applications open, or when registration opens.',
          'The action field must contain exact step-by-step instructions including where to go, what to submit or send, and roughly how long it takes.',
          'Every whyItMatters must be one sentence written specifically for this student and must reference their actual named activities. Never use generic filler like "this turns advice into proof".',
          'A strong whyItMatters sentence names the student, the exact activity or venture, the exact signal gap, and the proof mechanism. Example: "This closes Saatvik’s external validation gap by turning Chatr AI from a self-reported startup into a venture reviewed by an outside entrepreneurship audience."',
          'Never describe outcomes as actions. Bad: "Get 100 users." Good: "Email 25 high school founders from LinkedIn to test the product this week."',
          'Every action must be something the student can start tomorrow morning.',
          'Every action must close a specific signal gap from the latest analysis or roadmap, such as External Validation, Impact Scale, Domain Expertise, Academic Credibility, Leadership Scale, Narrative Cohesion, or Founder-Investor Credibility.',
          'Every action must explicitly state the narrativeShiftCreated: the identity evolution this action creates. Format it like "Focused Founder -> Validated Founder", "Founder -> Founder-Investor", "Founder -> Ecosystem Builder", "Researcher -> Published Researcher", or "Community Builder -> Regional Leader".',
          'All 5 actions should compound toward the same future narrative stage named in nextNarrativeStage.nextStage. They should feel like a progression, not five unrelated ideas.',
          'Before writing each action, ask: "What story does this action help the student become?" Do not only ask what gap it closes.',
          'Avoid actions that create conflicting stories. If the target stage is Validated Founder, all actions should reinforce founder validation, user proof, public artifacts, outside feedback, traction, or third-party review.',
          'Example progression for a founder: Create traction dashboard -> collect founder testimonials -> publish founder impact report -> submit platform to competition -> contact startup operators for feedback. These compound into Founder -> Validated Founder or Founder -> Ecosystem Builder.',
          'Prefer proof-producing actions. Every action should create concrete proof such as a link, screenshot, testimonial, submission confirmation, published artifact, user feedback, traction metric, acceptance email, competition result, founder interview, advisor feedback, program application, or measurable outreach result.',
          'For the schema field signalGapClosed, output the named signal gap closed by the action. For whyItMatters, output the user-specific why_it_matters sentence. For evidenceRequired, output concrete proof artifacts that the student could submit back to Spikd.',
          'The spikeTag must be exactly one of: Business, AI/ML, Research, Performing Arts, Community Impact, Civic Leadership, Engineering, Writing, Athletics.',
          'The level must be exactly one of: participation, leadership, recognition.',
          'The currentNarrative summary must be 2 sentences max and reference the student’s actual named activities. Never use generic descriptions.',
          'Set every generated roadmap action status to "Not Started", evidenceText to "", evidenceLink to "", and completedAt to null.',
          'Evidence required must be concrete: examples include a public link, submission artifact, traction metric, testimonial, revision notes, reviewer feedback, publication, competition result, research memo, portfolio artifact, or operating playbook.',
          'Estimated score impact must be a realistic small range like "+1 to +3" or "+3 to +5"; do not promise admissions outcomes.',
          'Specific narrative builders may include competitions, awards, fellowships, accelerators, research programs, publications, certifications, organizations, startup milestones, community initiatives, portfolio projects, conferences, or leadership opportunities.',
          'Every nested builder must satisfy all five tests: relevant to the student’s archetype, intended major, target schools, current activities, and a specific missing signal.',
          'If naming a specific opportunity, explain why it fits the student’s major, archetype, activities, target schools, or narrative signals.',
          'Acceptable example style: "For a Founder-Investor narrative, placing in Wharton Investment Competition or Blue Ocean Entrepreneurship Challenge would strengthen external validation because it shows third-party recognition of business judgment."',
          'Acceptable example style: "Turning a startup into a public traction story with 100 users, testimonials, revenue, or workflow impact would strengthen impact scale because it proves the platform affects people beyond the idea stage."',
          'Do not recommend opportunities randomly. The builder title can be a specific named opportunity only when it clearly fits the user; otherwise use a concrete custom milestone or proof artifact tied to an existing activity.',
          'Avoid generic phrases unless immediately explained with user-specific context.',
          'Avoid generic advice. Avoid repeating the same recommendation across checkpoints.',
          'Avoid repeating the same gap in every section. Each checkpoint should add a different layer of insight.',
          'Do not give random opportunities unrelated to the student. If unsure, suggest a category of proof instead of pretending certainty.',
          'Do not say specific programs guarantee admissions improvement.',
          'Narrative Risk must be thoughtful and personalized: explain what could cause admissions readers to doubt the story without using fear.',
          'Potential Score Path must connect every score jump to a specific narrative change using the student’s actual activities when possible. Do not inflate scores unrealistically.',
          'Score path examples should feel like: "Turn [specific activity] from a participation claim into a proof-based story by documenting outcomes, users, revenue, testimonials, publications, or community impact."',
          'Future Narrative Projection should be inspiring but realistic and should explain how readers would interpret the evolved narrative.',
          'Be concise. Keep each string field to 1-2 sentences so the JSON is complete and readable.',
          'Use curiosity, clarity, and actionability. Avoid fear tactics.',
        ].join(' '),
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty roadmap.');
  }

  const parsedRoadmap = JSON.parse(content);

  try {
    const roadmap = validateNarrativeRoadmap(parsedRoadmap, model, 'openai');
    console.log('OpenAI call succeeded:', {
      route: 'roadmap',
      model,
      responseCharacters: content.length,
      actionCount: roadmap.signalBuilders.flatMap((signal) => signal.builders).length,
    });
    return roadmap;
  } catch (error) {
    console.error('Narrative roadmap validation failed before save:', {
      validationError: error instanceof Error ? error.message : 'Unknown roadmap validation error.',
      requiredFieldFailure: error instanceof Error && error.message.includes('missing')
        ? error.message
        : null,
    });
    throw error;
  }
}
