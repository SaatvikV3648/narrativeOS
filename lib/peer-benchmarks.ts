import 'server-only';

import { readFile } from 'fs/promises';
import path from 'path';

import type { NarrativeAnalysis } from '@/lib/narrative/mock';
import type { Activities, Profiles } from '@/lib/supabase/types';

export type AdmittedPeerProfile = {
  profileId: string;
  archetype: string;
  narrativeScore: number;
  scoreRange: string;
  gradeYear: number | null;
  intendedMajor: string;
  activities: string[];
  spike: string;
  awards: string[];
  leadership: string[];
  schoolsAdmitted: string[];
  schoolsRejected: string[];
  narrativeTags: string[];
  illustrative: boolean;
  storySummary: string;
  strongestSignals: string[];
  proofCreated: string[];
  gapSolved: string;
};

export type PeerMatch = {
  profile: AdmittedPeerProfile;
  score: number;
  matchReasons: string[];
  sharedSignals: string[];
  missingSignals: string[];
  storyStrengths: string[];
  whyScoredHigher: string[];
  storyConstruction: {
    foundation: string;
    proofLayer: string;
    positioning: string;
  };
  narrativeShift: {
    from: string;
    to: string;
    createdBy: string[];
  };
  whatThisMeans: string;
  relatedActionSignal: string;
};

const DATA_PATH = path.join(process.cwd(), 'data', 'admitted_profiles.csv');

const signalVocabulary = [
  'External Validation',
  'Domain Expertise',
  'Impact Scale',
  'Leadership Systems',
  'Narrative Cohesion',
  'Technical Depth',
  'Academic Credibility',
  'Founder-Investor Credibility',
  'Community Impact',
  'Research Credibility',
  'Creative Distinction',
  'Competitive Recognition',
];

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function splitList(value: string) {
  return value
    .split(/\s*\|\s*|\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getBaseArchetype(archetype: string) {
  const value = archetype.toLowerCase();
  if (value.includes('founder') || value.includes('builder') || value.includes('technical')) return 'Builder';
  if (value.includes('research')) return 'Researcher';
  if (value.includes('leader') || value.includes('civic')) return 'Leader';
  if (value.includes('advocate')) return 'Advocate';
  if (value.includes('performer') || value.includes('creative')) return 'Performer';
  if (value.includes('explorer') || value.includes('systems')) return 'Explorer';
  return archetype || 'Builder';
}

function tokenize(value: string) {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2));
}

function overlapCount(left: string[], right: string[]) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.filter((item) => rightSet.has(item.toLowerCase())).length;
}

function textOverlap(left: string, right: string) {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
  return [...leftTokens].filter((token) => rightTokens.has(token)).length;
}

function overlapRatio(left: string[], right: string[]) {
  const leftSet = new Set(left.map((item) => item.toLowerCase()));
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  const union = new Set([...leftSet, ...rightSet]);
  if (!union.size) return 0;
  const intersection = [...leftSet].filter((item) => rightSet.has(item));
  return intersection.length / union.size;
}

function inferSignals(profile: AdmittedPeerProfile) {
  const text = [
    profile.archetype,
    profile.intendedMajor,
    profile.spike,
    profile.activities.join(' '),
    profile.awards.join(' '),
    profile.leadership.join(' '),
    profile.narrativeTags.join(' '),
  ].join(' ').toLowerCase();

  const signals = new Set<string>();
  if (/winner|finalist|semifinalist|competition|challenge|olympiad|award|scholar|national|international|published|featured/.test(text)) {
    signals.add('External Validation');
    signals.add('Competitive Recognition');
  }
  if (/research|lab|paper|published|professor|isef|science/.test(text)) signals.add('Research Credibility');
  if (/founder|startup|business|venture|revenue|users|platform|entrepreneur|finance|investment/.test(text)) {
    signals.add('Impact Scale');
    signals.add('Founder-Investor Credibility');
  }
  if (/president|captain|director|chair|vp|lead|founding|ambassador|council/.test(text)) signals.add('Leadership Systems');
  if (/teach|mentor|nonprofit|volunteer|community|fundraising|advocacy|youth/.test(text)) signals.add('Community Impact');
  if (/technical|software|robotics|cs|engineering|coding|app|nasa|usaco/.test(text)) signals.add('Technical Depth');
  if (/case|write|publication|thesis|newspaper|radio|debate|model un|essay/.test(text)) signals.add('Narrative Cohesion');
  if (/aime|academic|honor|ap scholar|national merit|olympiad|university/.test(text)) signals.add('Academic Credibility');
  if (/music|band|piano|cellist|arts|theater|musical|equestrian|athlete|tennis|soccer|swim/.test(text)) signals.add('Creative Distinction');
  if (/depth|spike|cohesive|thread|multi-domain/.test(text)) signals.add('Domain Expertise');

  return signals.size ? [...signals] : profile.narrativeTags.slice(0, 3).map((tag) => tag.replace(/-/g, ' '));
}

