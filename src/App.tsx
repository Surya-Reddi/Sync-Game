import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameLobby } from './components/GameLobby';
import { GamePlay } from './components/GamePlay';
import { Results } from './components/Results';
import { useGame, createGame, joinGame, submitChoice } from './hooks/useGame';

import { supabase } from './supabaseClient';

// Add this temporarily to test connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test the connection
supabase.from('games').select('count').then(result => {
  console.log('Supabase connection test:', result);
});

type GameState = 'welcome' | 'lobby' | 'playing' | 'finished';

function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');

  const { game, players, currentRound, loading } = useGame(gameId);

  const handleCreateGame = async (name: string) => {
    try {
      const result = await createGame(name);
      setGameId(result.gameId);
      setPlayerId(result.playerId);
      setRoomCode(result.roomCode);
      setGameState('lobby');
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    }
  };

  const handleJoinGame = async (name: string, code: string) => {
    try {
      const result = await joinGame(code, name);
      setGameId(result.gameId);
      setPlayerId(result.playerId);
      setRoomCode(code);
      setGameState('lobby');
    } catch (error) {
      console.error('Failed to join game:', error);
      alert('Failed to join game. Please check the room code and try again.');
    }
  };

  const handleSubmitChoice = async (choice: string) => {
    if (!gameId || !playerId) return;
    try {
      await submitChoice(gameId, playerId, choice);
    } catch (error) {
      console.error('Failed to submit choice:', error);
    }
  };

  const handlePlayAgain = () => {
    setGameState('welcome');
    setGameId(null);
    setPlayerId(null);
    setRoomCode('');
  };

  if (loading && gameState !== 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500">
        <div className="text-white text-2xl font-semibold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (game?.status === 'playing' && gameState === 'lobby') {
    setGameState('playing');
  }

  if (game?.status === 'finished' && gameState === 'playing') {
    setGameState('finished');
  }

  return (
    <div className="min-h-screen">
      {gameState === 'welcome' && (
        <WelcomeScreen
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
        />
      )}

      {gameState === 'lobby' && playerId && (
        <GameLobby
          roomCode={roomCode}
          players={players}
          currentPlayerId={playerId}
        />
      )}

      {gameState === 'playing' && gameId && playerId && (
        <GamePlay
          gameId={gameId}
          players={players}
          currentRound={currentRound}
          currentPlayerId={playerId}
          onSubmitChoice={handleSubmitChoice}
        />
      )}

      {gameState === 'finished' && (
        <Results players={players} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
}

export default App;
