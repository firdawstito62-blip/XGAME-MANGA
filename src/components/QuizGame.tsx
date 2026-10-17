import React, { useState } from 'react';
import { MANGA_QUESTIONS } from '../data/quizData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, Flame } from 'lucide-react';

interface QuizGameProps {
  onEarnRewards: (coins: number, exp: number) => void;
  highScore: number;
  onUpdateHighScore: (score: number) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  onEarnRewards,
  highScore,
  onUpdateHighScore,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const question = MANGA_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctIndex;
    if (isCorrect) {
      sound.playCorrect();
      const streakMultiplier = streak >= 3 ? 2 : streak >= 1 ? 1.5 : 1;
      const points = Math.round(100 * streakMultiplier);
      const newScore = score + points;
      setScore(newScore);
      setStreak((prev) => prev + 1);

      if (newScore > highScore) {
        onUpdateHighScore(newScore);
      }
    } else {
      sound.playWrong();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIdx + 1 < MANGA_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      // Quiz finished
      setQuizFinished(true);
      sound.playVictory();
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Fallback
      }
      const earnedCoins = Math.round(score * 0.4);
      const earnedExp = Math.round(score * 0.6);
      onEarnRewards(earnedCoins, earnedExp);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setQuizFinished(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-orange-400 font-mono">Culture & Lore</span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
            Le Grand Quiz Manga
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Testez vos connaissances sur One Piece, Naruto, Jujutsu Kaisen, Dragon Ball et plus encore !
          </p>
        </div>

        {/* Score & Streak HUD */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
            <span className="text-slate-500 block text-[10px]">RECORD</span>
            <span className="text-amber-400 font-bold tabular-nums">{highScore} pts</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
            <span className="text-slate-500 block text-[10px]">SCORE</span>
            <span className="text-white font-bold tabular-nums">{score} pts</span>
          </div>
          {streak > 1 && (
            <div className="bg-orange-950/70 border border-orange-500/50 px-3 py-2 rounded-lg flex items-center gap-1.5 text-orange-400">
              <Flame className="w-4 h-4" />
              <span className="font-bold tabular-nums">x{streak} Série !</span>
            </div>
          )}
        </div>
      </div>

      {!quizFinished ? (
        <div className="bg-[#121622] border border-slate-800 rounded-xl p-6 sm:p-8 manga-panel space-y-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-orange-400 font-bold">Franchise : {question.franchise}</span>
              <span className="text-slate-600">/</span>
              <span>Difficulté : {question.difficulty}</span>
            </div>
            <span className="tabular-nums">
              Question {currentIdx + 1} sur {MANGA_QUESTIONS.length}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
            {question.question}
          </h2>

          {/* Hint Disclosure */}
          {question.clue && (
            <div className="text-xs">
              {!showHint ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowHint(true);
                  }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Besoin d'un indice ? (Cliquez pour révéler)</span>
                </button>
              ) : (
                <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded-lg text-amber-200 italic flex items-center gap-2">
                  <span className="font-bold">Indice :</span>
                  <span>{question.clue}</span>
                </div>
              )}
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {question.options.map((opt, idx) => {
              let btnClass = 'bg-slate-900/80 border-slate-700/80 hover:border-slate-500 text-slate-200';

              if (isAnswered) {
                if (idx === question.correctIndex) {
                  btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                } else if (idx === selectedOption) {
                  btnClass = 'bg-rose-950/60 border-rose-500 text-rose-200 line-through';
                } else {
                  btnClass = 'bg-slate-950 border-slate-800 text-slate-600 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-lg border text-left font-display font-semibold text-sm transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === question.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== question.correctIndex && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-2.5">
                {selectedOption === question.correctIndex ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-display font-bold text-sm text-white">
                    {selectedOption === question.correctIndex ? 'Excellente réponse !' : 'Mauvaise réponse...'}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{question.explanation}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  {currentIdx + 1 < MANGA_QUESTIONS.length ? 'Question Suivante →' : 'Voir le Bilan Final'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Summary Screen */
        <div className="bg-[#121622] border-2 border-orange-500/40 rounded-xl p-8 manga-panel text-center space-y-5">
          <div className="w-16 h-16 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center mx-auto text-orange-400">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl font-black text-white">Quiz Terminé !</h2>
          <p className="text-sm text-slate-300">
            Vous avez parcouru toutes les énigmes du monde manga avec brio.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 max-w-sm mx-auto grid grid-cols-2 gap-4 font-mono text-center">
            <div>
              <span className="text-slate-400 block text-xs">Score Final</span>
              <span className="text-white font-bold text-xl">{score} pts</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Gain Pièces</span>
              <span className="text-amber-400 font-bold text-xl">+{Math.round(score * 0.4)}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recommencer le Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
