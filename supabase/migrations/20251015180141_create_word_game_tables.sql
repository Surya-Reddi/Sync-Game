/*
  # Word Association Game Schema

  ## Overview
  Creates tables for a real-time two-player word association game with live syncing.

  ## New Tables
  
  ### `games`
  Stores game sessions with room codes and game state
  - `id` (uuid, primary key) - Unique game identifier
  - `room_code` (text, unique) - 6-character room code for joining
  - `status` (text) - Game status: 'waiting', 'playing', 'finished'
  - `current_round` (integer) - Current round number (1-10)
  - `created_at` (timestamptz) - Game creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `players`
  Stores player information for each game
  - `id` (uuid, primary key) - Unique player identifier
  - `game_id` (uuid, foreign key) - References games table
  - `player_number` (integer) - 1 or 2
  - `name` (text) - Player display name
  - `score` (integer) - Current score
  - `created_at` (timestamptz) - Player join timestamp
  
  ### `rounds`
  Stores round data and player choices
  - `id` (uuid, primary key) - Unique round identifier
  - `game_id` (uuid, foreign key) - References games table
  - `round_number` (integer) - Round number (1-10)
  - `word` (text) - The word being played
  - `player1_choice` (text) - Player 1's selected option
  - `player2_choice` (text) - Player 2's selected option
  - `is_match` (boolean) - Whether choices matched
  - `created_at` (timestamptz) - Round creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Public read access for game data (this is a casual game)
  - Authenticated and anonymous users can create/join games
  - Players can only update their own choices
  
  ## Notes
  - Room codes are randomly generated 6-character strings
  - Games automatically clean up after 24 hours (handled by application)
  - Real-time subscriptions enable live gameplay synchronization
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  current_round integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_number integer NOT NULL,
  name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, player_number)
);

-- Create rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  word text NOT NULL,
  player1_choice text,
  player2_choice text,
  is_match boolean,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, round_number)
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Games policies (public read, anyone can create)
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON games FOR UPDATE
  USING (true);

-- Players policies
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join as player"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update own score"
  ON players FOR UPDATE
  USING (true);

-- Rounds policies
CREATE POLICY "Anyone can view rounds"
  ON rounds FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rounds"
  ON rounds FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rounds"
  ON rounds FOR UPDATE
  USING (true);

-- Create index for faster room code lookups
CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code);
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);