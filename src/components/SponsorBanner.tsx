import React, { useState } from 'react';
import { ExternalLink, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface SponsorBannerProps {
  onClaimReward?: (coins: number) => void;
  variant?: 'banner' | 'card' | 'compact';
}

export const SPONSOR_URL = 'https://auctionr.org/4/8eab967732fcec4002e96aa2e3b2a689';

export const SponsorBanner: React.FC<SponsorBannerProps> = ({
  onClaimReward,
  variant = 'banner',
}) => {
  const [claimed, setClaimed] = useState(false);

  const handleClick = () => {
    sound.playClick();
    if (!claimed && onClaimReward) {
      sound.playCorrect();
      onClaimReward(300);
      setClaimed(true);
    }
  };

  if (variant === 'compact') {
    return (
      <a
        href={SPONSOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 hover:border-amber-400 rounded-lg text-xs text-amber-300 font-mono transition-all group"
      >
        <Gift className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span>Sponsor Officiel</span>
        <ExternalLink className="w-3 h-3 text-amber-400/80" />
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-[#121622] border-2 border-amber-500/40 rounded-xl p-5 manga-panel relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                Offre Partenaire Sponsorisée
              </span>
              {claimed && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> Bonus +300 Récupéré
                </span>
              )}
            </div>
            <h4 className="font-display font-bold text-base text-white">
              Découvrez notre Partenaire Exclusif & Obtenez des Pièces Gratuites
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Visitez la plateforme partenaire pour soutenir le serveur MangaVerse et recevez immédiatement un bonus de <strong className="text-amber-300">+300 Pièces</strong> pour vos tirages de héros !
            </p>
          </div>

          <a
            href={SPONSOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-lg shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{claimed ? 'Visiter le Sponsor' : 'Visiter & Obtenir +300 Pièces'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Default 'banner' variant
  return (
    <aside
      aria-label="Annonce Partenaire"
      className="w-full bg-gradient-to-r from-amber-950/50 via-slate-900 to-orange-950/50 border-y sm:border sm:rounded-xl border-amber-500/40 p-3.5 sm:p-4 my-4"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Partenaire Officiel
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-bold text-white">Annonce Recommandée</span>
            </div>
            <p className="text-xs text-slate-300">
              Soutenez le site et visitez notre partenaire pour débloquer <strong className="text-amber-400">+300 pièces bonus</strong> d'invocation !
            </p>
          </div>
        </div>

        <a
          href={SPONSOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm shadow-amber-500/20 cursor-pointer"
        >
          <span>{claimed ? 'Visiter le Partenaire' : 'Activer le Bonus (+300 🪙)'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
