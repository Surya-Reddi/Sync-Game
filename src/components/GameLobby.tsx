import { Users, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Player } from '../types';

interface GameLobbyProps {
  roomCode: string;
  players: Player[];
  currentPlayerId: string;
}

export const GameLobby = ({ roomCode, players, currentPlayerId }: GameLobbyProps) => {
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWaiting = players.length < 2;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 animate-gradient"></div>

      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-float"
            style={{
              width: Math.random() * 80 + 20 + 'px',
              height: Math.random() * 80 + 20 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 3 + 's',
              opacity: Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-morphism-strong rounded-3xl p-8 md:p-12 animate-scale-up">
          <div className="flex items-center justify-center mb-8">
            <Users className="w-12 h-12 text-white animate-pulse-slow" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Game Lobby
          </h1>

          <div className="glass-morphism rounded-2xl p-6 mb-8 animate-bounce-in">
            <p className="text-white/80 text-sm text-center mb-2">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl md:text-5xl font-bold text-white tracking-widest">
                {roomCode}
              </div>
              <button
                onClick={copyRoomCode}
                className="glass-morphism p-3 rounded-xl transform transition-all duration-300
                  hover:scale-110 hover:bg-white/20 active:scale-95"
                title="Copy room code"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-green-300" />
                ) : (
                  <Copy className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-8">
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
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="text-sm text-white/70">
                        Player {player.player_number}
                        {player.id === currentPlayerId && ' (You)'}
                      </p>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                </div>
              </div>
            ))}

            {isWaiting && (
              <div className="glass-morphism rounded-2xl p-6 border-2 border-dashed border-white/30 animate-slide-in-right">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white/50" />
                  </div>
                  <p className="text-xl text-white/70 animate-pulse-slow">
                    Waiting for Player 2{dots}
                  </p>
                </div>
              </div>
            )}
          </div>

          {isWaiting && (
            <div className="text-center animate-slide-up">
              <p className="text-white/80 text-sm">
                Share the room code with your friend to start playing!
              </p>
            </div>
          )}

          {!isWaiting && (
            <div className="text-center animate-bounce-in">
              <div className="inline-block glass-morphism rounded-2xl px-6 py-3">
                <p className="text-white text-lg font-semibold animate-pulse">
                  Starting game...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
