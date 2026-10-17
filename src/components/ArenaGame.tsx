import React, { useState, useEffect } from 'react';
import { MangaHero, BossEnemy, HeroSkill } from '../types';
import { MANGA_HEROES } from '../data/characters';
import { MANGA_BOSSES } from '../data/bosses';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Shield, Sparkles, Heart, Zap, Swords, RefreshCw, Trophy } from 'lucide-react';

interface ArenaGameProps {
  onWinBattle: (coins: number, exp: number, gems: number) => void;
  unlockedHeroIds: string[];
}

type BattleState = 'HERO_SELECT' | 'COMBAT' | 'VICTORY' | 'DEFEAT';

interface FloatingText {
  id: number;
  text: string;
  type: 'damage' | 'heal' | 'crit' | 'block';
  target: 'hero' | 'boss';
}

export const ArenaGame: React.FC<ArenaGameProps> = ({ onWinBattle }) => {
  const [battleState, setBattleState] = useState<BattleState>('HERO_SELECT');
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [selectedBossIndex, setSelectedBossIndex] = useState(0);

  // Active combat state
  const [heroHp, setHeroHp] = useState(420);
  const [heroMaxHp, setHeroMaxHp] = useState(420);
  const [heroEnergy, setHeroEnergy] = useState(25);
  const [heroShield, setHeroShield] = useState(0);

  const [bossHp, setBossHp] = useState(400);
  const [bossMaxHp, setBossMaxHp] = useState(400);
  const [bossCharging, setBossCharging] = useState(false);

  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [isHeroTurn, setIsHeroTurn] = useState(true);
  const [animatingTarget, setAnimatingTarget] = useState<'hero' | 'boss' | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const hero = MANGA_HEROES[selectedHeroIndex];
  const boss = MANGA_BOSSES[selectedBossIndex];

  const triggerFloating = (text: string, type: FloatingText['type'], target: FloatingText['target']) => {
    const item: FloatingText = { id: Date.now() + Math.random(), text, type, target };
    setFloatingTexts((prev) => [...prev, item]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => f.id !== item.id));
    }, 1200);
  };

  const startBattle = () => {
    sound.playClick();
    setHeroHp(hero.hp);
    setHeroMaxHp(hero.maxHp);
    setHeroEnergy(hero.energy);
    setHeroShield(0);

    setBossHp(boss.hp);
    setBossMaxHp(boss.maxHp);
    setBossCharging(false);

    setCombatLogs([
      `⚔️ Début du duel face à ${boss.name} (${boss.title}) !`,
      `${boss.name} : ${boss.dialogueIntro}`,
    ]);
    setIsHeroTurn(true);
    setBattleState('COMBAT');
  };

  // Bot Boss turn logic
  useEffect(() => {
    if (battleState !== 'COMBAT' || isHeroTurn || bossHp <= 0 || heroHp <= 0) return;

    const timer = setTimeout(() => {
      if (bossHp <= 0 || heroHp <= 0) return;
      // Boss attacks
      const randomSkill = boss.skills[Math.floor(Math.random() * boss.skills.length)];
      setAnimatingTarget('hero');

      // Check hero dodge passive (Ren)
      if (hero.id === 'ren-shadow' && Math.random() < 0.25) {
        sound.playSlash();
        triggerFloating('ESQUIVE OMBRE !', 'block', 'hero');
        setCombatLogs((prev) => [`💨 ${hero.name} a esquivé l'assaut de ${boss.name} grâce à ses réflexes !`, ...prev]);
        setAnimatingTarget(null);
        setIsHeroTurn(true);
        return;
      }

      // Calculate damage
      const rawDamage = randomSkill.power + Math.floor(Math.random() * 8);
      let finalDamage = Math.max(10, Math.round(rawDamage * (100 / (100 + hero.defense))));

      // Apply shield if active
      if (heroShield > 0) {
        finalDamage = Math.round(finalDamage * 0.5);
        setHeroShield(0);
        triggerFloating('PARADE !', 'block', 'hero');
      }

      sound.playImpact();
      triggerFloating(`-${finalDamage}`, 'damage', 'hero');

      setHeroHp((prev) => {
        const next = Math.max(0, prev - finalDamage);
        if (next === 0) {
          sound.playWrong();
          setBattleState('DEFEAT');
        }
        return next;
      });

      // Sora passive: gain Ki on hit
      if (hero.id === 'sora-ki') {
        setHeroEnergy((prev) => Math.min(100, prev + 15));
      }

      setCombatLogs((prev) => [
        `💥 ${boss.name} utilise [${randomSkill.name}] et inflige ${finalDamage} dégâts !`,
        ...prev,
      ]);

      setTimeout(() => {
        setAnimatingTarget(null);
        setIsHeroTurn(true);
      }, 400);
    }, 800);

    return () => clearTimeout(timer);
  }, [isHeroTurn, battleState, bossHp, heroHp]);

  const handleHeroAction = (skill: HeroSkill) => {
    if (!isHeroTurn || battleState !== 'COMBAT') return;
    if (heroEnergy < skill.energyCost) {
      sound.playWrong();
      triggerFloating('Ki insuffisant !', 'block', 'hero');
      return;
    }

    setIsHeroTurn(false);
    setHeroEnergy((prev) => Math.max(0, prev - skill.energyCost));

    if (skill.type === 'attack' || skill.type === 'ultimate') {
      sound.playSlash();
      if (skill.type === 'ultimate') sound.playSuper();
      setAnimatingTarget('boss');

      // Calculate hero damage
      const isCrit = Math.random() < (skill.type === 'ultimate' ? 0.4 : 0.2);
      const critMultiplier = isCrit ? 1.6 : 1.0;

      // Kaito passive: +20% if low hp
      const rageMultiplier = hero.id === 'kaito-flame' && heroHp <= heroMaxHp * 0.35 ? 1.2 : 1.0;

      const baseDmg = hero.attack * skill.power * rageMultiplier * critMultiplier;
      const finalDmg = Math.max(15, Math.round(baseDmg * (100 / (100 + boss.defense))));

      triggerFloating(
        `${isCrit ? '💥 CRITIQUE! ' : ''}-${finalDmg}`,
        isCrit ? 'crit' : 'damage',
        'boss'
      );

      // Restore some Ki on normal attack
      if (skill.type === 'attack') {
        setHeroEnergy((prev) => Math.min(100, prev + 18));
      }

      setBossHp((prev) => {
        const next = Math.max(0, prev - finalDmg);
        if (next === 0) {
          setTimeout(() => {
            handleVictory();
          }, 500);
        }
        return next;
      });

      setCombatLogs((prev) => [
        `✨ ${hero.name} déclenche [${skill.name}] ${isCrit ? '🔥 COUP CRITIQUE !' : ''} (-${finalDmg} PV)`,
        ...prev,
      ]);

      setTimeout(() => {
        setAnimatingTarget(null);
      }, 400);
    } else if (skill.type === 'defense') {
      sound.playClick();
      setHeroShield(1);
      triggerFloating('+50% DÉFENSE', 'block', 'hero');
      setCombatLogs((prev) => [`🛡️ ${hero.name} prépare une posture défensive impénétrable !`, ...prev]);
    } else if (skill.type === 'heal') {
      sound.playCorrect();
      setHeroHp((prev) => Math.min(heroMaxHp, prev + skill.power));
      setHeroEnergy((prev) => Math.min(100, prev + 15));
      triggerFloating(`+${skill.power} PV`, 'heal', 'hero');
      setCombatLogs((prev) => [`💚 ${hero.name} consomme [${skill.name}] (+${skill.power} PV) !`, ...prev]);
    }
  };

  const handleVictory = () => {
    sound.playVictory();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
    const rewardCoins = 150 + selectedBossIndex * 75;
    const rewardExp = 200 + selectedBossIndex * 100;
    const rewardGems = selectedBossIndex + 1;
    onWinBattle(rewardCoins, rewardExp, rewardGems);
    setBattleState('VICTORY');
  };

  return (
    <div className="w-full">
      {/* Title & Rules */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-orange-400 font-mono">Arène Shonen RPG</span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
            Le Grand Tournoi des Éléments
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Combattez au tour par tour contre des boss mythiques, gérez votre jauge de Ki, déclenchez vos techniques secrètes et gagnez des pièces Manga pour le Gacha !
          </p>
        </div>

        {battleState === 'COMBAT' && (
          <button
            onClick={() => {
              sound.playClick();
              setBattleState('HERO_SELECT');
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded-md cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Abandonner / Changer de Héros</span>
          </button>
        )}
      </div>

      {/* STATE 1: Hero & Boss Selection */}
      {battleState === 'HERO_SELECT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Select Hero (Left) */}
          <div className="lg:col-span-7 bg-[#121622] border border-slate-800 rounded-xl p-5 sm:p-6 manga-panel">
            <h2 className="font-display text-lg font-bold text-white mb-3 flex items-center justify-between">
              <span>1. Choisissez votre Héros</span>
              <span className="text-xs font-mono text-slate-400 font-normal">3 Combattants disponibles</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {MANGA_HEROES.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedHeroIndex(idx);
                  }}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedHeroIndex === idx
                      ? 'bg-slate-800/90 border-orange-500 shadow-md shadow-orange-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="aspect-square w-full rounded-md overflow-hidden bg-slate-800 mb-2 relative">
                    <img
                      src={h.avatar}
                      alt={h.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/80 text-orange-400">
                      {h.element}
                    </div>
                  </div>
                  <div className="font-display font-bold text-sm text-white truncate">{h.name}</div>
                  <div className="text-xs text-slate-400 truncate">{h.title}</div>
                </button>
              ))}
            </div>

            {/* Selected Hero Showcase & Stats */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={hero.avatar}
                  alt={hero.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-lg object-cover border border-orange-500/30"
                />
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="font-display text-lg font-bold text-white">{hero.name}</h3>
                    <span className="text-xs font-mono text-orange-400">[{hero.element}]</span>
                  </div>
                  <p className="text-xs text-slate-400 italic mb-3">{hero.passiveText}</p>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">PV</span>
                      <span className="text-emerald-400 font-bold">{hero.maxHp}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">ATQ</span>
                      <span className="text-rose-400 font-bold">{hero.attack}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">DÉF</span>
                      <span className="text-sky-400 font-bold">{hero.defense}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">KI MAX</span>
                      <span className="text-amber-400 font-bold">{hero.maxEnergy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Select Boss (Right) */}
          <div className="lg:col-span-5 bg-[#121622] border border-slate-800 rounded-xl p-5 sm:p-6 manga-panel flex flex-col justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-white mb-3">2. Sélectionnez l'Adversaire</h2>
              <div className="space-y-2 mb-6">
                {MANGA_BOSSES.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedBossIndex(idx);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedBossIndex === idx
                        ? 'bg-slate-800 border-red-500 shadow-md shadow-red-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{b.avatar}</span>
                      <div className="text-left">
                        <div className="font-display font-bold text-sm text-white">{b.name}</div>
                        <div className="text-xs text-slate-400">{b.title}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs font-mono">
                      <span className="text-red-400 font-bold">{b.hp} PV</span>
                      <span className="block text-slate-500 text-[10px]">Rang {idx + 1}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Boss dialogue preview */}
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-xs text-red-300 italic mb-6">
                {boss.dialogueIntro}
              </div>
            </div>

            {/* Launch CTA */}
            <button
              onClick={startBattle}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-display font-bold text-base rounded-lg shadow-lg shadow-orange-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-98"
            >
              <Swords className="w-5 h-5" />
              <span>Entrer dans l'Arène</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE COMBAT */}
      {battleState === 'COMBAT' && (
        <div className="space-y-6">
          {/* Battlefield Display */}
          <div className="relative rounded-xl overflow-hidden border-2 border-slate-800 bg-[#0c0e14] manga-panel min-h-[380px] p-6 flex flex-col justify-between">
            {/* Background Battle Artwork with Measured Scrim */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <img
                src="/src/assets/images/hero_anime_arena_1792191777280.jpg"
                alt="Battle Arena"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0e14]/70 to-[#0c0e14] pointer-events-none" />

            {/* Floating text overlays */}
            <div className="absolute inset-0 pointer-events-none z-30">
              {floatingTexts.map((item) => (
                <div
                  key={item.id}
                  className={`absolute font-display font-black text-xl sm:text-2xl animate-bounce drop-shadow-md transition-all ${
                    item.target === 'hero' ? 'left-1/4 top-1/2' : 'right-1/4 top-1/2'
                  } ${
                    item.type === 'crit'
                      ? 'text-yellow-300 scale-125'
                      : item.type === 'heal'
                      ? 'text-emerald-400'
                      : item.type === 'block'
                      ? 'text-sky-400'
                      : 'text-red-500'
                  }`}
                >
                  {item.text}
                </div>
              ))}
            </div>

            {/* Top HUD: Health & Energy Bars */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hero Status */}
              <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-white">{hero.name}</span>
                    {heroShield > 0 && (
                      <span className="text-[10px] font-mono text-sky-300 bg-sky-950/80 border border-sky-800 px-1.5 py-0.2 rounded">
                        GARDE ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                    {heroHp} / {heroMaxHp} PV
                  </span>
                </div>
                {/* HP bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(heroHp / heroMaxHp) * 100}%` }}
                  />
                </div>
                {/* Ki / Energy bar */}
                <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Jauge de Ki
                  </span>
                  <span className="text-slate-300 tabular-nums">{heroEnergy} / {hero.maxEnergy}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                    style={{ width: `${(heroEnergy / hero.maxEnergy) * 100}%` }}
                  />
                </div>
              </div>

              {/* Boss Status */}
              <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{boss.avatar}</span>
                    <span className="font-display font-bold text-white">{boss.name}</span>
                  </div>
                  <span className="text-xs font-mono text-rose-400 font-bold tabular-nums">
                    {bossHp} / {bossMaxHp} PV
                  </span>
                </div>
                {/* Boss HP bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                    style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{boss.title}</span>
                  <span className="text-red-400">Défense : {boss.defense}</span>
                </div>
              </div>
            </div>

            {/* Center Stage: Character Visuals & Animations */}
            <div className="relative z-10 py-8 flex items-center justify-around">
              {/* Hero Sprite */}
              <div
                className={`flex flex-col items-center transition-transform duration-200 ${
                  animatingTarget === 'hero' ? 'animate-shake' : ''
                }`}
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 bg-slate-800 relative">
                  <img
                    src={hero.avatar}
                    alt={hero.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {heroEnergy >= 80 && (
                    <div className="absolute inset-0 border-2 border-amber-400 animate-pulse rounded-2xl pointer-events-none" />
                  )}
                </div>
                <span className="mt-2 text-xs font-display font-bold text-orange-400 tracking-wider">
                  {isHeroTurn ? '▶ VOTRE TOUR' : 'ATTENTE...'}
                </span>
              </div>

              {/* Clash Energy Spark */}
              <div className="text-3xl text-orange-500 font-black font-display opacity-80 animate-pulse">
                VS
              </div>

              {/* Boss Sprite */}
              <div
                className={`flex flex-col items-center transition-transform duration-200 ${
                  animatingTarget === 'boss' ? 'animate-shake' : ''
                }`}
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 border-red-500/50 shadow-lg shadow-red-500/20 bg-slate-900 flex items-center justify-center text-6xl relative">
                  <span>{boss.avatar}</span>
                  {bossCharging && (
                    <div className="absolute inset-0 border-2 border-red-500 animate-ping rounded-2xl pointer-events-none" />
                  )}
                </div>
                <span className="mt-2 text-xs font-display font-bold text-red-400 tracking-wider">
                  {!isHeroTurn ? '▶ TOUR ADVERSE' : 'CIBLE ENNEMIE'}
                </span>
              </div>
            </div>

            {/* Recent Combat Log Kicker */}
            <div className="relative z-10 bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 text-xs font-mono text-slate-300">
              <span className="text-orange-400 font-bold mr-2">Dernière action :</span>
              {combatLogs[0] || 'En attente d\'une commande...'}
            </div>
          </div>

          {/* Action Command Controls */}
          <div className="bg-[#121622] border border-slate-800 rounded-xl p-5 manga-panel">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-white text-base">Actions de Combat</h2>
              <span className="text-xs text-slate-400">
                {isHeroTurn ? 'Sélectionnez une technique à utiliser :' : 'L\'ennemi réfléchit...'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {hero.skills.map((skill) => {
                const canAfford = heroEnergy >= skill.energyCost;
                const isUltimate = skill.type === 'ultimate';

                return (
                  <button
                    key={skill.id}
                    disabled={!isHeroTurn || !canAfford}
                    onClick={() => handleHeroAction(skill)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 flex flex-col justify-between ${
                      isUltimate
                        ? 'bg-gradient-to-br from-amber-950/40 via-orange-950/50 to-red-950/40 border-amber-500 hover:border-amber-400 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                          {skill.type === 'attack' && <Swords className="w-3.5 h-3.5 text-orange-400" />}
                          {skill.type === 'defense' && <Shield className="w-3.5 h-3.5 text-sky-400" />}
                          {skill.type === 'heal' && <Heart className="w-3.5 h-3.5 text-emerald-400" />}
                          {skill.type === 'ultimate' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                          {skill.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{skill.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
                      <span className="text-amber-400">
                        {skill.energyCost > 0 ? `${skill.energyCost} Ki` : 'Gratuit (+18 Ki)'}
                      </span>
                      <span className="text-slate-500 text-[10px] uppercase">{skill.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: VICTORY MODAL */}
      {battleState === 'VICTORY' && (
        <div className="bg-[#121622] border-2 border-amber-500/50 rounded-xl p-8 manga-panel text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 bg-amber-500/20 border border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl font-black text-white">Victoire Éclatante !</h2>
          <p className="text-sm text-slate-300 italic">
            {boss.name} s'effondre : {boss.dialogueDefeat}
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 grid grid-cols-3 gap-3 font-mono text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Pièces</span>
              <span className="text-amber-400 font-bold font-display text-lg">+{150 + selectedBossIndex * 75}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">EXP</span>
              <span className="text-indigo-400 font-bold font-display text-lg">+{200 + selectedBossIndex * 100}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Gemmes</span>
              <span className="text-sky-400 font-bold font-display text-lg">+{selectedBossIndex + 1}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                sound.playClick();
                setBattleState('HERO_SELECT');
              }}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Nouveau Combat
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: DEFEAT MODAL */}
      {battleState === 'DEFEAT' && (
        <div className="bg-[#121622] border-2 border-red-500/50 rounded-xl p-8 manga-panel text-center max-w-xl mx-auto space-y-5">
          <h2 className="font-display text-3xl font-black text-red-500">Défaite Cuisante...</h2>
          <p className="text-sm text-slate-300">
            Votre énergie s'est épuisée sous les assauts de {boss.name}. Entraînez-vous, améliorez vos réflexes et revenez plus fort !
          </p>
          <button
            onClick={() => {
              sound.playClick();
              setBattleState('HERO_SELECT');
            }}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Réessayer le Défi
          </button>
        </div>
      )}
    </div>
  );
};
