import { useState, useEffect, useRef, useCallback } from 'react';
import './QuestionCard.css';

// Utility to get time - placed outside component to avoid impure function warnings
const getTime = () => window.performance.now();

function QuestionCard({ onComplete, userData, surveyStartTime, questions, likertOptions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [questionTimestamps, setQuestionTimestamps] = useState({});
  const questionStartTimeRef = useRef(0);
  const mountTimeRef = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const prevIndexRef = useRef(0);

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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const answeredProgress = (Object.keys(responses).length / questions.length) * 100;
  
  // Get the displayed selection value from responses
  const selectedValue = responses[currentQuestion.id] ?? null;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (mountTimeRef.current) {
        setElapsedTime(getTime() - mountTimeRef.current);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = useCallback((value) => {
    const now = getTime();
    const timeSpent = now - questionStartTimeRef.current;
    const questionId = questions[currentIndex].id;
    
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
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, questions]);

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
    const questionId = questions[currentIndex].id;
    if (currentIndex < questions.length - 1 && responses[questionId]) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  }, [currentIndex, responses, questions]);

  const handleSubmit = useCallback(() => {
    if (Object.keys(responses).length !== questions.length) {
      alert(`Please answer all questions. You have answered ${Object.keys(responses).length} of ${questions.length} questions.`);
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
  }, [responses, surveyStartTime, userData, onComplete, questionTimestamps, questions.length]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate average time per question
  const timestampValues = Object.values(questionTimestamps);
  const avgTime = timestampValues.length > 0 
    ? timestampValues.reduce((sum, t) => sum + t.duration, 0) / timestampValues.length 
    : 0;

  return (
    <div className="question-container">
      <div className="question-header">
        <div className="header-info">
          <span className="participant-name">{userData.name}</span>
          <span className="timer">⏱️ {formatTime(elapsedTime)}</span>
        </div>
        
        <div className="progress-section">
          <div className="progress-bar-container">
            <div 
              className="progress-bar answered" 
              style={{ width: `${answeredProgress}%` }}
            />
            <div 
              className="progress-bar current" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div className={`question-card ${isAnimating ? 'animating' : ''}`}>
        <div className="question-meta">
          <span className="question-number">Question #{currentIndex + 1}</span>
        </div>

        <h2 className="question-text">
          "{currentQuestion.text}"
        </h2>

        <p className="instruction">
          How accurately does this statement describe you?
        </p>

        <div className="likert-scale">
          {likertOptions.map(option => (
            <button
              key={option.value}
              className={`likert-option ${selectedValue === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <span className="option-value">{option.value}</span>
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="scale-labels">
          <span>Very Inaccurate</span>
          <span>Very Accurate</span>
        </div>
      </div>

      <div className="navigation-buttons">
        <button 
          className="nav-button prev"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button 
            className="nav-button submit"
            onClick={handleSubmit}
            disabled={Object.keys(responses).length !== questions.length}
          >
            Submit Assessment ✓
          </button>
        ) : (
          <button 
            className="nav-button next"
            onClick={handleNext}
            disabled={!responses[currentQuestion.id]}
          >
            Next →
          </button>
        )}
      </div>

      <div className="question-dots">
        {questions.map((q, index) => (
          <button
            key={q.id}
            className={`dot ${index === currentIndex ? 'current' : ''} ${responses[q.id] ? 'answered' : ''}`}
            onClick={() => setCurrentIndex(index)}
            title={`Question ${index + 1}`}
          />
        ))}
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Answered</span>
          <span className="stat-value">{Object.keys(responses).length}/{questions.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Remaining</span>
          <span className="stat-value">{questions.length - Object.keys(responses).length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Avg. Time/Question</span>
          <span className="stat-value">
            {avgTime > 0 ? formatTime(avgTime) : '--:--'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;
