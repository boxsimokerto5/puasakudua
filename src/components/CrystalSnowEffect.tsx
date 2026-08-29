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

export const CrystalSnowEffect: React.FC<{ density?: number; count?: number }> = ({ density, count }) => {
  const actualDensity = density ?? count ?? 12;
  const particles = useMemo<CrystalParticle[]>(() => {
    const list: CrystalParticle[] = [];
    const types: ('snowflake' | 'crystal' | 'sparkle')[] = ['snowflake', 'crystal', 'sparkle', 'snowflake'];

    for (let i = 0; i < actualDensity; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 10 + 8, // 8px - 18px
        duration: Math.random() * 8 + 8, // 8s - 16s fall
        delay: Math.random() * 6,
        swayDuration: Math.random() * 4 + 3,
        opacity: Math.random() * 0.35 + 0.25,
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
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: var(--particle-opacity, 0.5);
          }
          85% {
            opacity: var(--particle-opacity, 0.5);
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
            transform: translateX(12px);
          }
        }
      `}</style>

      {/* Soft Ambient Pink Radial Backdrops (Static without blur filter during scroll) */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-200/20 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-fuchsia-200/20 rounded-full pointer-events-none" />

      {/* Floating Crystal Snowflakes (Optimized without heavy drop-shadow filter animations) */}
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
            willChange: 'transform, opacity',
          }}
          className="pointer-events-none"
        >
          <div
            style={{
              animation: `crystalSway ${p.swayDuration}s ease-in-out infinite`,
              willChange: 'transform',
            }}
            className="w-full h-full text-pink-300/70"
          >
            {p.type === 'snowflake' && (
              <Snowflake className="w-full h-full text-pink-300/70 fill-pink-100/20" />
            )}
            {p.type === 'crystal' && (
              <Sparkle className="w-full h-full text-rose-300/70 fill-rose-100/20" />
            )}
            {p.type === 'sparkle' && (
              <Sparkles className="w-full h-full text-pink-300/70" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
