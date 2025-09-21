import React, { useState, useEffect, useRef } from 'react';
import { Pokemon } from '../types/pokemon';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
  trail: {x: number, y: number}[];
  type: 'basic' | 'glow' | 'sparkle' | 'trail';
}

interface ParticleSystemProps {
  active: boolean;
  pokemonType: string;
  intensity?: number;
  particleCount?: number;
  className?: string;
}

interface EnergyRingsProps {
  active: boolean;
  color: string;
 count?: number;
  className?: string;
}

interface TypeAuraProps {
  active: boolean;
  pokemonType: string;
  intensity?: number;
  className?: string;
}

interface ScreenFlashProps {
  active: boolean;
  color?: string;
  intensity?: number;
 duration?: number;
 className?: string;
}

interface ChromaticShiftProps {
  active: boolean;
  intensity?: number;
 className?: string;
}

interface RadialBlurProps {
  active: boolean;
  intensity?: number;
  className?: string;
}

// Type color mapping
const getTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    fire: '#FF4422',
    water: '#3399FF',
    electric: '#FFCC33',
    grass: '#7CC55',
    ice: '#66CCFF',
    fighting: '#BB5544',
    poison: '#AA5599',
    ground: '#DDBB55',
    flying: '#8899FF',
    psychic: '#FF5599',
    bug: '#AABB22',
    rock: '#BBAA66',
    ghost: '#667BBB',
    dragon: '#7766EE',
    dark: '#775544',
    steel: '#AAAABB',
    fairy: '#EE99EE',
    normal: '#AAAA99'
  };
  return typeColors[type.toLowerCase()] || '#AAAA99';
};

// Particle System Component
export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  active,
  pokemonType,
  intensity = 1,
 particleCount = 50,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up ResizeObserver for responsive canvas
    resizeObserverRef.current = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        ctx.scale(dpr, dpr);
      }
    });

    if (canvas.parentElement) {
      resizeObserverRef.current.observe(canvas.parentElement);
    }

    // Initialize particles
    const particleColor = getTypeColor(pokemonType);
    particlesRef.current = [];
    
    // Get initial canvas dimensions
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    for (let i = 0; i < particleCount * intensity; i++) {
      const particleType: 'basic' | 'glow' | 'sparkle' | 'trail' = 
        Math.random() < 0.3 ? 'glow' : 
        Math.random() < 0.6 ? 'sparkle' : 
        Math.random() < 0.8 ? 'trail' : 'basic';

      particlesRef.current.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 * intensity + 2,
        color: particleType === 'glow' ? `${particleColor}80` : particleColor,
        speedX: (Math.random() - 0.5) * 4 * intensity,
        speedY: (Math.random() - 0.5) * 4 * intensity,
        life: Math.random() * 100 + 50,
        maxLife: Math.random() * 100 + 50,
        trail: [],
        type: particleType
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Get current canvas dimensions for responsive animation
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 1;

        // Add to trail for trail particles
        if (particle.type === 'trail') {
          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 10) {
            particle.trail.shift();
          }
        }

        // Wrap around edges
        if (particle.x > width) particle.x = 0;
        if (particle.x < 0) particle.x = width;
        if (particle.y > height) particle.y = 0;
        if (particle.y < 0) particle.y = height;

        // Draw particle based on type
        ctx.globalAlpha = particle.life / particle.maxLife;
        
        switch (particle.type) {
          case 'glow':
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = particle.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            break;
            
          case 'sparkle':
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            // Add sparkle effect
            if (Math.random() < 0.1) {
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.globalAlpha = 0.8;
              ctx.fill();
            }
            break;
            
          case 'trail':
            // Draw trail
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.size / 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            particle.trail.forEach((point, index) => {
              if (index === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.stroke();
            
            // Draw main particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            break;
            
          default:
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        // Return true if particle is still alive
        return particle.life > 0;
      });

      // Add new particles to maintain count
      while (particlesRef.current.length < particleCount * intensity) {
        const particleType: 'basic' | 'glow' | 'sparkle' | 'trail' = 
          Math.random() < 0.3 ? 'glow' : 
          Math.random() < 0.6 ? 'sparkle' : 
          Math.random() < 0.8 ? 'trail' : 'basic';

        particlesRef.current.push({
          id: Date.now() + Math.random(),
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 4 * intensity + 2,
          color: particleType === 'glow' ? `${particleColor}80` : particleColor,
          speedX: (Math.random() - 0.5) * 4 * intensity,
          speedY: (Math.random() - 0.5) * 4 * intensity,
          life: Math.random() * 100 + 50,
          maxLife: Math.random() * 100 + 50,
          trail: [],
          type: particleType
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [active, pokemonType, intensity, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
};

// Energy Rings Component
export const EnergyRings: React.FC<EnergyRingsProps> = ({
  active,
  color,
  count = 3,
  className = ''
}) => {
  if (!active) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border-2 animate-ping"
          style={{
            borderColor: color,
            animationDelay: `${i * 0.5}s`,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
  );
};

// Type Aura Component
export const TypeAura: React.FC<TypeAuraProps> = ({
  active,
  pokemonType,
  intensity = 1,
 className = ''
}) => {
  const color = getTypeColor(pokemonType);
  
  if (!active) return null;

  const getAuraEffect = () => {
    switch (pokemonType.toLowerCase()) {
      case 'electric':
        return {
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          animation: 'electric-crackle 0.5s infinite'
        };
      case 'fire':
        return {
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          animation: 'fire-flicker 0.8s infinite'
        };
      case 'water':
        return {
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          animation: 'water-flow 1s infinite'
        };
      default:
        return {
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          animation: 'pulse 2s infinite'
        };
    }
  };

  return (
    <div 
      className={`absolute inset-0 rounded-full pointer-events-none ${className}`}
      style={getAuraEffect()}
    />
  );
};

// Screen Flash Component
export const ScreenFlash: React.FC<ScreenFlashProps> = ({
  active,
  color = '#FFFFFF',
  intensity = 1,
  duration = 300,
  className = ''
}) => {
  if (!active) return null;

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundColor: color,
        opacity: intensity * 0.8,
        animation: `flash ${duration}ms ease-out`
      }}
    />
  );
};

// Chromatic Shift Component
export const ChromaticShift: React.FC<ChromaticShiftProps> = ({
  active,
  intensity = 1,
  className = ''
}) => {
  if (!active) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0"
        style={{
          backdropFilter: `hue-rotate(${intensity * 60}deg) saturate(${1 + intensity})`,
          animation: 'chromatic-shift 0.1s infinite'
        }}
      />
    </div>
  );
};

// Radial Blur Component
export const RadialBlur: React.FC<RadialBlurProps> = ({
  active,
  intensity = 1,
  className = ''
}) => {
  if (!active) return null;

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backdropFilter: `blur(${intensity * 5}px)`,
        mask: 'radial-gradient(circle at center, transparent 30%, black 70%)'
      }}
    />
  );
};

