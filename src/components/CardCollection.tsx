import React, { useState } from 'react';
import { GachaCard, Rarity } from '../types';
import { GACHA_CARDS_POOL } from '../data/gachaCards';
import { sound } from '../utils/audio';
import { Lock, Sparkles, Filter } from 'lucide-react';

interface CardCollectionProps {
  collectedCardIds: string[];
}

export const CardCollection: React.FC<CardCollectionProps> = ({ collectedCardIds }) => {
  const [filterRarity, setFilterRarity] = useState<'ALL' | Rarity>('ALL');
  const [selectedCard, setSelectedCard] = useState<GachaCard | null>(null);

  const filteredCards = GACHA_CARDS_POOL.filter((c) => {
    if (filterRarity === 'ALL') return true;
    return c.rarity === filterRarity;
  });

  const totalCards = GACHA_CARDS_POOL.length;
  const ownedCount = GACHA_CARDS_POOL.filter((c) => collectedCardIds.includes(c.id)).length;
  const progressPercent = Math.round((ownedCount / totalCards) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-orange-400 font-mono">Codex des Légendes</span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
            Galerie des Héros Invoqués
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Consultez toutes les cartes manga obtenues et complétez votre encyclopédie Shonen.
          </p>
        </div>

        {/* Completion meter */}
        <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-lg font-mono text-xs">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="text-slate-400">Progression Codex</span>
            <span className="text-amber-400 font-bold tabular-nums">
              {ownedCount} / {totalCards} ({progressPercent}%)
            </span>
          </div>
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-lg mb-6 overflow-x-auto">
        <button
          onClick={() => {
            sound.playClick();
            setFilterRarity('ALL');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            filterRarity === 'ALL'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Toutes ({GACHA_CARDS_POOL.length})
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilterRarity('UR');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            filterRarity === 'UR'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Ultra Rare (UR)
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilterRarity('SSR');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            filterRarity === 'SSR'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SSR
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilterRarity('SR');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            filterRarity === 'SR'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SR
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setFilterRarity('R');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            filterRarity === 'R'
              ? 'bg-slate-700/60 text-slate-200 border border-slate-600'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          R
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCards.map((card) => {
          const isOwned = collectedCardIds.includes(card.id);
          const isUr = card.rarity === 'UR';
          const isSsr = card.rarity === 'SSR';

          return (
            <div
              key={card.id}
              onClick={() => {
                if (isOwned) {
                  sound.playClick();
                  setSelectedCard(card);
                }
              }}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-150 ${
                !isOwned
                  ? 'bg-slate-950/60 border-slate-800/80 opacity-40 cursor-not-allowed'
                  : isUr
                  ? 'bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 cursor-pointer hover:scale-102'
                  : isSsr
                  ? 'bg-slate-900 border-red-500/40 cursor-pointer hover:scale-102'
                  : 'bg-slate-900 border-slate-800 cursor-pointer hover:scale-102'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isUr
                        ? 'bg-amber-400 text-slate-950'
                        : isSsr
                        ? 'bg-red-500 text-white'
                        : card.rarity === 'SR'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {card.rarity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{card.element}</span>
                </div>

                <div className="aspect-square w-full rounded-lg bg-slate-950 flex items-center justify-center mb-3 relative overflow-hidden border border-slate-800">
                  {isOwned ? (
                    card.image ? (
                      <img
                        src={card.image}
                        alt={card.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Sparkles
                        className={`w-8 h-8 ${
                          isUr ? 'text-amber-400' : isSsr ? 'text-red-400' : 'text-slate-500'
                        }`}
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
                      <Lock className="w-6 h-6" />
                      <span className="text-[10px] font-mono">NON OBTENUE</span>
                    </div>
                  )}
                </div>

                <div className="font-display font-bold text-sm text-white line-clamp-1">
                  {isOwned ? card.name : '??? Sceau Scellé'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mb-1">
                  {isOwned ? card.franchise : 'Invoquez au Temple'}
                </div>
              </div>

              {isOwned && (
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-400 truncate">
                  {card.statBonus}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Details Modal */}
      {selectedCard && (
        <div
          onClick={() => setSelectedCard(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121622] border-2 border-slate-700 max-w-sm w-full rounded-2xl p-6 manga-panel relative cursor-default space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                {selectedCard.rarity}
              </span>
              <span className="text-xs font-mono text-slate-400">Élément : {selectedCard.element}</span>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-white">{selectedCard.name}</h3>
              <p className="text-xs text-orange-400 font-mono mt-0.5">{selectedCard.franchise}</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs italic text-slate-300">
              {selectedCard.quote}
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
              <span className="text-slate-400 block text-[10px] uppercase">Bonus de Combat Actif</span>
              <span className="text-emerald-400 font-bold">{selectedCard.statBonus}</span>
            </div>

            <button
              onClick={() => setSelectedCard(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Fermer la Fiche
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
