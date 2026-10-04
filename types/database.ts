export type CognitiveDomain =
  | "reaction_time"
  | "working_memory"
  | "attention"
  | "executive_function"
  | "visual_memory"
  | "processing_speed"
  | "impulse_control";

export type DomainScores = Partial<Record<CognitiveDomain, number>>;

export type Participant = {
  id: string;
  auth_user_id: string | null;
  anon_session_id: string | null;
  age_range: string | null;
  gender: string | null;
  country: string | null;
  education: string | null;
  languages: string[] | null;
  created_at: string;
};

export type SessionIntake = {
  id: string;
  participant_id: string;
  sleep_hours: number | null;
  exercise_frequency: string | null;
  screen_time_hours: number | null;
  stress_level: number | null;
  mood: string | null;
  caffeine_today: boolean | null;
  created_at: string;
};

export type TestDefinition = {
  id: string;
  name: string;
  domain: CognitiveDomain;
  description: string;
  scientific_explanation: string;
  avg_duration_seconds: number;
  difficulty: "Easy" | "Medium" | "Hard";
};

export type TestResult = {
  id: string;
  participant_id: string;
  test_id: string;
  raw_metrics: Record<string, unknown>;
  domain_scores: DomainScores;
  completed_at: string;
};

export type AiReport = {
  id: string;
  participant_id: string;
  test_result_ids: string[];
  report_json: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    study_recommendations: string[];
    health_recommendations: string[];
    disclaimer: string;
  };
  created_at: string;
};

type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      participants: Table<Participant>;
      session_intake: Table<SessionIntake>;
      test_definitions: Table<TestDefinition>;
      test_results: Table<TestResult>;
      ai_reports: Table<AiReport>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
