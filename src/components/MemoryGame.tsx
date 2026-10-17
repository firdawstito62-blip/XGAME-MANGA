import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Timer, Move, Star } from 'lucide-react';

interface MemoryGameProps {
  onEarnRewards: (coins: number, exp: number) => void;
}

interface CardItem {
  id: number;
  symbol: string;
  name: string;
  matched: boolean;
}

const SYMBOLS_POOL = [
  { symbol: '👒', name: 'Chapeau de Paille' },
  { symbol: '🌀', name: 'Sceau Rasengan' },
  { symbol: '⚡', name: 'Éclair Godspeed' },
  { symbol: '🐉', name: 'Dragon 4 Étoiles' },
  { symbol: '⚔️', name: 'Lame Nichirin' },
  { symbol: '👁️', name: 'Œil Écarlate' },
  { symbol: '🗝️', name: 'Clé du Sous-Sol' },
  { symbol: '🍎', name: 'Pomme Shinigami' },
];

export const MemoryGame: React.FC<MemoryGameProps> = ({ onEarnRewards }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Initialize and shuffle cards
  const initializeGame = () => {
    sound.playClick();
    const paired = [...SYMBOLS_POOL, ...SYMBOLS_POOL].map((item, idx) => ({
      id: idx,
      symbol: item.symbol,
      name: item.name,
      matched: false,
    }));

    // Fisher-Yates shuffle
    for (let i = paired.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paired[i], paired[j]] = [paired[j], paired[i]];
    }

    setCards(paired);
    setFlippedIndices([]);
    setMoves(0);
    setSeconds(0);
    setIsRunning(false);
    setIsWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isWon) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isWon]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].matched || flippedIndices.includes(index)) {
      return;
    }

    if (!isRunning) setIsRunning(true);
    sound.playCardFlip();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].symbol === cards[second].symbol) {
        // Matched pair!
        sound.playCorrect();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === first || i === second ? { ...c, matched: true } : c))
          );
          setFlippedIndices([]);

          // Check if all matched
          const remainingUnmatched = cards.filter(
            (c, i) => !c.matched && i !== first && i !== second
          );
          if (remainingUnmatched.length === 0) {
            handleVictory();
          }
        }, 400);
      } else {
        // Not matched -> flip back after delay
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const handleVictory = () => {
    setIsWon(true);
    setIsRunning(false);
    sound.playVictory();
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {
      // Confetti fallback
    }

    const coinReward = Math.max(50, 220 - moves * 5);
    const expReward = Math.max(60, 260 - moves * 4);
    onEarnRewards(coinReward, expReward);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-orange-400 font-mono">Entraînement Mental</span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
            Mémoire Jutsu : Symboles Sacrés
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Retrouvez toutes les paires d'artefacts manga le plus rapidement possible avec le moins de coups.
          </p>
        </div>

        {/* HUD Counters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg flex items-center gap-2">
            <Timer className="w-4 h-4 text-sky-400" />
            <div>
              <span className="text-slate-500 block text-[10px]">TEMPS</span>
              <span className="text-white font-bold tabular-nums">{formatTime(seconds)}</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg flex items-center gap-2">
            <Move className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-500 block text-[10px]">COUPS</span>
              <span className="text-white font-bold tabular-nums">{moves}</span>
            </div>
          </div>
          <button
            onClick={initializeGame}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Recommencer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Grid Area */}
      <div className="bg-[#121622] border border-slate-800 rounded-xl p-5 sm:p-8 manga-panel">
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx) || card.matched;

            return (
              <button
                key={card.id}
                disabled={card.matched || flippedIndices.length === 2}
                onClick={() => handleCardClick(idx)}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-200 cursor-pointer ${
                  card.matched
                    ? 'bg-emerald-950/40 border-emerald-500/60 opacity-80 cursor-default'
                    : isFlipped
                    ? 'bg-slate-800 border-orange-500 shadow-md shadow-orange-500/20 rotate-0'
                    : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
              >
                {isFlipped ? (
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <span className="text-3xl sm:text-4xl">{card.symbol}</span>
                    <span className="hidden sm:block text-[10px] font-mono text-slate-300 mt-1 truncate max-w-[80px]">
                      {card.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Sparkles className="w-5 h-5 text-slate-600" />
                    <span className="text-[10px] font-mono mt-1 text-slate-500">JUTSU</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VICTORY MODAL */}
      {isWon && (
        <div className="mt-6 bg-[#121622] border-2 border-amber-500/50 rounded-xl p-6 sm:p-8 manga-panel text-center max-w-lg mx-auto space-y-4">
          <div className="flex justify-center gap-1.5 text-amber-400">
            <Star className="w-7 h-7 fill-amber-400" />
            <Star className="w-8 h-8 fill-amber-400 -mt-1" />
            <Star className={`w-7 h-7 ${moves <= 24 ? 'fill-amber-400' : 'text-slate-600'}`} />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white">Mémoire Parfaite !</h2>
          <p className="text-xs text-slate-300">
            Tous les sceaux ont été descellés en <span className="text-white font-bold">{formatTime(seconds)}</span> et <span className="text-white font-bold">{moves} coups</span> !
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">RÉCOMPENSE PIÈCES</span>
              <span className="text-amber-400 font-bold text-base">+{Math.max(50, 220 - moves * 5)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">EXP GAGNÉE</span>
              <span className="text-indigo-400 font-bold text-base">+{Math.max(60, 260 - moves * 4)}</span>
            </div>
          </div>
          <button
            onClick={initializeGame}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Rejouer une Partie
          </button>
        </div>
      )}
    </div>
  );
};
