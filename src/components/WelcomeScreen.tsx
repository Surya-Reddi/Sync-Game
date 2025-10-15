import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onCreateGame: (name: string) => void;
  onJoinGame: (name: string, roomCode: string) => void;
}

export const WelcomeScreen = ({ onCreateGame, onJoinGame }: WelcomeScreenProps) => {
  const [mode, setMode] = useState<'main' | 'create' | 'join'>('main');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (mode === 'create') {
      onCreateGame(name);
    } else if (mode === 'join' && roomCode.trim()) {
      onJoinGame(name, roomCode);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 animate-gradient"></div>

      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-float"
            style={{
              width: Math.random() * 100 + 20 + 'px',
              height: Math.random() * 100 + 20 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 3 + 's',
              opacity: Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {mode === 'main' && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-6 animate-float">
              <Sparkles className="w-16 h-16 text-white animate-glow" />
            </div>

            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight animate-bounce-in">
              Mind Meld
            </h1>

            <p className="text-xl text-white/90 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Think alike, win together
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full glass-morphism-strong text-white px-8 py-4 rounded-2xl text-lg font-semibold
                  transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                  hover:shadow-white/30 active:scale-95 animate-slide-up"
                style={{ animationDelay: '0.3s' }}
              >
                Create Game
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full glass-morphism text-white px-8 py-4 rounded-2xl text-lg font-semibold
                  transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                  hover:shadow-white/20 active:scale-95 animate-slide-up"
                style={{ animationDelay: '0.4s' }}
              >
                Join Game
              </button>
            </div>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="glass-morphism-strong rounded-3xl p-8 animate-scale-up">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              {mode === 'create' ? 'Create Game' : 'Join Game'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white
                    placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50
                    transition-all duration-300"
                  maxLength={20}
                />
              </div>

              {mode === 'join' && (
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white
                      placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50
                      transition-all duration-300 uppercase"
                    maxLength={6}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMode('main')}
                  className="flex-1 glass-morphism text-white px-6 py-3 rounded-xl font-semibold
                    transform transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Back
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || (mode === 'join' && !roomCode.trim())}
                  className="flex-1 bg-white text-fuchsia-600 px-6 py-3 rounded-xl font-semibold
                    transform transition-all duration-300 hover:scale-105 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    shadow-lg hover:shadow-2xl"
                >
                  {mode === 'create' ? 'Create' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
