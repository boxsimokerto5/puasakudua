import React, { useMemo } from 'react';
import { Snowflake, Sparkle, Sparkles } from 'lucide-react';

interface CrystalParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  swayDuration: number;
  opacity: number;
  type: 'snowflake' | 'crystal' | 'sparkle';
  rotateSpeed: number;
}

export const CrystalSnowEffect: React.FC<{ density?: number }> = ({ density = 32 }) => {
  const particles = useMemo<CrystalParticle[]>(() => {
    const list: CrystalParticle[] = [];
    const types: ('snowflake' | 'crystal' | 'sparkle')[] = ['snowflake', 'crystal', 'sparkle', 'snowflake'];

    for (let i = 0; i < density; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 14 + 8, // 8px - 22px
        duration: Math.random() * 8 + 7, // 7s - 15s fall
        delay: Math.random() * 7,
        swayDuration: Math.random() * 4 + 3,
        opacity: Math.random() * 0.45 + 0.35, // 0.35 - 0.8
        type: types[i % types.length],
        rotateSpeed: Math.random() * 10 + 6,
      });
    }
    return list;
  }, [density]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      <style>{`
        @keyframes crystalSnowFall {
          0% {
            transform: translateY(-30px) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: var(--particle-opacity, 0.7);
          }
          85% {
            opacity: var(--particle-opacity, 0.7);
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes crystalSway {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(18px);
          }
        }
        @keyframes crystalTwinkleGlow {
          0%, 100% {
            filter: drop-shadow(0 0 3px rgba(244, 114, 182, 0.4)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(251, 113, 133, 0.9)) drop-shadow(0 0 14px rgba(244, 114, 182, 0.95));
          }
        }
      `}</style>

      {/* Soft Ambient Pink Radial Backdrops */}
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-pink-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Crystal Snowflakes */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `crystalSnowFall ${p.duration}s linear infinite ${p.delay}s`,
            ['--particle-opacity' as any]: p.opacity,
          }}
          className="pointer-events-none"
        >
          <div
            style={{
              animation: `crystalSway ${p.swayDuration}s ease-in-out infinite, crystalTwinkleGlow 3s ease-in-out infinite`,
            }}
            className="w-full h-full text-pink-300"
          >
            {p.type === 'snowflake' && (
              <Snowflake className="w-full h-full text-pink-300 fill-pink-100/30" />
            )}
            {p.type === 'crystal' && (
              <Sparkle className="w-full h-full text-rose-300 fill-rose-100/40" />
            )}
            {p.type === 'sparkle' && (
              <Sparkles className="w-full h-full text-pink-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
