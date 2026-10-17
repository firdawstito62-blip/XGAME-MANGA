import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Zap, Trophy, Play, RotateCcw } from 'lucide-react';

interface NinjaReflexGameProps {
  onEarnRewards: (coins: number, exp: number) => void;
  bestTimeMs: number | null;
  onUpdateBestTime: (timeMs: number) => void;
}

type DuelPhase = 'IDLE' | 'WAITING' | 'SLASH' | 'RESULT' | 'EARLY_PENALTY';

export const NinjaReflexGame: React.FC<NinjaReflexGameProps> = ({
  onEarnRewards,
  bestTimeMs,
  onUpdateBestTime,
}) => {
  const [phase, setPhase] = useState<DuelPhase>('IDLE');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slashStartTimeRef = useRef<number>(0);

  const startDuel = () => {
    sound.playClick();
    setPhase('WAITING');
    setReactionTime(null);

    // Random delay between 2200ms and 5200ms
    const delay = Math.floor(Math.random() * 3000) + 2200;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      slashStartTimeRef.current = performance.now();
      setPhase('SLASH');
      sound.playSlash();
    }, delay);
  };

  const handleStrike = () => {
    if (phase === 'WAITING') {
      // False start / clicked too early
      if (timerRef.current) clearTimeout(timerRef.current);
      sound.playWrong();
      setPhase('EARLY_PENALTY');
      return;
    }

    if (phase === 'SLASH') {
      const now = performance.now();
      const diffMs = Math.round(now - slashStartTimeRef.current);
      sound.playImpact();
      setReactionTime(diffMs);
      setPhase('RESULT');
      setRoundsPlayed((prev) => prev + 1);

      if (!bestTimeMs || diffMs < bestTimeMs) {
        onUpdateBestTime(diffMs);
        if (diffMs < 250) {
          try {
            confetti({ particleCount: 50, spread: 60 });
          } catch {
            // Confetti fallback
          }
        }
      }

      // Calculate reward: faster = more coins
      const coins = Math.max(20, Math.round(600 - diffMs));
      const exp = Math.max(30, Math.round(500 - diffMs * 0.8));
      onEarnRewards(coins, exp);
    }
  };

  // Keyboard Spacebar trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'IDLE' || phase === 'RESULT' || phase === 'EARLY_PENALTY') {
          startDuel();
        } else if (phase === 'WAITING' || phase === 'SLASH') {
          handleStrike();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  const getRank = (ms: number) => {
    if (ms < 190) return { title: 'Hokage Divin / Hashira Légendaire', desc: 'Vitesse divine quasi-instantanée !', color: 'text-amber-400' };
    if (ms < 240) return { title: 'Jonin d\'Élite', desc: 'Des réflexes dignes des forces spéciales ANBU.', color: 'text-purple-400' };
    if (ms < 310) return { title: 'Chunin Aguerri', desc: 'Très bon temps de réaction en combat.', color: 'text-sky-400' };
    if (ms < 400) return { title: 'Genin Débutant', desc: 'La frappe est portée mais manque un peu d\'entraînement.', color: 'text-emerald-400' };
    return { title: 'Apprenti de l\'Académie', desc: 'Gardez votre calme et observez le signal.', color: 'text-slate-400' };
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-orange-400 font-mono">Dojo de Réflexe</span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
            Duel au Sabre : Épreuve du Dégainage Éclair
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Attendez le signal rouge « FRAPPEZ ! » et cliquez ou appuyez sur Espace le plus vite possible.
          </p>
        </div>

        {/* Best Record Display */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-lg flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-500 block text-[10px]">MEILLEUR TEMPS</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {bestTimeMs ? `${bestTimeMs} ms` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Duel Arena Box */}
      <div
        onClick={() => {
          if (phase === 'WAITING' || phase === 'SLASH') handleStrike();
        }}
        className={`relative w-full h-[360px] sm:h-[420px] rounded-2xl border-2 flex flex-col items-center justify-center p-6 text-center select-none transition-all duration-150 cursor-pointer manga-panel overflow-hidden ${
          phase === 'WAITING'
            ? 'bg-slate-950 border-amber-500/40'
            : phase === 'SLASH'
            ? 'bg-red-950/90 border-red-500 shadow-2xl shadow-red-600/30'
            : phase === 'EARLY_PENALTY'
            ? 'bg-rose-950/40 border-rose-800'
            : 'bg-[#121622] border-slate-800'
        }`}
      >
        {/* Background Dojo Visual */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src="/src/assets/images/manga_ninja_shadow_1792191779333.jpg"
            alt="Dojo Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* STATE: IDLE */}
        {phase === 'IDLE' && (
          <div className="relative z-10 space-y-4 max-w-md">
            <div className="w-16 h-16 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center mx-auto text-orange-400">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Prêt pour le Dégainage ?</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Placez votre doigt sur la souris ou la touche [Espace]. Lorsque le signal apparaît, frappez sans la moindre hésitation !
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startDuel();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold text-sm rounded-lg shadow-lg shadow-orange-900/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Démarrer le Duel (Espace)</span>
            </button>
          </div>
        )}

        {/* STATE: WAITING */}
        {phase === 'WAITING' && (
          <div className="relative z-10 space-y-3 animate-pulse">
            <span className="text-amber-400 font-mono text-sm tracking-widest block uppercase">
              • CONCENTREZ VOTRE CHAKRA •
            </span>
            <div className="font-display text-4xl sm:text-5xl font-black text-slate-200">
              ATTENDEZ LE SIGNAL...
            </div>
            <p className="text-xs text-slate-400">Ne cliquez pas encore !</p>
          </div>
        )}

        {/* STATE: SLASH */}
        {phase === 'SLASH' && (
          <div className="relative z-10 space-y-2 animate-bounce">
            <div className="text-6xl sm:text-8xl font-black text-white font-display tracking-wider drop-shadow-md">
              斬 FRAPPEZ !
            </div>
            <span className="text-base text-red-200 font-bold uppercase tracking-widest">
              CLIQUEZ OU ESPACE MAINTENANT !
            </span>
          </div>
        )}

        {/* STATE: EARLY PENALTY */}
        {phase === 'EARLY_PENALTY' && (
          <div className="relative z-10 space-y-4 max-w-md">
            <div className="font-display text-3xl font-black text-rose-400">
              FAUX DÉPART !
            </div>
            <p className="text-sm text-slate-300">
              Vous avez dégainé avant le signal. En combat d'élite, l'impatience est synonyme de défaite.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startDuel();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réessayer (Espace)</span>
            </button>
          </div>
        )}

        {/* STATE: RESULT */}
        {phase === 'RESULT' && reactionTime !== null && (
          <div className="relative z-10 space-y-4 max-w-md">
            <div className="font-mono text-xs uppercase text-slate-400 tracking-wider">Temps de Réaction</div>
            <div className="font-display text-5xl sm:text-6xl font-black text-white tabular-nums">
              {reactionTime} <span className="text-2xl font-mono text-orange-400">ms</span>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <div className={`font-display font-bold text-base ${getRank(reactionTime).color}`}>
                {getRank(reactionTime).title}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{getRank(reactionTime).desc}</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startDuel();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold text-sm rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rejouer (Espace)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ranks Guide Section */}
      <div className="mt-6 bg-[#121622] border border-slate-800 rounded-xl p-5 manga-panel">
        <h3 className="font-display font-bold text-sm text-white mb-3">Grille des Rangs Ninjas & Samouraïs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-amber-400 font-bold block">&lt; 200 ms</span>
            <span className="text-slate-300">Rang Hokage</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-purple-400 font-bold block">200 - 240 ms</span>
            <span className="text-slate-300">Rang Jonin d'Élite</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-sky-400 font-bold block">241 - 310 ms</span>
            <span className="text-slate-300">Rang Chunin</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-emerald-400 font-bold block">311 - 400 ms</span>
            <span className="text-slate-300">Rang Genin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
