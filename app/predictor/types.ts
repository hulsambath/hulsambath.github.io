export type League = { id: number; api_league_id: number; name: string; country: string | null };
export type Team = { id: number; api_team_id: number; name: string; logo_url: string | null };
export type ScoreProb = { score: string; p: number };
export type CornersLine = { over: number; under: number };

export type Prediction = {
  model_version: string;
  created_at: string;
  home_exp_goals: number | null;
  away_exp_goals: number | null;
  p_home: number | null;
  p_draw: number | null;
  p_away: number | null;
  p_over_15: number | null;
  p_over_25: number | null;
  p_over_35: number | null;
  p_btts: number | null;
  top_scores: ScoreProb[] | null;
  exp_corners: number | null;
  corners_lines: Record<string, CornersLine> | null;
};

export type Odds = {
  bookmaker: string | null;
  captured_at: string;
  home_win: number | null;
  draw: number | null;
  away_win: number | null;
  over_25: number | null;
  under_25: number | null;
  btts_yes?: number | null;
  btts_no?: number | null;
  is_closing?: boolean;
};

export type Match = {
  id: number;
  source: string;
  version: number;
  api_fixture_id?: number;
  league_id: number;
  season?: number;
  round: string | null;
  kickoff_utc: string;
  status: string;
  provider_updated_at?: string | null;
  home_team: Team;
  away_team: Team;
  home_goals: number | null;
  away_goals: number | null;
  prediction?: Prediction | null;
  odds?: Odds | null;
};

export type DateBucket = { date: string; count: number };

export type FormResult = "W" | "D" | "L";
export type Incident = { minute: number | null; type: "goal" | "card"; team: "home" | "away"; player: string | null; detail: string | null };
export type H2HMatch = { date: string | null; homeName: string | null; awayName: string | null; homeGoals: number | null; awayGoals: number | null };
export type LineupPlayer = { name: string | null; number: number | null; position: string | null; isStarter: boolean };
export type Lineups = { formationHome: string | null; formationAway: string | null; home: LineupPlayer[]; away: LineupPlayer[] };
export type TeamForm = { recent: { date: string | null; opp: string | null; gf: number | null; ga: number | null; result: FormResult }[]; next: { date: string | null; opp: string | null } | null };
export type MatchStats = Record<string, number | null>;
export type MatchDetail = {
  match: Match;
  detail_fetched_at?: string | null;
  stats: MatchStats | null;
  lineups: Lineups | null;
  incidents: Incident[] | null;
  h2h: H2HMatch[] | null;
  home_form: TeamForm | null;
  away_form: TeamForm | null;
  prediction?: Prediction | null;
  odds?: Odds | null;
};