function inferGapSolved(profile: AdmittedPeerProfile) {
  const signals = inferSignals(profile);
  if (signals.includes('External Validation')) return 'External Validation';
  if (signals.includes('Impact Scale')) return 'Impact Scale';
  if (signals.includes('Research Credibility')) return 'Research Credibility';
  if (signals.includes('Leadership Systems')) return 'Leadership Systems';
  return signals[0] || 'Narrative Cohesion';
}

function inferProof(profile: AdmittedPeerProfile) {
  const proof = [
    ...profile.awards.slice(0, 3),
    ...profile.leadership.slice(0, 2),
  ];

  if (profile.spike) proof.unshift(profile.spike);
  return proof.slice(0, 5);
}

export async function loadAdmittedProfiles() {
  const csv = await readFile(DATA_PATH, 'utf8');
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  const profiles = rows.map((row): AdmittedPeerProfile => {
    const values = parseCsvLine(row);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    const activities = [record.ec_1, record.ec_2, record.ec_3, record.ec_4, record.ec_5].filter(Boolean);
    const narrativeTags = splitList(record.narrative_tags || '');
    const admittedProfile: AdmittedPeerProfile = {
      profileId: record.profile_id || '',
      archetype: record.archetype || 'Builder',
      narrativeScore: Number(record.narrative_score) || 70,
      scoreRange: record.score_range || '',
      gradeYear: Number(record.grade_year) || null,
      intendedMajor: record.intended_major || 'Undecided',
      activities,
      spike: record.spike || activities[0] || 'Cohesive activity spike',
      awards: splitList(record.awards || ''),
      leadership: splitList(record.leadership || ''),
      schoolsAdmitted: splitList(record.schools_admitted || ''),
      schoolsRejected: splitList(record.schools_rejected || ''),
      narrativeTags,
      illustrative: record.illustrative === 'true',
      storySummary: record.spike || `${record.archetype || 'Admitted'} profile built around ${activities.slice(0, 2).join(' and ')}`,
      strongestSignals: [],
      proofCreated: [],
      gapSolved: '',
    };

    admittedProfile.strongestSignals = inferSignals(admittedProfile).slice(0, 5);
    admittedProfile.proofCreated = inferProof(admittedProfile);
    admittedProfile.gapSolved = inferGapSolved(admittedProfile);
    return admittedProfile;
  });

  return { profiles, columns: headers };
}

function getUserSignals(analysis: NarrativeAnalysis) {
  const rawSignals = [
    ...analysis.signals.map((signal) => signal.label),
    analysis.gap.label,
    analysis.archetype,
    analysis.narrative,
  ].join(' ').toLowerCase();

  const inferredSignals = signalVocabulary.filter((signal) => {
    const normalized = signal.toLowerCase();
    return rawSignals.includes(normalized)
      || normalized.split(/\s+/).some((part) => part.length > 4 && rawSignals.includes(part));
  });

  return [...new Set([...analysis.signals.map((signal) => signal.label), ...inferredSignals])];
}

function getMissingSignals(userSignals: string[], peerSignals: string[], gap: string) {
  const normalizedUserSignals = new Set(userSignals.map((signal) => signal.toLowerCase()));
  const missing = peerSignals.filter((signal) => !normalizedUserSignals.has(signal.toLowerCase()));
  if (!normalizedUserSignals.has(gap.toLowerCase())) missing.unshift(gap);
  return [...new Set(missing)].slice(0, 4);
}

