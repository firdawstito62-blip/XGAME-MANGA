export type GameTab = 'arena' | 'quiz' | 'ninja' | 'memory' | 'gacha' | 'collection';

export interface PlayerStats {
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
  gems: number;
  duelsWon: number;
  bestReflexMs: number | null;
  quizHighScore: number;
  unlockedCharacterIds: string[];
  collectedCardIds: string[];
  equippedHeroId: string;
}

export type SkillType = 'attack' | 'defense' | 'ultimate' | 'heal';

export interface HeroSkill {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  type: SkillType;
  power: number; // multiplier or base damage/heal
  cooldown?: number;
}

export interface MangaHero {
  id: string;
  name: string;
  title: string;
  franchiseRef: string;
  element: 'Feu' | 'Foudre' | 'Ombre' | 'Glace' | 'Lumière';
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  energy: number;
  maxEnergy: number;
  avatar: string;
  accentColor: string;
  skills: HeroSkill[];
  passiveText: string;
}

export interface BossEnemy {
  id: string;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  dialogueIntro: string;
  dialogueDefeat: string;
  avatar: string;
  skills: {
    name: string;
    power: number;
    description: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  franchise: string;
  question: string;
  clue?: string;
  silhouetteLetter?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Facile' | 'Moyen' | 'Expert';
}

export type Rarity = 'R' | 'SR' | 'SSR' | 'UR';

export interface GachaCard {
  id: string;
  name: string;
  rarity: Rarity;
  franchise: string;
  element: 'Feu' | 'Foudre' | 'Ombre' | 'Glace' | 'Lumière';
  statBonus: string;
  quote: string;
  color: string;
  badgeBg: string;
  image?: string;
}
