import 'server-only';

import OpenAI from 'openai';

import { mockNarrativeAnalysis, type NarrativeAnalysis } from '@/lib/narrative/mock';
import { validateNarrativeAnalysis } from '@/lib/narrative/validate';
import type { Activities, Profiles } from '@/lib/supabase/types';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const NARRATIVE_MAX_TOKENS = 800;

type NarrativeInput = {
  profile: Pick<Profiles, 'full_name' | 'grade_year' | 'intended_major' | 'target_schools' | 'passion_statement'>;
  activities: Pick<
    Activities,
    'activity_name' | 'role' | 'years_involved' | 'hours_per_week' | 'description' | 'biggest_achievement'
  >[];
};

const responseSchema = {
  name: 'narrative_analysis',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'archetype',
      'archetypeDetails',
      'score',
      'potentialScore',
      'scoreBreakdown',
      'narrative',
      'signals',
      'gap',
      'admissionsImpact',
      'proPreview',
    ],
    properties: {
      archetype: {
        type: 'string',
        enum: [
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
        ],
      },
      archetypeDetails: {
        type: 'object',
        additionalProperties: false,
        required: ['description', 'strengths', 'blindSpots'],
        properties: {
          description: { type: 'string' },
          strengths: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          blindSpots: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
        },
      },
      score: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
      },
      potentialScore: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
        description: 'Realistic score if the student fixes the highest-leverage gaps.',
      },
      scoreBreakdown: {
        type: 'object',
        additionalProperties: false,
        required: ['coherence', 'depth', 'impact', 'differentiation'],
        properties: {
          coherence: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Narrative Coherence, weighted 40%.',
          },
          depth: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Narrative Depth, weighted 25%.',
          },
          impact: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Demonstrated Impact, weighted 20%.',
          },
          differentiation: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Narrative Differentiation, weighted 15%.',
          },
        },
      },
      narrative: {
        type: 'string',
        description: 'A 60-90 word admissions-style narrative paragraph.',
      },
      signals: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['label', 'evidence'],
          properties: {
            label: { type: 'string' },
            evidence: { type: 'string' },
          },
        },
      },
      gap: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'summary'],
        properties: {
          label: { type: 'string' },
          summary: { type: 'string' },
        },
      },
      admissionsImpact: {
        type: 'object',
        additionalProperties: false,
        required: ['headline', 'body'],
        properties: {
          headline: { type: 'string' },
          body: { type: 'string' },
        },
      },
      proPreview: {
        type: 'object',
        additionalProperties: false,
        required: ['headline', 'lockedItems'],
        properties: {
          headline: { type: 'string' },
          lockedItems: {
            type: 'array',
            minItems: 5,
            maxItems: 7,
            items: { type: 'string' },
          },
        },
      },
    },
  },
  strict: true,
} as const;

function buildPrompt(input: NarrativeInput) {
  return JSON.stringify({
    student: {
      name: input.profile.full_name,
      gradeYear: input.profile.grade_year,
      intendedMajor: input.profile.intended_major || 'Undecided',
      targetSchools: input.profile.target_schools || [],
      passionStatement: input.profile.passion_statement || '',
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

export async function generateNarrative(input: NarrativeInput): Promise<NarrativeAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('OpenAI skipped: narrative using mock fallback because OPENAI_API_KEY is missing.');
    return mockNarrativeAnalysis;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
  const prompt = buildPrompt(input);

  console.log('OpenAI call started:', {
    route: 'narrative',
    model,
    approximatePromptCharacters: prompt.length,
    maxTokens: NARRATIVE_MAX_TOKENS,
  });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.35,
    max_tokens: NARRATIVE_MAX_TOKENS,
    response_format: {
      type: 'json_schema',
      json_schema: responseSchema,
    },
    messages: [
      {
        role: 'system',
        content: [
          'You are Spikd, an admissions narrative analyst for ambitious high school students.',
          'Return JSON only, exactly matching the provided schema.',
          'Your job is to assess how compelling the student story is, not how impressive the resume is.',
          'Score primarily on narrative quality: 40% Narrative Coherence, 25% Narrative Depth, 20% Demonstrated Impact, 15% Narrative Differentiation.',
          'Narrative Coherence asks whether the activities point toward a clear story. A focused finance profile with fewer wins can score higher than a scattered high-achievement profile.',
          'Depth asks whether the student has sustained commitment, domain learning, and increasingly serious work.',
          'Impact asks whether there is evidence of outcomes, adoption, leadership scale, external validation, or real-world change.',
          'Differentiation asks whether the story feels memorable relative to similar applicants.',
          'Use calibrated score bands: 50-65 Early Builder, 66-75 Developing Narrative, 76-85 Strong Narrative, 86-92 Exceptional Narrative, 93-100 Elite Narrative.',
          'Do not be needlessly harsh. Strong coherent profiles should not receive extremely low scores.',
          'Potential Score should represent the realistic ceiling if the student fixes the highest-leverage missing signals.',
          'Free output is diagnosis. Pro preview is prescription: specific next moves remain locked.',
          'Pro preview must create curiosity, clarity, and actionability, not fear or fake urgency.',
          'Do not invent awards, roles, stats, leadership, achievements, schools, or impact that the student did not provide.',
          'If evidence is thin, say so clearly and make the biggest gap specific. Choose one highest-leverage missing signal such as External Validation, Academic Depth, Leadership Scale, Domain Focus, Research Credibility, or Real-World Impact.',
          'Archetypes should be specific and memorable. Prefer Focused Founder, Technical Builder, Community Leader, Emerging Researcher, Civic Advocate, Creative Performer, or Systems Explorer when appropriate.',
          'The narrative paragraph must be 60-90 words and should explain what the application currently communicates.',
          'The user must understand why the score is not higher, what is holding them back, and what would move them up.',
          'Admissions impact should explain why the gap matters for competitive college applications without claiming guaranteed outcomes.',
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
    throw new Error('OpenAI returned an empty narrative analysis.');
  }

  const parsed = JSON.parse(content) as unknown;
  const analysis = validateNarrativeAnalysis(parsed);

  console.log('OpenAI call succeeded:', {
    route: 'narrative',
    model,
    responseCharacters: content.length,
  });

  return {
    ...analysis,
    metadata: {
      generator: 'openai',
      version: 1,
    },
  };
}
