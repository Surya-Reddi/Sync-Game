import { useState, useEffect } from 'react';
import { Player, Round, WORD_PAIRS } from '../types';
import { Countdown } from './Countdown';
import { Confetti } from './Confetti';
import { Check } from 'lucide-react';

interface GamePlayProps {
  gameId: string;
  players: Player[];
  currentRound: Round | null;
  currentPlayerId: string;
  onSubmitChoice: (choice: string) => void;
}

export const GamePlay = ({
  players,
  currentRound,
  currentPlayerId,
  onSubmitChoice,
}: GamePlayProps) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showCountdown, setShowCountdown] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const hasSubmitted =
    currentPlayer?.player_number === 1
      ? currentRound?.player1_choice !== null
      : currentRound?.player2_choice !== null;

  const bothSubmitted =
    currentRound?.player1_choice !== null &&
    currentRound?.player2_choice !== null;

  useEffect(() => {
    if (bothSubmitted && currentRound?.is_match !== null && currentRound) {
      setShowResult(true);
      if (currentRound.is_match) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      setShowResult(false);
    }
  }, [bothSubmitted, currentRound?.is_match, currentRound]);

  useEffect(() => {
    setSelectedChoice(null);
    setShowCountdown(true);
    setShowResult(false);
  }, [currentRound?.round_number]);

  const handleChoiceSelect = (choice: string) => {
    if (hasSubmitted) return;
    setSelectedChoice(choice);
  };

  const handleSubmit = () => {
    if (!selectedChoice || hasSubmitted) return;
    onSubmitChoice(selectedChoice);
  };

  if (!currentRound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const wordPair = WORD_PAIRS[currentRound.round_number - 1];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 animate-gradient"></div>

      {showCountdown && <Countdown onComplete={() => setShowCountdown(false)} />}
      {showConfetti && <Confetti />}

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="glass-morphism rounded-2xl px-6 py-3">
          <p className="text-white/80 text-sm">Round</p>
          <p className="text-white text-2xl font-bold">
            {currentRound.round_number}/10
          </p>
        </div>

        <div className="flex gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="glass-morphism rounded-2xl px-6 py-3 text-center"
            >
              <p className="text-white/80 text-sm">{player.name}</p>
              <p className="text-white text-2xl font-bold">{player.score}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mt-24">
        <div
          className={`glass-morphism-strong rounded-3xl p-8 md:p-12 mb-8 text-center animate-flip
            ${showResult && currentRound.is_match ? 'ring-4 ring-green-400 shadow-2xl shadow-green-400/50' : ''}
            ${showResult && !currentRound.is_match ? 'animate-shake' : ''}`}
        >
          <div className="text-7xl md:text-9xl font-bold text-white mb-4 tracking-tight">
            {wordPair.word}
          </div>
          <p className="text-white/80 text-lg">Choose the best match</p>
        </div>

        {showResult && (
          <div className="text-center mb-8 animate-bounce-in">
            <div
              className={`inline-block glass-morphism-strong rounded-2xl px-8 py-4 ${
                currentRound.is_match
                  ? 'ring-4 ring-green-400 shadow-2xl shadow-green-400/50'
                  : ''
              }`}
            >
              <p
                className={`text-3xl font-bold ${
                  currentRound.is_match ? 'text-green-300' : 'text-white/70'
                }`}
              >
                {currentRound.is_match ? 'PERFECT MATCH!' : 'Not this time...'}
              </p>
              <p className="text-white/80 mt-2">
                Player 1: {currentRound.player1_choice} | Player 2:{' '}
                {currentRound.player2_choice}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wordPair.options.map((option, index) => {
            const isSelected = selectedChoice === option;
            const isPlayer1Choice = currentRound.player1_choice === option;
            const isPlayer2Choice = currentRound.player2_choice === option;

            return (
              <button
                key={option}
                onClick={() => handleChoiceSelect(option)}
                disabled={hasSubmitted}
                className={`glass-morphism-strong rounded-2xl p-8 text-2xl font-semibold text-white
                  transform transition-all duration-300 animate-slide-up
                  ${!hasSubmitted && 'hover:scale-105 hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-2'}
                  ${isSelected && !hasSubmitted && 'scale-105 ring-4 ring-white shadow-2xl shadow-white/50'}
                  ${hasSubmitted && 'cursor-not-allowed opacity-75'}
                  ${showResult && (isPlayer1Choice || isPlayer2Choice) && 'ring-4 ring-cyan-400 shadow-xl'}
                  active:scale-95`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  {option}
                  {isSelected && hasSubmitted && (
                    <Check className="w-8 h-8 absolute -top-2 -right-2 text-green-400 animate-bounce-in" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!hasSubmitted && selectedChoice && (
          <div className="mt-8 text-center animate-slide-up">
            <button
              onClick={handleSubmit}
              className="glass-morphism-strong text-white px-12 py-4 rounded-2xl text-xl font-semibold
                transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                active:scale-95 ring-2 ring-white/50"
            >
              Lock In Choice
            </button>
          </div>
        )}

        {hasSubmitted && !bothSubmitted && (
          <div className="mt-8 text-center animate-slide-up">
            <div className="glass-morphism rounded-2xl px-8 py-4 inline-block">
              <p className="text-white text-lg animate-pulse-slow">
                Waiting for other player...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
