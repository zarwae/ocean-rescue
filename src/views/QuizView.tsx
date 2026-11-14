import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Clock, Timer, ArrowRight, ChevronRight } from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quizData';
import { soundEffects } from '../utils/soundEffects';

interface QuizViewProps {
  onRecordQuizCompleted: (correct: number, total: number, xp: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ onRecordQuizCompleted }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);

  const [quizState, setQuizState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    Array<{ question: QuizQuestion; chosenIndex: number; isCorrect: boolean }>
  >([]);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(25);

  const categories = [
    'All',
    'Marine Biology',
    'Ocean Pollution',
    'Coral Reefs',
    'Climate Change',
    'Ocean Conservation',
    'Endangered Species',
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const handleStartQuiz = () => {
    let pool = QUIZ_QUESTIONS.filter((q) => {
      const matchCat = selectedCategory === 'All' || q.category === selectedCategory;
      const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      return matchCat && matchDiff;
    });

    if (pool.length === 0) pool = QUIZ_QUESTIONS;

    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
    setActiveQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setUserAnswers([]);
    setTotalXpEarned(0);
    setSecondsLeft(25);
    setQuizState('playing');
    soundEffects.playBubblePop();
  };

  useEffect(() => {
    if (quizState !== 'playing' || !isTimerEnabled || hasAnswered) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, isTimerEnabled, hasAnswered, currentIndex]);

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;

    const currentQ = activeQuestions[currentIndex];
    const isCorrect = index === currentQ.correctIndex;

    setSelectedOption(index);
    setHasAnswered(true);

    if (isCorrect) {
      soundEffects.playBubblePop();
      soundEffects.playChime(3);
      setTotalXpEarned((prev) => prev + currentQ.xpReward);
    } else {
      soundEffects.playWarning();
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        chosenIndex: index,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setSecondsLeft(25);
    } else {
      const correctCount = userAnswers.filter((a) => a.isCorrect).length;
      onRecordQuizCompleted(correctCount, activeQuestions.length, totalXpEarned);
      soundEffects.playFanfare();
      setQuizState('results');
    }
  };

  const currentQ = activeQuestions[currentIndex];
  const correctTotal = userAnswers.filter((a) => a.isCorrect).length;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-28 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* SETUP SCREEN */}
        {quizState === 'setup' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <header className="space-y-3 pb-8 border-b border-[var(--border-hairline)]">
              <div className="text-[11px] font-medium tracking-[0.22em] text-[var(--accent-teal)] uppercase">
                Literasi Ilmiah · 52 Soal Terverifikasi
              </div>
              <h1 className="font-display font-light text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
                Tantangan Kuis Sains Samudra
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Uji pemahaman Anda terhadap biologi laut, terumbu karang, pengasaman air laut, dan konservasi SDG 14 melalui 10 soal acak.
              </p>
            </header>

            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2 pb-3 border-b border-[var(--border-hairline)]">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] block">
                    Kategori Topik
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        className="bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      >
                        {cat === 'All' ? 'Semua Kategori (Campuran)' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pb-3 border-b border-[var(--border-hairline)]">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] block">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    {difficulties.map((diff) => (
                      <option
                        key={diff}
                        value={diff}
                        className="bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      >
                        {diff === 'All' ? 'Semua Tingkat' : diff}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Timer className="w-4 h-4 text-[var(--accent-teal)]" />
                  <span>Gunakan batas waktu 25 detik per soal</span>
                </span>
                <input
                  type="checkbox"
                  checked={isTimerEnabled}
                  onChange={(e) => setIsTimerEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#367D7B] cursor-pointer"
                />
              </label>

              <div>
                <button
                  onClick={handleStartQuiz}
                  className="px-7 py-3.5 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] font-semibold text-xs tracking-wider uppercase transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Mulai Tantangan Kuis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {quizState === 'playing' && currentQ && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pb-4 border-b border-[var(--border-hairline)]">
              <span className="text-[var(--accent-teal)] font-medium tabular-nums">
                Pertanyaan {currentIndex + 1} / {activeQuestions.length}
              </span>

              <div className="flex items-center gap-4 tabular-nums">
                {isTimerEnabled && (
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      secondsLeft <= 5 ? 'text-[var(--accent-coral)] font-semibold' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {secondsLeft}s
                  </span>
                )}
                <span className="text-[var(--accent-sand)]">+{currentQ.xpReward} XP</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="text-[var(--accent-teal)] font-medium">{currentQ.category}</span>
                <span>·</span>
                <span>{currentQ.difficulty}</span>
              </div>

              <h2 className="font-display font-light text-2xl sm:text-3xl text-[var(--text-primary)] leading-snug">
                {currentQ.question}
              </h2>

              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((option, idx) => {
                  let btnStyle =
                    'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]';

                  if (hasAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-rose-500/15 text-rose-700 dark:text-rose-300';
                    } else {
                      btnStyle = 'bg-[var(--bg-surface)]/40 text-[var(--text-muted)] opacity-55';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={hasAnswered}
                      className={`w-full px-5 py-4 rounded-xl text-left text-sm transition-colors flex items-center justify-between gap-4 cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-baseline gap-3.5">
                        <span className="text-xs font-semibold text-[var(--text-muted)] shrink-0">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{option}</span>
                      </div>

                      {hasAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {hasAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="pt-5 border-t border-[var(--border-hairline)] space-y-2 animate-in fade-in duration-200">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent-teal)] font-medium">
                    Penjelasan Ilmiah
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {hasAnswered && (
                <div className="pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] text-xs font-semibold tracking-wider uppercase transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span>
                      {currentIndex < activeQuestions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {quizState === 'results' && (
          <div className="space-y-12 animate-in fade-in duration-200">
            <div className="pb-10 border-b border-[var(--border-hairline)] space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-[var(--accent-teal)] uppercase tracking-[0.2em] block">
                  Tantangan Selesai
                </span>
                <h2 className="font-display font-light text-3xl sm:text-5xl text-[var(--text-primary)]">
                  Skor: {correctTotal} / {activeQuestions.length} Benar
                </h2>
                <p className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">
                  {correctTotal >= 8
                    ? 'Luar biasa. Pemahaman Anda terhadap sains kelautan dan SDG 14 sangat mendalam.'
                    : correctTotal >= 5
                    ? 'Hasil yang baik. Tinjau pembahasan di bawah untuk memperkaya literasi laut Anda.'
                    : 'Terus tingkatkan wawasan Anda melalui artikel di Pustaka Riset Sains.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-10">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)] block">Akurasi</span>
                  <span className="text-3xl font-light font-display text-[var(--accent-teal)] tabular-nums">
                    {Math.round((correctTotal / activeQuestions.length) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)] block">XP Diperoleh</span>
                  <span className="text-3xl font-light font-display text-[var(--accent-sand)] tabular-nums">
                    +{totalXpEarned} XP
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleStartQuiz}
                  className="px-6 py-3 rounded-full bg-[#367D7B] hover:bg-[#267472] text-[#EDEBE3] text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Kuis Baru</span>
                </button>

                <button
                  onClick={() => setQuizState('setup')}
                  className="px-4 py-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Ubah Pengaturan
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-light text-2xl text-[var(--text-primary)]">
                Tinjauan Jawaban
              </h3>

              <div className="divide-y divide-[var(--border-hairline)]">
                {userAnswers.map((item, idx) => (
                  <div key={idx} className="py-5 space-y-2 text-xs sm:text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-medium text-[var(--text-primary)]">
                        {idx + 1}. {item.question.question}
                      </span>
                      <span
                        className={`text-xs font-medium shrink-0 ${
                          item.isCorrect ? 'text-emerald-500' : 'text-[var(--accent-coral)]'
                        }`}
                      >
                        {item.isCorrect ? 'Benar' : 'Salah'}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--text-secondary)]">
                      Pilihan Anda:{' '}
                      <span className={item.isCorrect ? 'text-emerald-500' : 'text-[var(--accent-coral)]'}>
                        {item.chosenIndex >= 0 ? item.question.options[item.chosenIndex] : 'Waktu Habis'}
                      </span>
                      {!item.isCorrect && (
                        <span>
                          {' '}
                          · Jawaban tepat:{' '}
                          <span className="text-emerald-500 font-medium">
                            {item.question.options[item.question.correctIndex]}
                          </span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {item.question.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
