export interface Game {
  id: string;
  room_code: string;
  status: 'waiting' | 'playing' | 'finished';
  current_round: number;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  game_id: string;
  player_number: 1 | 2;
  name: string;
  score: number;
  created_at: string;
}

export interface Round {
  id: string;
  game_id: string;
  round_number: number;
  word: string;
  player1_choice: string | null;
  player2_choice: string | null;
  is_match: boolean | null;
  created_at: string;
}

export interface WordPair {
  word: string;
  options: string[];
}

export const WORD_PAIRS: WordPair[] = [
  { word: 'MOON', options: ['Walk', 'Light', 'Dance'] },
  { word: 'ICE', options: ['Pack', 'Cube', 'Water'] },
  { word: 'ROSE', options: ['Milk', 'Water', 'Flower'] },
  { word: 'SUN', options: ['Rise', 'Set', 'Screen'] },
  { word: 'STAR', options: ['Fish', 'Light', 'Burst'] },
  { word: 'NIGHT', options: ['Stand', 'Mare', 'Time'] },
  { word: 'SNOW', options: ['Ball', 'Flake', 'Man'] },
  { word: 'FIRE', options: ['Fly', 'Work', 'Place'] },
  { word: 'WATER', options: ['Fall', 'Melon', 'Mark'] },
  { word: 'BOOK', options: ['Mark', 'Shelf', 'Worm'] }
];
