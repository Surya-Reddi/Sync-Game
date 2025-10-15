import { useEffect, useState } from 'react';

interface CountdownProps {
  onComplete: () => void;
}

export const Countdown = ({ onComplete }: CountdownProps) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        key={count}
        className="text-white text-9xl font-bold animate-scale-up"
        style={{
          animation: 'scaleUpExplode 1s ease-out',
          textShadow: '0 0 40px rgba(255, 255, 255, 0.8)',
        }}
      >
        {count}
      </div>

      <style>{`
        @keyframes scaleUpExplode {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1.5) rotate(10deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
