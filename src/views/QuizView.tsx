import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  Clock, 
  Timer, 
  ArrowRight, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quizData';
import { soundEffects } from '../utils/soundEffects';

interface QuizViewProps {
  onRecordQuizCompleted: (correct: number, total: number, xp: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ onRecordQuizCompleted }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);

  // Active quiz session states
  const [quizState, setQuizState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Array<{ question: QuizQuestion; chosenIndex: number; isCorrect: boolean }>>([]);
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

  // Start new quiz
  const handleStartQuiz = () => {
    let pool = QUIZ_QUESTIONS.filter((q) => {
      const matchCat = selectedCategory === 'All' || q.category === selectedCategory;
      const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      return matchCat && matchDiff;
    });

    if (pool.length === 0) pool = QUIZ_QUESTIONS;

    // Shuffle and pick 10 questions
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

  // Timer countdown per question
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
      const correctCount = userAnswers.filter((a) => a.isCorrect).length + (selectedOption === activeQuestions[currentIndex].correctIndex ? 1 : 0);
      onRecordQuizCompleted(correctCount, activeQuestions.length, totalXpEarned);
      soundEffects.playFanfare();
      setQuizState('results');
    }
  };

  const currentQ = activeQuestions[currentIndex];
  const correctTotal = userAnswers.filter((a) => a.isCorrect).length;

  return (
    <div className="min-h-screen bg-[#02080D] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* SETUP SCREEN */}
        {quizState === 'setup' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-3">
              <div className="text-[11px] font-mono tracking-widest text-cyan-400/90 uppercase">
                Literasi Ilmiah & Uji Sains Samudra · 52 Soal Terverifikasi
              </div>
              <h1 className="font-display font-light text-3xl sm:text-5xl text-white tracking-tight">
                Tantangan Kuis Sains Samudra
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Uji pemahaman Anda terhadap biologi laut, ekologi terumbu karang, pengasaman air laut, dan diplomasi SDG 14 melalui 52 soal ilmiah terverifikasi.
              </p>
            </div>

            {/* Customization Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-6">
              <h3 className="font-display font-light text-lg text-white">
                Konfigurasi Sesi Kuis (10 Soal Acak)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Kategori Topik</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#03090F] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-cyan-400/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? 'Semua Kategori (Campuran)' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Tingkat Kesulitan</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#03090F] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-cyan-400/50"
                  >
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff === 'All' ? 'Semua Tingkat Kesulitan' : diff}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Timer Toggle */}
              <div className="pt-2 border-t border-white/[0.06]">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:border-white/[0.15] transition-colors">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-200">Batas Waktu 25 Detik / Soal</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTimerEnabled}
                    onChange={(e) => setIsTimerEnabled(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </label>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-medium text-xs tracking-wider uppercase hover:bg-cyan-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5"
              >
                <span>Mulai Tantangan Kuis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {quizState === 'playing' && currentQ && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Progress Bar */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 border-b border-white/[0.08]">
              <span className="text-cyan-300 font-medium">
                Pertanyaan {currentIndex + 1} dari {activeQuestions.length}
              </span>

              <div className="flex items-center gap-4">
                {isTimerEnabled && (
                  <span className={`flex items-center gap-1.5 tabular-nums ${secondsLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {secondsLeft}s
                  </span>
                )}
                <span className="text-slate-400">+{currentQ.xpReward} XP</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-6">
              
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400">{currentQ.category}</span>
                <span>&bull;</span>
                <span className="text-slate-500">{currentQ.difficulty}</span>
              </div>

              <h2 className="font-display font-light text-xl sm:text-2xl text-white leading-snug">
                {currentQ.question}
              </h2>

              {/* Options Grid */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((option, idx) => {
                  let btnStyle = 'bg-white/[0.02] border-white/[0.08] text-slate-200 hover:border-white/[0.2]';

                  if (hasAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-rose-500/10 border-rose-500/40 text-rose-300';
                    } else {
                      btnStyle = 'bg-white/[0.01] border-white/[0.04] text-slate-600 opacity-50';
                    }
                  } else if (selectedOption === idx) {
                    btnStyle = 'bg-cyan-500/10 border-cyan-400/50 text-cyan-300';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={hasAnswered}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-xs text-slate-300 shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {hasAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {hasAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Scientific Explanation Box */}
              {hasAnswered && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Penjelasan Ilmiah:</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Next Button */}
              {hasAnswered && (
                <div className="pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-xl bg-white text-slate-950 font-medium text-xs tracking-wider uppercase hover:bg-cyan-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5"
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
          <div className="space-y-8 animate-in zoom-in-95 duration-200">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center space-y-6">
              
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 mx-auto">
                <Award className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest block">
                  Tantangan Selesai
                </span>
                <h2 className="font-display font-light text-2xl sm:text-4xl text-white">
                  Skor: {correctTotal} / {activeQuestions.length} Benar
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  {correctTotal >= 8 
                    ? 'Luar biasa. Pemahaman Anda terhadap sains kelautan dan SDG 14 sangat mendalam.'
                    : correctTotal >= 5 
                    ? 'Hasil yang baik. Tinjau pembahasan jawaban di bawah untuk memperkaya literasi laut Anda.'
                    : 'Terus tingkatkan wawasan Anda melalui artikel di Pustaka Pengetahuan.'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto font-mono text-xs">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-500 block text-[10px] tracking-wider uppercase">Akurasi</span>
                  <span className="text-2xl font-light font-display text-cyan-300 tabular-nums">
                    {Math.round((correctTotal / activeQuestions.length) * 100)}%
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-500 block text-[10px] tracking-wider uppercase">XP Diperoleh</span>
                  <span className="text-2xl font-light font-display text-white tabular-nums">
                    +{totalXpEarned} XP
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={handleStartQuiz}
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-950 text-xs font-medium hover:bg-cyan-100 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Kuis (10 Soal Acak Baru)</span>
                </button>

                <button
                  onClick={() => setQuizState('setup')}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-slate-300 hover:text-white hover:border-white/[0.2] cursor-pointer"
                >
                  Ubah Pengaturan
                </button>
              </div>

            </div>

            {/* Answer Review Section */}
            <div className="space-y-4">
              <h3 className="font-display font-light text-xl text-white">
                Tinjauan Jawaban & Pembahasan Ilmiah
              </h3>

              <div className="space-y-3">
                {userAnswers.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      item.isCorrect 
                        ? 'bg-white/[0.01] border-emerald-500/30' 
                        : 'bg-white/[0.01] border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">
                        Soal {idx + 1}: {item.question.question}
                      </span>
                      <span className={`font-mono text-[10px] ${
                        item.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.isCorrect ? 'Benar' : 'Salah'}
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      Pilihan Anda: <span className={item.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                        {item.chosenIndex >= 0 ? item.question.options[item.chosenIndex] : 'Waktu Habis'}
                      </span>
                      {!item.isCorrect && (
                        <span> &bull; Jawaban Tepat: <span className="text-emerald-300">{item.question.options[item.question.correctIndex]}</span></span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 italic pt-1 border-t border-white/[0.04]">
                      {item.question.explanation}
                    </div>
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
