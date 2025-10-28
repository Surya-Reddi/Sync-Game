import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameLobby } from './components/GameLobby';
import { GamePlay } from './components/GamePlay';
import { Results } from './components/Results';
import { useGame, createGame, joinGame, submitChoice } from './hooks/useGame';

type GameState = 'welcome' | 'lobby' | 'playing' | 'finished';

function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const { game, players, currentRound, loading } = useGame(gameId);

// Add this temporarily
console.log('Debug:', { 
  gameState, 
  gameStatus: game?.status, 
  playersCount: players.length,
  hasCurrentRound: !!currentRound,
  gameId,
  playerId 
});

  // Handle game state transitions based on game status
  useEffect(() => {
    if (!game) return;

    // Only transition to playing if we're in lobby and game status is playing
    if (game.status === 'playing' && gameState === 'lobby') {
      // Small delay to allow smooth transition
      const timer = setTimeout(() => {
        setGameState('playing');
      }, 500);
      return () => clearTimeout(timer);
    }

    // Transition to finished when game is complete
    if (game.status === 'finished' && gameState === 'playing') {
      const timer = setTimeout(() => {
        setGameState('finished');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [game?.status, gameState]);

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
      
      {gameState === 'playing' && gameId && playerId && game && currentRound && (
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