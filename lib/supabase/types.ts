export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Profiles {
  id: string;
  user_id: string;
  full_name: string;
  grade_year: number;
  intended_major: string | null;
  target_schools: string[];
  awards: string[];
  passion_statement: string | null;
  onboarded: boolean;
  activities_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Activities {
  id: string;
  profile_id: string;
  activity_name: string;
  role: string;
  years_involved: number;
  hours_per_week: number;
  description: string | null;
  biggest_achievement: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Honors {
  id: string;
  profile_id: string;
  title: string;
  issuer: string | null;
  year: number | null;
  level: string | null;
  created_at: string;
}

export interface Essays {
  id: string;
  profile_id: string;
  prompt: string;
  school: string | null;
  word_limit: number | null;
  word_count: number | null;
  status: string;
  last_edited: string | null;
  created_at: string;
}

export interface Analyses {
  id: string;
  user_id: string;
  profile_id: string | null;
  archetype: string;
  score: number;
  narrative: string;
  signals: Json;
  biggest_gap: Json;
  admissions_impact: Json;
  created_at: string;
}

export interface NarrativeRoadmaps {
  id: string;
  user_id: string;
  profile_id: string;
  analysis_id: string;
  current_narrative: Json;
  narrative_tension: Json;
  missing_signals: Json;
  narrative_risk: Json;
  next_narrative_stage: Json;
  signal_builders: Json;
  potential_score_path: Json;
  future_narrative_projection: Json;
  model: string | null;
  generated_with: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profiles;
        Insert: Omit<Profiles, 'id' | 'created_at' | 'updated_at' | 'activities_complete' | 'onboarded' | 'awards'> & {
          activities_complete?: boolean;
          onboarded?: boolean;
          awards?: string[];
        };
        Update: Partial<Omit<Profiles, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      activities: {
        Row: Activities;
        Insert: Omit<Activities, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Activities, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>;
      };
      honors: {
        Row: Honors;
        Insert: Omit<Honors, 'id' | 'created_at'>;
        Update: Partial<Omit<Honors, 'id' | 'profile_id' | 'created_at'>>;
      };
      essays: {
        Row: Essays;
        Insert: Omit<Essays, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Essays, 'id' | 'profile_id' | 'created_at'>>;
      };
      analyses: {
        Row: Analyses;
        Insert: Omit<Analyses, 'id' | 'created_at'>;
        Update: Partial<Omit<Analyses, 'id' | 'user_id' | 'profile_id' | 'created_at'>>;
      };
      narrative_roadmaps: {
        Row: NarrativeRoadmaps;
        Insert: Omit<NarrativeRoadmaps, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NarrativeRoadmaps, 'id' | 'user_id' | 'profile_id' | 'analysis_id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
