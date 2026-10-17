import React, { useState, useEffect } from 'react';
import { GameTab, PlayerStats } from './types';
import { Navbar } from './components/Navbar';
import { ArenaGame } from './components/ArenaGame';
import { QuizGame } from './components/QuizGame';
import { NinjaReflexGame } from './components/NinjaReflexGame';
import { MemoryGame } from './components/MemoryGame';
import { GachaShop } from './components/GachaShop';
import { CardCollection } from './components/CardCollection';
import { SponsorBanner, AMAZON_PROMO_URL, AUCTIONR_URL } from './components/SponsorBanner';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, ExternalLink } from 'lucide-react';

const INITIAL_PLAYER: PlayerStats = {
  level: 1,
  exp: 0,
  maxExp: 300,
  coins: 450, // Starting coins to allow immediate gacha pulls or arena rewards
  gems: 3,
  duelsWon: 0,
  bestReflexMs: null,
  quizHighScore: 0,
  unlockedCharacterIds: ['kaito-flame', 'ren-shadow', 'sora-ki'],
  collectedCardIds: ['r-rocklee', 'r-chopper'],
  equippedHeroId: 'kaito-flame',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<GameTab>('arena');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [player, setPlayer] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem('mangaverse_player_save_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // LocalStorage fallback
    }
    return INITIAL_PLAYER;
  });

  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  // Sync player data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mangaverse_player_save_v1', JSON.stringify(player));
    } catch {
      // Storage fallback
    }
  }, [player]);

  // AudioContext unlock on first user gesture (Safari & mobile compatibility)
  useEffect(() => {
    const unlockAudio = () => {
      sound.initCtx();
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sound.enabled = nextState;
    if (nextState) sound.playClick();
  };

  const addExp = (amount: number) => {
    setPlayer((prev) => {
      let curExp = prev.exp + amount;
      let curLvl = prev.level;
      let curMaxExp = prev.maxExp;
      let leveledUp = false;

      while (curExp >= curMaxExp) {
        curExp -= curMaxExp;
        curLvl += 1;
        curMaxExp = Math.round(curMaxExp * 1.35);
        leveledUp = true;
      }

      if (leveledUp) {
        sound.playVictory();
        setLevelUpMessage(`NIVEAU SUPÉRIEUR ! Vous avez atteint le Niveau ${curLvl} !`);
        try {
          confetti({ particleCount: 60, spread: 55 });
        } catch {
          // Fallback
        }
        setTimeout(() => setLevelUpMessage(null), 4000);
      }

      return {
        ...prev,
        level: curLvl,
        exp: curExp,
        maxExp: curMaxExp,
      };
    });
  };

  const handleWinBattle = (coins: number, exp: number, gems: number) => {
    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      gems: prev.gems + gems,
      duelsWon: prev.duelsWon + 1,
    }));
    addExp(exp);
  };

  const handleEarnRewards = (coins: number, exp: number) => {
    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins + coins,
    }));
    addExp(exp);
  };

  const handleSpendCoins = (cost: number): boolean => {
    if (player.coins < cost) return false;
    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins - cost,
    }));
    return true;
  };

  const handleClaimSponsorReward = (bonusCoins: number, bonusGems: number = 0) => {
    setPlayer((prev) => ({
      ...prev,
      coins: prev.coins + bonusCoins,
      gems: prev.gems + bonusGems,
    }));
    sound.playVictory();
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {
      // Confetti fallback
    }
    const gemText = bonusGems > 0 ? ` & +${bonusGems} Gemme` : '';
    setLevelUpMessage(`CADEAU PARTENAIRE : +${bonusCoins} Pièces${gemText} ajoutées à votre trésor !`);
    setTimeout(() => setLevelUpMessage(null), 4000);
  };

  const handleAddCards = (newCardIds: string[]) => {
    setPlayer((prev) => {
      const set = new Set([...prev.collectedCardIds, ...newCardIds]);
      return {
        ...prev,
        collectedCardIds: Array.from(set),
      };
    });
  };

  const handleUpdateBestTime = (timeMs: number) => {
    setPlayer((prev) => ({
      ...prev,
      bestReflexMs: prev.bestReflexMs ? Math.min(prev.bestReflexMs, timeMs) : timeMs,
    }));
  };

  const handleUpdateQuizHighScore = (score: number) => {
    setPlayer((prev) => ({
      ...prev,
      quizHighScore: Math.max(prev.quizHighScore, score),
    }));
  };

  const handleConfirmReset = () => {
    setPlayer(INITIAL_PLAYER);
    try {
      localStorage.removeItem('mangaverse_player_save_v1');
    } catch {
      // Fallback
    }
    sound.playClick();
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        player={player}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Level-Up / Reward Banner Notification */}
      {levelUpMessage && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-display font-bold text-sm py-2 px-4 text-center shadow-lg animate-pulse flex items-center justify-center gap-2">
          <Award className="w-4 h-4" />
          <span>{levelUpMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Progression Bar */}
        <div className="bg-[#121622] border border-slate-800 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 manga-panel">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-lg bg-orange-600/20 border border-orange-500 flex items-center justify-center font-display font-black text-orange-400 text-lg">
              {player.level}
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white flex items-center gap-2">
                <span>Guerrier Shonen</span>
                <span className="text-[10px] font-mono text-orange-400">Niv. {player.level}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                EXP : {player.exp} / {player.maxExp}
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full sm:max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
              style={{ width: `${(player.exp / player.maxExp) * 100}%` }}
            />
          </div>

          {/* Quick Badges / Stats */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500 block text-[10px]">VICTOIRES</span>
              <span className="text-white font-bold">{player.duelsWon}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">RÉFLEXE MAX</span>
              <span className="text-amber-400 font-bold">
                {player.bestReflexMs ? `${player.bestReflexMs}ms` : '--'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">RECORD QUIZ</span>
              <span className="text-emerald-400 font-bold">{player.quizHighScore}</span>
            </div>
          </div>
        </div>

        {/* Sponsor Banner with direct link & rewards */}
        <SponsorBanner
          variant="banner"
          onClaimReward={handleClaimSponsorReward}
        />

        {/* Dynamic Active Tab Content */}
        {activeTab === 'arena' && (
          <ArenaGame
            onWinBattle={handleWinBattle}
            unlockedHeroIds={player.unlockedCharacterIds}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizGame
            onEarnRewards={handleEarnRewards}
            highScore={player.quizHighScore}
            onUpdateHighScore={handleUpdateQuizHighScore}
          />
        )}

        {activeTab === 'ninja' && (
          <NinjaReflexGame
            onEarnRewards={handleEarnRewards}
            bestTimeMs={player.bestReflexMs}
            onUpdateBestTime={handleUpdateBestTime}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryGame onEarnRewards={handleEarnRewards} />
        )}

        {activeTab === 'gacha' && (
          <GachaShop
            coins={player.coins}
            onSpendCoins={handleSpendCoins}
            onAddCards={handleAddCards}
            collectedCardIds={player.collectedCardIds}
            onClaimSponsorReward={handleClaimSponsorReward}
          />
        )}

        {activeTab === 'collection' && (
          <CardCollection collectedCardIds={player.collectedCardIds} />
        )}
      </main>

      {/* In-app Reset Confirmation Modal (Iframe-safe) */}
      <ResetConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
      />

      {/* Quiet Footer with Official Sponsor Link */}
      <footer className="border-t border-slate-800/80 bg-[#0c0e14] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span>MangaVerse Arcade</span>
            <span className="mx-2">·</span>
            <span>Jeux manga et anime interactifs</span>
          </div>

          {/* Sponsor Links & Reset Button */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={AMAZON_PROMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-bold"
            >
              <span>Boutique Manga Amazon</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <span className="text-slate-700 hidden sm:inline">·</span>

            <a
              href={AUCTIONR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-bold"
            >
              <span>Partenaire Auctionr</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <button
              onClick={() => {
                sound.playClick();
                setShowResetModal(true);
              }}
              className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser la partie</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
