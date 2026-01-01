import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDevAutoFill } from '../../dev';
import { questionMeanings } from '../../data/questionMeanings';

// Utility to get time - placed outside component to avoid impure function warnings
const getTime = () => window.performance.now();

// Tooltip component for question meanings
function QuestionTooltip({ questionId, children }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const meaning = questionMeanings[questionId];

  if (!meaning) return children;

  return (
    <span 
      className="relative cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <span 
          className="absolute z-50 w-80 p-4 bg-slate-800 text-white text-sm rounded-xl shadow-2xl -top-2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ animation: 'fade-in 0.2s ease' }}
        >
          <span className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg shrink-0">💡</span>
            <span className="leading-relaxed">{meaning}</span>
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-8 border-transparent border-t-slate-800"></span>
        </span>
      )}
    </span>
  );
}

export function QuestionCard({ onComplete, userData, surveyStartTime, questions, likertOptions, isDark = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [questionTimestamps, setQuestionTimestamps] = useState({});
  const questionStartTimeRef = useRef(0);
  const mountTimeRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const prevIndexRef = useRef(0);
  const [viewMode, setViewMode] = useState('sequential'); // 'sequential' | 'review'
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Dev mode auto-fill hook
  const { autoFillResponses, isDevMode } = useDevAutoFill(setResponses, setQuestionTimestamps);

  // Initialize refs on mount
  useEffect(() => {
    const now = getTime();
    mountTimeRef.current = now;
    questionStartTimeRef.current = now;
  }, []);

  // Track question changes for timing
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      questionStartTimeRef.current = getTime();
    }
  }, [currentIndex]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (mountTimeRef.current) {
        setElapsedTime(getTime() - mountTimeRef.current);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate unanswered questions
  const unansweredQuestions = useMemo(() => {
    return questions.filter(q => !responses[q.id]);
  }, [questions, responses]);

  const answeredCount = useMemo(() => Object.keys(responses).length, [responses]);
  const allAnswered = answeredCount === questions.length;

  // Get current question based on view mode
  const currentQuestion = useMemo(() => {
    if (viewMode === 'review' && unansweredQuestions.length > 0) {
      return unansweredQuestions[Math.min(currentIndex, unansweredQuestions.length - 1)];
    }
    return questions[currentIndex];
  }, [viewMode, currentIndex, questions, unansweredQuestions]);

  // Get the actual index in the original questions array
  const originalIndex = useMemo(() => {
    if (!currentQuestion) return 0;
    return questions.findIndex(q => q.id === currentQuestion.id);
  }, [currentQuestion, questions]);

  const handleSelect = useCallback((value) => {
    const now = getTime();
    const timeSpent = now - questionStartTimeRef.current;
    const questionId = currentQuestion?.id;
    
    if (!questionId) return;
    
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    setQuestionTimestamps(prev => ({
      ...prev,
      [questionId]: {
        questionId: questionId,
        startTime: Math.round(questionStartTimeRef.current),
        endTime: Math.round(now),
        duration: Math.round(timeSpent)
      }
    }));

    // Auto-advance after selection with animation
    setIsAnimating(true);
    setTimeout(() => {
      if (viewMode === 'review') {
        // In review mode, check if there are more unanswered questions
        const remainingUnanswered = unansweredQuestions.filter(q => q.id !== questionId);
        if (remainingUnanswered.length === 0) {
          // All done! Show completion modal
          setShowCompletionModal(true);
        }
      } else {
        // Sequential mode
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else if (unansweredQuestions.length > 1) {
          // Reached end with unanswered questions, switch to review mode
          setViewMode('review');
          setCurrentIndex(0);
        } else if (Object.keys(responses).length + 1 === questions.length) {
          // This was the last answer needed
          setShowCompletionModal(true);
        }
      }
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, currentQuestion, questions, viewMode, unansweredQuestions, responses]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    const maxIndex = viewMode === 'review' ? unansweredQuestions.length - 1 : questions.length - 1;
    
    if (currentIndex < maxIndex) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  }, [currentIndex, viewMode, questions.length, unansweredQuestions.length]);

  const handleSkip = useCallback(() => {
    const maxIndex = viewMode === 'review' ? unansweredQuestions.length - 1 : questions.length - 1;
    
    if (currentIndex < maxIndex) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else if (viewMode === 'sequential' && unansweredQuestions.length > 0) {
      // Reached end in sequential mode with unanswered questions
      // Automatically switch to review mode and show the first unanswered question
      setViewMode('review');
      setCurrentIndex(0);
      // Show a notification that we're now in review mode
      alert(`You have ${unansweredQuestions.length} unanswered question(s). Please complete all questions before submitting.`);
    }
  }, [currentIndex, viewMode, questions.length, unansweredQuestions.length, unansweredQuestions]);

  const handleGoToQuestion = useCallback((index) => {
    if (viewMode === 'review') {
      // Switch back to sequential mode and go to the question
      setViewMode('sequential');
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 200);
  }, [viewMode]);

  const handleSubmit = useCallback(() => {
    if (!allAnswered) {
      return;
    }

    const now = getTime();
    const surveyEndTime = surveyStartTime + (now - mountTimeRef.current);
    const totalDuration = surveyEndTime - surveyStartTime;

    onComplete({
      userData,
      responses,
      timestamps: {
        surveyStartTime,
        surveyEndTime: Math.round(surveyEndTime),
        totalDuration: Math.round(totalDuration),
        questionTimestamps
      }
    });
  }, [allAnswered, responses, surveyStartTime, userData, onComplete, questionTimestamps]);

  const formatTime = useCallback((ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate average time per question
  const avgTime = useMemo(() => {
    const timestampValues = Object.values(questionTimestamps);
    return timestampValues.length > 0 
      ? timestampValues.reduce((sum, t) => sum + t.duration, 0) / timestampValues.length 
      : 0;
  }, [questionTimestamps]);

  // Derived values
  const answeredProgress = (answeredCount / questions.length) * 100;
  const selectedValue = currentQuestion ? (responses[currentQuestion.id] ?? null) : null;

  // Guard: If all questions are answered and we're beyond the array, show a loading state
  if (!currentQuestion && !showCompletionModal) {
    return <div className={`max-w-4xl mx-auto p-6 min-h-screen flex flex-col gap-5 ${isDark ? 'bg-slate-900' : 'bg-linear-to-b from-slate-50 to-slate-100'}`}>Processing your responses...</div>;
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 min-h-screen flex flex-col gap-5 ${isDark ? 'bg-slate-900' : 'bg-linear-to-b from-slate-50 to-slate-100'}`}>
      {/* Completion Modal */}
      {showCompletionModal && allAnswered && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50" style={{ animation: 'fade-in 0.3s ease' }}>
          <div className={`rounded-3xl p-12 max-w-lg w-[90%] text-center shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`} style={{ animation: 'modal-pop 0.4s ease' }}>
            <div className="w-20 h-20 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-6 shadow-lg shadow-emerald-500/40">
              ✓
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Assessment Complete!</h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>You've answered all {questions.length} questions.</p>
            <div className="flex justify-center gap-10 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-cyan-500">{formatTime(elapsedTime)}</span>
                <span className={`text-sm uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Time</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-cyan-500">{formatTime(avgTime)}</span>
                <span className={`text-sm uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Avg per Question</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                className={`px-7 py-3.5 font-semibold rounded-xl transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                onClick={() => {
                  setShowCompletionModal(false);
                  setViewMode('sequential');
                  setCurrentIndex(0);
                }}
              >
                Review Answers
              </button>
              <button 
                className="px-8 py-3.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl"
                onClick={handleSubmit}
              >
                Submit Assessment →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-linear-to-br from-slate-900 via-blue-900 to-cyan-900 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-linear-to-br from-cyan-500 to-cyan-400 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-cyan-500/40">
              {userData.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-white font-semibold text-lg">{userData.name}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 px-4 py-2.5 rounded-xl backdrop-blur border border-white/10">
            <span className="text-lg">⏱️</span>
            <span className="text-white text-xl font-bold tabular-nums">{formatTime(elapsedTime)}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm font-medium">
              {viewMode === 'review' ? '⚠️ Review Unanswered' : 'Progress'}
            </span>
            <span className="text-white text-sm font-semibold">
              {answeredCount} / {questions.length} answered
            </span>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden relative">
            <div 
              className="absolute h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-500 z-10" 
              style={{ width: `${answeredProgress}%` }}
            />
            <div 
              className="absolute h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 blur-sm opacity-50 transition-all duration-500" 
              style={{ width: `${answeredProgress}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className={`rounded-3xl p-9 shadow-lg border transition-all duration-300 flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-black/5'} ${isAnimating ? 'scale-[0.98] translate-y-1 opacity-70' : ''} ${viewMode === 'review' ? 'border-2 border-amber-500 shadow-amber-500/15' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <span className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-linear-to-br from-slate-100 to-slate-200 text-slate-600'}`}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          {!selectedValue && (
            <span className="bg-linear-to-br from-amber-100 to-amber-200 text-amber-800 px-3.5 py-2 rounded-lg text-sm font-semibold">
              Not Answered
            </span>
          )}
          {selectedValue && (
            <span className="bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-800 px-3.5 py-2 rounded-lg text-sm font-semibold">
              ✓ Answered
            </span>
          )}
        </div>

         <p className={`text-xs text-center flex items-center justify-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <span className="text-cyan-500">💡</span>
          <span>Hover the question for explanation</span>
        </p>

        <h2 className={`text-2xl leading-relaxed mb-4 font-medium text-center italic ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <QuestionTooltip questionId={currentQuestion?.id}>
            "{currentQuestion?.text}"
          </QuestionTooltip>
        </h2>

        <p className={`text-base mb-6 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          How accurately does this statement describe you?
        </p>
        
       

        <div className="grid grid-cols-5 gap-3 mb-4">
          {likertOptions.map(option => (
            <button
              key={option.value}
              className={`flex flex-col items-center py-6 px-3 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden group
                ${selectedValue === option.value 
                  ? 'border-cyan-500 -translate-y-1.5 shadow-xl shadow-cyan-500/35 bg-linear-to-br from-cyan-500 to-blue-600' 
                  : isDark
                    ? 'border-slate-600 bg-slate-700 hover:border-cyan-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20'
                    : 'border-slate-200 bg-linear-to-b from-white to-slate-50 hover:border-cyan-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20'
                }`}
              onClick={() => handleSelect(option.value)}
            >
              <span className={`text-3xl font-bold mb-2 transition-colors ${selectedValue === option.value ? 'text-white' : 'text-cyan-500'}`}>
                {option.value}
              </span>
              <span className={`text-xs text-center font-semibold leading-tight transition-colors ${selectedValue === option.value ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-between px-2 mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Very Inaccurate</span>
          <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Very Accurate</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-auto">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <button 
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} hover:-translate-x-0.5`}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <span className="text-lg">←</span>
            <span>Previous</span>
          </button>

          {!selectedValue && viewMode === 'sequential' && (
            <button 
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-linear-to-br from-amber-100 to-amber-200 text-amber-800 border-2 border-amber-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              onClick={handleSkip}
            >
              <span>Skip for now</span>
              <span className="text-lg">⏭️</span>
            </button>
          )}

          {allAnswered ? (
            <button 
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-linear-to-r from-emerald-500 to-emerald-600 text-white flex-1 justify-center max-w-[180px] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/40 transition-all"
              style={{ animation: 'pulse-ready 2s infinite' }}
              onClick={() => setShowCompletionModal(true)}
            >
              <span>Review & Submit</span>
              <span className="text-lg">✓</span>
            </button>
          ) : selectedValue ? (
            <button 
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-linear-to-r from-cyan-500 to-blue-600 text-white flex-1 justify-center max-w-[180px] hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-lg hover:shadow-cyan-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0"
              onClick={handleNext}
              disabled={viewMode === 'review' 
                ? currentIndex >= unansweredQuestions.length - 1 
                : currentIndex >= questions.length - 1}
            >
              <span>Next</span>
              <span className="text-lg">→</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Question Navigator */}
      <div className={`rounded-2xl p-5 shadow-md border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-black/5'}`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Question Navigator</span>
          <div className="flex gap-4">
            <span className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="w-3 h-3 rounded bg-emerald-500"></span> Answered
            </span>
            <span className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="w-3 h-3 rounded bg-cyan-500"></span> Current
            </span>
            <span className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className={`w-3 h-3 rounded border-2 bg-transparent ${isDark ? 'border-slate-500' : 'border-slate-300'}`}></span> Unanswered
            </span>
          </div>
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(24px, 1fr))' }}>
          {questions.map((q, index) => (
            <button
              key={q.id}
              className={`w-6 h-6 rounded-lg border-2 text-xs font-semibold flex items-center justify-center cursor-pointer transition-all hover:border-cyan-500 hover:scale-110 ${isDark ? 'hover:bg-slate-600' : 'hover:bg-cyan-50'}
                ${originalIndex === index 
                  ? 'border-cyan-500 bg-cyan-500 text-white scale-[1.15] shadow-lg shadow-cyan-500/40' 
                  : responses[q.id] 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : isDark 
                      ? 'border-slate-600 bg-slate-700 text-slate-400'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                }
                ${responses[q.id] && originalIndex === index ? 'bg-linear-to-br from-cyan-500 to-cyan-400 border-cyan-500' : ''}`}
              onClick={() => handleGoToQuestion(index)}
              title={`Question ${index + 1}${responses[q.id] ? ' (Answered)' : ' (Not answered)'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className={`flex justify-around items-center p-5 rounded-2xl shadow-md border flex-wrap gap-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">✅</div>
          <div className="flex flex-col">
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{answeredCount}</span>
            <span className={`text-[0.7rem] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Answered</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">⏳</div>
          <div className="flex flex-col">
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{questions.length - answeredCount}</span>
            <span className={`text-[0.7rem] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Remaining</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">📊</div>
          <div className="flex flex-col">
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{avgTime > 0 ? formatTime(avgTime) : '--:--'}</span>
            <span className={`text-[0.7rem] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Avg Time</span>
          </div>
        </div>
        {isDevMode && (
          <button 
            className="bg-linear-to-r from-orange-500 to-orange-600 text-white border-2 border-dashed border-orange-400 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 hover:shadow-xl"
            onClick={autoFillResponses}
            title="Auto-fill with leadership-focused test answers"
          >
            🚀 DEV: Auto-Fill
          </button>
        )}
      </div>

      {/* Floating Submit Button - appears when all answered */}
      {allAnswered && !showCompletionModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50" style={{ animation: 'float-in 0.5s ease' }}>
          <button 
            className="flex flex-col items-center gap-1 px-8 py-4 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl cursor-pointer shadow-xl transition-all hover:scale-105"
            style={{ animation: 'pulse-float 2s infinite' }}
            onClick={() => setShowCompletionModal(true)}
          >
            <span className="text-sm opacity-90">All questions answered!</span>
            <span className="text-lg font-bold">Click to Submit →</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