function buildStoryStrengths(peer: AdmittedPeerProfile) {
  const strengths = [
    peer.proofCreated[0] ? `Created visible proof through ${peer.proofCreated[0]}.` : '',
    peer.leadership[0] ? `Held a clear ownership role: ${peer.leadership[0]}.` : '',
    peer.awards[0] ? `Earned third-party validation through ${peer.awards[0]}.` : '',
    peer.spike ? `Connected activities into one spike: ${peer.spike}.` : '',
    peer.schoolsAdmitted[0] ? `Positioned the story strongly enough for ${peer.schoolsAdmitted.slice(0, 2).join(' and ')}.` : '',
  ].filter(Boolean);

  return strengths.slice(0, 5);
}

function buildWhyScoredHigher(peer: AdmittedPeerProfile, analysis: NarrativeAnalysis) {
  const delta = peer.narrativeScore - analysis.score;
  const reasons = [
    delta > 0 ? `The admitted profile scores ${delta} points higher because its proof layer is more visible, not because it simply has more activities.` : '',
    peer.gapSolved ? `It shows stronger ${peer.gapSolved.toLowerCase()} through concrete outcomes like ${peer.proofCreated[0] || peer.spike}.` : '',
    peer.awards[0] ? `Third-party recognition appears clearly through ${peer.awards[0]}.` : '',
    peer.leadership[0] ? `Ownership is easier to read because the profile names a real role: ${peer.leadership[0]}.` : '',
    peer.spike ? `The activities resolve into one memorable spine: ${peer.spike}.` : '',
  ].filter(Boolean);

  return reasons.slice(0, 4);
}

function buildStoryConstruction(peer: AdmittedPeerProfile) {
  return {
    foundation: peer.activities.slice(0, 2).join(' + ') || peer.spike,
    proofLayer: peer.proofCreated.slice(0, 3).join(' | ') || peer.gapSolved,
    positioning: `${peer.archetype} positioned around ${peer.spike}`,
  };
}

function buildNarrativeShift(analysis: NarrativeAnalysis, peer: AdmittedPeerProfile) {
  const createdBy = [
    peer.gapSolved,
    peer.awards[0] ? 'Competition recognition' : '',
    peer.proofCreated[0] ? 'Public proof' : '',
    peer.leadership[0] ? 'Leadership ownership' : '',
    peer.spike.toLowerCase().includes('investment') || peer.spike.toLowerCase().includes('business') ? 'Investor-facing work' : '',
  ].filter(Boolean);

  return {
    from: analysis.archetype,
    to: peer.archetype.includes('Builder') && peer.spike.toLowerCase().includes('investment')
      ? 'Founder-Investor'
      : peer.archetype,
    createdBy: [...new Set(createdBy)].slice(0, 4),
  };
}

