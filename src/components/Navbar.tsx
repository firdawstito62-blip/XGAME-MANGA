import React from 'react';
import { GameTab, PlayerStats } from '../types';
import { Volume2, VolumeX, Coins, Gem, ShoppingBag } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  activeTab: GameTab;
  onSelectTab: (tab: GameTab) => void;
  player: PlayerStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  player,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0c0e14]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <button
          onClick={() => {
            sound.playClick();
            onSelectTab('arena');
          }}
          className="text-left font-display text-xl sm:text-2xl font-black tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-orange-500">MangaVerse</span>
          <span className="text-xs uppercase tracking-widest px-2 py-0.5 bg-orange-950/70 border border-orange-500/30 text-orange-400 rounded">
            Arcade
          </span>
        </button>

        {/* Zone 2: 4–5 single-line clean navigation links with hover state */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('arena');
            }}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'arena' ? 'text-orange-400 font-bold border-b-2 border-orange-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            Arène RPG
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('quiz');
            }}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'quiz' ? 'text-orange-400 font-bold border-b-2 border-orange-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            Quiz Manga
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('ninja');
            }}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'ninja' ? 'text-orange-400 font-bold border-b-2 border-orange-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            Dojo Réflexe
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('memory');
            }}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'memory' ? 'text-orange-400 font-bold border-b-2 border-orange-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            Mémoire Jutsu
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('gacha');
            }}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'gacha' ? 'text-orange-400 font-bold border-b-2 border-orange-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            Invocations
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('collection');
            }}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'collection' ? 'text-orange-400 font-bold border-b-2 border-orange-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            Codex ({player.collectedCardIds.length})
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area (Amazon Deal + Currency + Audio Toggle) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://amzn.to/4zEyrR3"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs font-mono text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap"
            title="Boutique Manga & Goodies Amazon"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Offres Amazon</span>
          </a>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono tabular-nums bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>{player.coins.toLocaleString('fr-FR')}</span>
            </div>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-1.5 text-sky-400">
              <Gem className="w-3.5 h-3.5" />
              <span>{player.gems}</span>
            </div>
          </div>

          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            title={soundEnabled ? 'Son actif' : 'Son coupé'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for touch screens */}
      <div className="md:hidden flex items-center justify-around bg-slate-950/95 border-t border-slate-800/80 px-2 py-2 overflow-x-auto text-xs">
        <button
          onClick={() => { sound.playClick(); onSelectTab('arena'); }}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'arena' ? 'text-orange-400 font-bold bg-orange-950/40' : 'text-slate-400'}`}
        >
          Arène
        </button>
        <button
          onClick={() => { sound.playClick(); onSelectTab('quiz'); }}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'quiz' ? 'text-orange-400 font-bold bg-orange-950/40' : 'text-slate-400'}`}
        >
          Quiz
        </button>
        <button
          onClick={() => { sound.playClick(); onSelectTab('ninja'); }}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'ninja' ? 'text-orange-400 font-bold bg-orange-950/40' : 'text-slate-400'}`}
        >
          Réflexe
        </button>
        <button
          onClick={() => { sound.playClick(); onSelectTab('memory'); }}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'memory' ? 'text-orange-400 font-bold bg-orange-950/40' : 'text-slate-400'}`}
        >
          Mémoire
        </button>
        <button
          onClick={() => { sound.playClick(); onSelectTab('gacha'); }}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'gacha' ? 'text-orange-400 font-bold bg-orange-950/40' : 'text-slate-400'}`}
        >
          Invocations
        </button>
        <button
          onClick={() => { sound.playClick(); onSelectTab('collection'); }}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'collection' ? 'text-orange-400 font-bold bg-orange-950/40' : 'text-slate-400'}`}
        >
          Codex
        </button>
      </div>
    </header>
  );
};
