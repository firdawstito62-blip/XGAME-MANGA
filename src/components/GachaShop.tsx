import React, { useState } from 'react';
import { GachaCard } from '../types';
import { GACHA_CARDS_POOL } from '../data/gachaCards';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Star, Coins } from 'lucide-react';
import { SponsorBanner } from './SponsorBanner';

interface GachaShopProps {
  coins: number;
  onSpendCoins: (amount: number) => boolean;
  onAddCards: (cardIds: string[]) => void;
  collectedCardIds: string[];
  onClaimSponsorReward?: (coins: number) => void;
}

export const GachaShop: React.FC<GachaShopProps> = ({
  coins,
  onSpendCoins,
  onAddCards,
  collectedCardIds,
  onClaimSponsorReward,
}) => {
  const [isSummoning, setIsSummoning] = useState(false);
  const [summonResults, setSummonResults] = useState<GachaCard[]>([]);
  const [activeCardModal, setActiveCardModal] = useState<GachaCard | null>(null);

  // Probabilities: UR = 4%, SSR = 16%, SR = 35%, R = 45%
  const drawCard = (): GachaCard => {
    const roll = Math.random() * 100;
    let targetRarity = 'R';
    if (roll < 4) targetRarity = 'UR';
    else if (roll < 20) targetRarity = 'SSR';
    else if (roll < 55) targetRarity = 'SR';
    else targetRarity = 'R';

    const pool = GACHA_CARDS_POOL.filter((c) => c.rarity === targetRarity);
    return pool[Math.floor(Math.random() * pool.length)] || GACHA_CARDS_POOL[0];
  };

  const handleSummon = (count: number, cost: number) => {
    if (coins < cost) {
      sound.playWrong();
      return;
    }

    if (!onSpendCoins(cost)) return;

    sound.playClick();
    setIsSummoning(true);
    setSummonResults([]);

    setTimeout(() => {
      sound.playGachaSummon();
      const results: GachaCard[] = [];
      for (let i = 0; i < count; i++) {
        results.push(drawCard());
      }

      setSummonResults(results);
      onAddCards(results.map((c) => c.id));
      setIsSummoning(false);

      const hasUR = results.some((r) => r.rarity === 'UR');
      const hasSSR = results.some((r) => r.rarity === 'SSR');

      if (hasUR || hasSSR) {
        try {
          confetti({
            particleCount: hasUR ? 100 : 60,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch {
          // Confetti fallback
        }
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-orange-400 font-mono">Temple Sacré</span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
            Invocation de Héros Manga
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dépensez vos pièces durement gagnées en duel pour invoquer des guerriers légendaires UR et SSR !
          </p>
        </div>

        {/* Currency balance */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg font-mono text-xs">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Solde :</span>
          <span className="text-white font-bold tabular-nums">{coins.toLocaleString('fr-FR')} pièces</span>
        </div>
      </div>

      {/* Main Summon Altar Banner */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#121622] manga-panel min-h-[340px] flex flex-col items-center justify-center p-8 text-center mb-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/hero_anime_arena_1792191777280.jpg"
            alt="Altar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-[#121622]/80 to-transparent pointer-events-none" />

        {isSummoning ? (
          <div className="relative z-10 space-y-4 animate-pulse">
            <div className="w-20 h-20 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="font-display text-2xl sm:text-3xl font-black text-amber-300">
              Convergence Astrale en cours...
            </h2>
            <p className="text-xs text-slate-400">Descente des esprits héroïques...</p>
          </div>
        ) : (
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
              Bannière d'Éveil : Les Titans Shonen
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Taux d'apparition augmentés pour <span className="text-amber-400 font-bold">Nika le Libérateur (UR)</span> et <span className="text-sky-400 font-bold">Gojo l'Infini (UR)</span> ! Chaque carte obtenue renforce votre puissance globale.
            </p>

            {/* Summon Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                disabled={coins < 100}
                onClick={() => handleSummon(1, 100)}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-600 text-white font-display font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>1 Invocation (100 Pièces)</span>
              </button>

              <button
                disabled={coins < 900}
                onClick={() => handleSummon(10, 900)}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-40 text-white font-display font-bold text-sm rounded-lg shadow-lg shadow-orange-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>10x Invocations (900 Pièces)</span>
                <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded font-mono text-amber-300">
                  -10%
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summon Results Display */}
      {summonResults.length > 0 && !isSummoning && (
        <div className="bg-[#121622] border border-slate-800 rounded-xl p-6 manga-panel space-y-4 mb-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-lg text-white">Résultats de l'Invocation</h3>
            <span className="text-xs text-slate-400">{summonResults.length} cartes révélées</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {summonResults.map((card, idx) => {
              const isUr = card.rarity === 'UR';
              const isSsr = card.rarity === 'SSR';

              return (
                <div
                  key={`${card.id}-${idx}`}
                  onClick={() => {
                    sound.playClick();
                    setActiveCardModal(card);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-103 ${
                    isUr
                      ? 'bg-gradient-to-br from-amber-950/60 via-purple-950/40 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/20'
                      : isSsr
                      ? 'bg-slate-900 border-red-500/70 shadow-md shadow-red-500/10'
                      : card.rarity === 'SR'
                      ? 'bg-slate-900 border-indigo-500/50'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isUr
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : isSsr
                          ? 'bg-red-500 text-white'
                          : card.rarity === 'SR'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {card.rarity}
                    </span>
                    <span className="text-[10px] text-slate-400">{card.element}</span>
                  </div>

                  <div className="font-display font-bold text-xs text-white line-clamp-1 mb-1">
                    {card.name}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mb-2">
                    {card.franchise}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 truncate">
                    {card.statBonus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card Inspection Modal */}
      {activeCardModal && (
        <div
          onClick={() => setActiveCardModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121622] border-2 border-slate-700 max-w-sm w-full rounded-2xl p-6 manga-panel relative cursor-default space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                {activeCardModal.rarity}
              </span>
              <span className="text-xs font-mono text-slate-400">Élément : {activeCardModal.element}</span>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-white">{activeCardModal.name}</h3>
              <p className="text-xs text-orange-400 font-mono mt-0.5">{activeCardModal.franchise}</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs italic text-slate-300">
              {activeCardModal.quote}
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
              <span className="text-slate-400 block text-[10px] uppercase">Bonus de Combat Actif</span>
              <span className="text-emerald-400 font-bold">{activeCardModal.statBonus}</span>
            </div>

            <button
              onClick={() => setActiveCardModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Fermer la Fiche
            </button>
          </div>
        </div>
      )}

      {/* Sponsor / Partner Bonus Card */}
      <div className="mb-6">
        <SponsorBanner variant="card" onClaimReward={onClaimSponsorReward} />
      </div>

      {/* Rates Table */}
      <div className="bg-[#121622] border border-slate-800 rounded-xl p-5 manga-panel">
        <h3 className="font-display font-bold text-sm text-white mb-2">Taux d'Invocation Officiels</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-amber-400 font-bold block">4.0%</span>
            <span className="text-slate-300">Ultra Rare (UR)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-rose-400 font-bold block">16.0%</span>
            <span className="text-slate-300">Super Super Rare (SSR)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-indigo-400 font-bold block">35.0%</span>
            <span className="text-slate-300">Super Rare (SR)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 font-bold block">45.0%</span>
            <span className="text-slate-300">Rare (R)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