function scorePeerMatch({
  peer,
  profile,
  analysis,
}: {
  peer: AdmittedPeerProfile;
  profile: Profiles;
  analysis: NarrativeAnalysis;
}) {
  const reasons: string[] = [];
  const userBaseArchetype = getBaseArchetype(analysis.archetype);
  const peerBaseArchetype = getBaseArchetype(peer.archetype);
  const scoreDelta = Math.abs(peer.narrativeScore - analysis.score);
  const schoolOverlap = overlapCount(profile.target_schools, peer.schoolsAdmitted);
  const majorOverlap = textOverlap(profile.intended_major || '', peer.intendedMajor);
  const userSignals = getUserSignals(analysis);
  const sharedSignals = peer.strongestSignals.filter((signal) => (
    userSignals.some((userSignal) => userSignal.toLowerCase().includes(signal.toLowerCase()) || signal.toLowerCase().includes(userSignal.toLowerCase()))
  ));
  const signalOverlap = overlapRatio(userSignals, peer.strongestSignals);

  let archetypeScore = 0;
  if (peerBaseArchetype === userBaseArchetype) {
    archetypeScore = 40;
    reasons.push(`Same narrative family: ${peer.archetype}.`);
  } else if (
    (userBaseArchetype === 'Builder' && ['Leader', 'Researcher', 'Explorer'].includes(peerBaseArchetype))
    || (userBaseArchetype === 'Leader' && ['Builder', 'Advocate'].includes(peerBaseArchetype))
    || (userBaseArchetype === 'Researcher' && ['Builder', 'Explorer'].includes(peerBaseArchetype))
  ) {
    archetypeScore = 22;
    reasons.push(`Adjacent archetype to your ${analysis.archetype} story.`);
  }

  let majorScore = 0;
  if (majorOverlap > 0) {
    majorScore = Math.min(25, 12 + majorOverlap * 5);
    reasons.push(`Major overlap around ${peer.intendedMajor}.`);
  } else if (textOverlap(`${profile.intended_major || ''} ${analysis.narrative}`, `${peer.intendedMajor} ${peer.spike}`) > 0) {
    majorScore = 10;
    reasons.push(`Adjacent academic direction to ${profile.intended_major || 'your intended major'}.`);
  }

  const signalScore = Math.min(25, Math.round(signalOverlap * 25) + Math.min(10, sharedSignals.length * 4));
  if (sharedSignals.length) {
    reasons.push(`Shared signals: ${sharedSignals.slice(0, 2).join(', ')}.`);
  }

  const scoreProximityScore = Math.max(0, Math.round(10 - Math.min(scoreDelta, 20) / 2));
  if (scoreDelta <= 10) {
    reasons.push('Narrative score is within 10 points of yours.');
  }

  if (schoolOverlap > 0) {
    reasons.push(`Target/admit school overlap: ${profile.target_schools.filter((school) => peer.schoolsAdmitted.map((item) => item.toLowerCase()).includes(school.toLowerCase())).join(', ')}.`);
  }

  const score = archetypeScore + majorScore + signalScore + scoreProximityScore;

  return { score, reasons, sharedSignals };
}

export function matchAdmittedProfiles({
  admittedProfiles,
  profile,
  activities,
  analysis,
}: {
  admittedProfiles: AdmittedPeerProfile[];
  profile: Profiles;
  activities: Activities[];
  analysis: NarrativeAnalysis;
}): PeerMatch[] {
  const windows = [10, 15, 20];
  const userSignals = getUserSignals(analysis);

  for (const scoreWindow of windows) {
    const matches = admittedProfiles
      .map((peer) => {
        const scored = scorePeerMatch({ peer, profile, analysis });
        const missingSignals = getMissingSignals(userSignals, peer.strongestSignals, analysis.gap.label);
        const activityNames = activities.map((activity) => activity.activity_name).filter(Boolean);
        const topActivity = activityNames[0] || 'your strongest activity';
        const whatThisMeans = `Your story is similar, but the biggest missing layer is ${missingSignals[0] || analysis.gap.label}. This admitted profile made a related ${getBaseArchetype(peer.archetype)} story stronger by adding ${peer.gapSolved.toLowerCase()}, visible proof, and a tighter connection between ${peer.activities[0] || peer.spike} and their admitted identity.`;

        return {
          profile: peer,
          score: scored.score,
          matchReasons: scored.reasons.length ? scored.reasons.slice(0, 4) : [`Both profiles share a ${getBaseArchetype(analysis.archetype)}-style narrative pattern.`],
          sharedSignals: scored.sharedSignals,
          missingSignals,
          storyStrengths: buildStoryStrengths(peer),
          whyScoredHigher: buildWhyScoredHigher(peer, analysis),
          storyConstruction: buildStoryConstruction(peer),
          narrativeShift: buildNarrativeShift(analysis, peer),
          whatThisMeans: whatThisMeans.replace('your strongest activity', topActivity),
          relatedActionSignal: missingSignals[0] || peer.gapSolved || analysis.gap.label,
        };
      })
      .filter((match) => Math.abs(match.profile.narrativeScore - analysis.score) <= scoreWindow || match.score >= 35)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (matches.length >= 3 || scoreWindow === 20) return matches;
  }

  return [];
}

export const peerBenchmarkColumnsUsed = [
  'profile_id',
  'archetype',
  'narrative_score',
  'score_range',
  'grade_year',
  'intended_major',
  'ec_1',
  'ec_2',
  'ec_3',
  'ec_4',
  'ec_5',
  'spike',
  'awards',
  'leadership',
  'schools_admitted',
  'schools_rejected',
  'narrative_tags',
  'illustrative',
];

export { signalVocabulary };