// Main Evolution Effects Component
interface EvolutionEffectsProps {
  pokemon: Pokemon;
  phase: 'anticipation' | 'transformation' | 'reveal' | 'complete';
  intensity?: number;
  className?: string;
}

export const EvolutionEffects: React.FC<EvolutionEffectsProps> = ({
  pokemon,
  phase,
  intensity = 1,
  className = ''
}) => {
  const primaryType = pokemon.types?.[0] ?? 'normal';
  const color = getTypeColor(primaryType);

  return (
    <div className={`relative ${className}`}>
      {/* Particle System */}
      <ParticleSystem
        active={phase === 'anticipation' || phase === 'transformation'}
        pokemonType={primaryType}
        intensity={intensity}
        particleCount={phase === 'transformation' ? 100 : 50}
      />

      {/* Energy Rings during anticipation */}
      <EnergyRings
        active={phase === 'anticipation'}
        color={color}
        count={3}
      />

      {/* Type Aura */}
      <TypeAura
        active={phase !== 'complete'}
        pokemonType={primaryType}
        intensity={intensity}
      />

      {/* Screen Flash during transformation */}
      <ScreenFlash
        active={phase === 'transformation'}
        color={color}
        intensity={intensity}
        duration={200}
      />

      {/* Chromatic Shift during transformation */}
      <ChromaticShift
        active={phase === 'transformation'}
        intensity={intensity}
      />

      {/* Radial Blur during reveal */}
      <RadialBlur
        active={phase === 'reveal'}
        intensity={intensity}
      />

      {/* Custom CSS animations */}
      <style>{`
        @keyframes electric-crackle {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes fire-flicker {
          0%, 100% { opacity: 0.6; }
          25% { opacity: 0.8; }
          50% { opacity: 0.6; }
          75% { opacity: 0.9; }
        }
        @keyframes water-flow {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.02) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes chromatic-shift {
          0% { filter: hue-rotate(0deg); }
          25% { filter: hue-rotate(15deg); }
          50% { filter: hue-rotate(30deg); }
          75% { filter: hue-rotate(15deg); }
          100% { filter: hue-rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default EvolutionEffects;
