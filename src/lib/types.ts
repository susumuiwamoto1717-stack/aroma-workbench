export interface Fragrance {
  id: string;
  name: string;
  description: string;
}

export interface Choice {
  id: string;
  label: string;
  fragranceIds: string[];
}

export interface Question {
  id: string;
  number: number; // 1-7（お客さんが答える順番）
  text: string;
  choices: Choice[];
}

export interface PatternNote {
  id: string;
  questionNumber: number; // 0=全体メモ, 1-7=各質問へのメモ
  text: string;
  createdAt: string;
}

export interface Pattern {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  notes: PatternNote[];
}

export interface AppState {
  fragrances: Fragrance[];
  patterns: Pattern[];
}

export interface SimulationResult {
  answers: { questionNumber: number; choiceId: string }[];
  scores: { fragranceId: string; score: number; matchedQuestions: number[] }[];
  winner: Fragrance | null;
}
