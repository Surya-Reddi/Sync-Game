import { useEffect, useState } from 'react';
import { Player } from '../types';
import { Trophy, Sparkles, RotateCcw } from 'lucide-react';
import { Confetti } from './Confetti';

interface ResultsProps {
  players: Player[];
  onPlayAgain: () => void;
}

export const Results = ({ players, onPlayAgain }: ResultsProps) => {
  const [animatedScores, setAnimatedScores] = useState<number[]>([0, 0]);
  const [showConfetti, setShowConfetti] = useState(false);

  const totalScore = players.reduce((sum, p) => sum + p.score, 0);
  const compatibility = Math.round((totalScore / 20) * 100);

  const getMessage = () => {
    if (compatibility >= 80) return { text: 'Mind Readers!', emoji: '🔮', color: 'text-green-300' };
    if (compatibility >= 60) return { text: 'Great Connection!', emoji: '✨', color: 'text-cyan-300' };
    if (compatibility >= 40) return { text: 'Getting There!', emoji: '🎯', color: 'text-yellow-300' };
    return { text: 'Practice Makes Perfect!', emoji: '💪', color: 'text-pink-300' };
  };

  useEffect(() => {
    if (compatibility >= 60) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    const duration = 2000;
    const steps = 60;
    const increment = players.map((p) => p.score / steps);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedScores(
        players.map((p, i) =>
          Math.min(Math.round(increment[i] * currentStep), p.score)
        )
      );

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [players, compatibility]);

  const message = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 animate-gradient"></div>

      {showConfetti && <Confetti />}

      <div className="absolute inset-0 opacity-20">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 3 + 's',
            }}
          >
            <Sparkles className="w-8 h-8 text-white opacity-50" />
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-morphism-strong rounded-3xl p-8 md:p-12 animate-scale-up">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="w-20 h-20 text-yellow-300 animate-bounce" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-8 animate-bounce-in">
            Game Over!
          </h1>

          <div className="space-y-6 mb-8">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`glass-morphism rounded-2xl p-6 ${
                  index === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="text-sm text-white/70">
                        Player {player.player_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold text-white animate-pulse">
                      {animatedScores[index]}
                    </p>
                    <p className="text-sm text-white/70">matches</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-morphism rounded-3xl p-8 mb-8 text-center animate-bounce-in">
            <p className="text-white/80 text-sm mb-2">Compatibility Score</p>

            <div className="mb-4">
              <div className="h-6 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-violet-400 transition-all duration-2000 ease-out rounded-full"
                  style={{ width: `${compatibility}%` }}
                />
              </div>
            </div>

            <div className="text-7xl font-bold text-white mb-4 animate-glow">
              {compatibility}%
            </div>

            <div className={`text-3xl font-bold ${message.color} animate-bounce-in`}>
              {message.text} {message.emoji}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onPlayAgain}
              className="flex-1 glass-morphism-strong text-white px-8 py-4 rounded-2xl text-xl font-semibold
                transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                hover:shadow-white/30 active:scale-95 flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-6 h-6" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
