import React, { useState } from 'react';
import { ExternalLink, Gift, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';
import { sound } from '../utils/audio';

export const AMAZON_PROMO_URL = 'https://amzn.to/4zEyrR3';
export const AUCTIONR_URL = 'https://auctionr.org/4/8eab967732fcec4002e96aa2e3b2a689';

interface SponsorBannerProps {
  onClaimReward?: (coins: number, gems?: number) => void;
  variant?: 'banner' | 'card' | 'compact' | 'dual';
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({
  onClaimReward,
  variant = 'banner',
}) => {
  const [claimedAmazon, setClaimedAmazon] = useState(false);
  const [claimedAuctionr, setClaimedAuctionr] = useState(false);

  const handleAmazonClick = () => {
    sound.playClick();
    if (!claimedAmazon && onClaimReward) {
      sound.playCorrect();
      onClaimReward(350, 1);
      setClaimedAmazon(true);
    }
  };

  const handleAuctionrClick = () => {
    sound.playClick();
    if (!claimedAuctionr && onClaimReward) {
      sound.playCorrect();
      onClaimReward(300, 0);
      setClaimedAuctionr(true);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <a
          href={AMAZON_PROMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAmazonClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-xs text-amber-300 font-mono transition-all group"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Boutique Manga Amazon</span>
          <ExternalLink className="w-3 h-3 text-amber-400/80" />
        </a>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Amazon Promo */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-[#121622] border-2 border-amber-500/50 rounded-xl p-5 manga-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" /> Offre Amazon Manga
              </span>
              {claimedAmazon && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> +350 🪙 Récupérés
                </span>
              )}
            </div>
            <h4 className="font-display font-bold text-base text-white">
              Bons Plans Mangas & Figurines Collectors
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1 mb-4">
              Explorez les meilleures promotions sur les tomes mangas, coffrets collectors et figurines shonen officielles sur Amazon !
            </p>
          </div>

          <a
            href={AMAZON_PROMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAmazonClick}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-lg shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{claimedAmazon ? 'Voir l\'Offre Amazon' : 'Profiter du Bon Plan (+350 🪙 + 1 💎)'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Card 2: Auctionr Partner */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-[#121622] border-2 border-indigo-500/40 rounded-xl p-5 manga-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center gap-1">
                <Gift className="w-3 h-3" /> Partenaire Enchères
              </span>
              {claimedAuctionr && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> +300 🪙 Récupérés
                </span>
              )}
            </div>
            <h4 className="font-display font-bold text-base text-white">
              Découvrez la Plateforme Partenaire Auctionr
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1 mb-4">
              Soutenez le développement de MangaVerse Arcade en visitant notre partenaire officiel pour vos objets de collection.
            </p>
          </div>

          <a
            href={AUCTIONR_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAuctionrClick}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-display font-bold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>{claimedAuctionr ? 'Visiter Auctionr' : 'Visiter le Partenaire (+300 🪙)'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Default 'banner' variant: highlighted dual sponsor banner with Amazon in prime spot
  return (
    <aside
      aria-label="Annonces et Partenaires"
      className="w-full bg-gradient-to-r from-amber-950/50 via-slate-900 to-orange-950/50 border-y sm:border sm:rounded-xl border-amber-500/40 p-4 my-4"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Amazon Deal Spotlight */}
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-1.5 py-0.2 bg-amber-950/80 border border-amber-500/40 rounded">
                Boutique Manga Amazon
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-bold text-white">Offre Spéciale Goodies & Mangas</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Profitez des offres Amazon sur les mangas et figurines pour débloquer <strong className="text-amber-400">+350 Pièces & 1 Gemme</strong> d'invocation !
            </p>
          </div>
        </div>

        {/* Action Buttons for both deals */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          <a
            href={AMAZON_PROMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAmazonClick}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-black text-xs rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>{claimedAmazon ? 'Voir Offre Amazon' : 'Activer Bonus Amazon (+350 🪙)'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={AUCTIONR_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAuctionrClick}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-display font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>Partenaire Enchères (+300 🪙)</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </aside>
  );
};
