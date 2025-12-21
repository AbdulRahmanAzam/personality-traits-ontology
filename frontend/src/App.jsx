import { useState, useCallback, useEffect } from 'react';
import { LandingPage, WelcomeForm, QuestionCard, Results } from './components';
import { fetchQuestions, fetchTraits, checkApiHealth } from './services/api';

// Screen states as constants for type safety and maintainability
const SCREENS = {
  LANDING: 'landing',
  WELCOME: 'welcome',
  ASSESSMENT: 'assessment',
  RESULTS: 'results',
  LOADING: 'loading',
  ERROR: 'error'
};

function App() {
  // UI State
  const [currentScreen, setCurrentScreen] = useState(SCREENS.LANDING);
  
  // User Data State
  const [userData, setUserData] = useState(null);
  const [surveyStartTime, setSurveyStartTime] = useState(0);
  const [assessmentData, setAssessmentData] = useState(null);
  
  // API Data State
  const [questions, setQuestions] = useState([]);
  const [likertOptions, setLikertOptions] = useState([]);
  const [traitInfo, setTraitInfo] = useState({});
  
  // API Status State
  const [apiError, setApiError] = useState(null);
  const [isApiReady, setIsApiReady] = useState(false);

  // Load questions from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if API is running
        const isHealthy = await checkApiHealth();
        if (!isHealthy) {
          setApiError('Backend API is not running. Please start the FastAPI server.');
          return;
        }

        // Fetch questions and Likert options
        const questionsData = await fetchQuestions();
        setQuestions(questionsData.questions);
        setLikertOptions(questionsData.likertOptions);

        // Fetch trait info
        const traitsData = await fetchTraits();
        const traitsMap = {};
        traitsData.traits.forEach(trait => {
          traitsMap[trait.key] = {
            name: trait.name,
            color: trait.color,
            label: trait.label
          };
        });
        setTraitInfo(traitsMap);
        setIsApiReady(true);
      } catch (error) {
        console.error('Failed to load data from API:', error);
        setApiError(`Failed to connect to API: ${error.message}`);
      }
    };

    loadData();
  }, []);

  // Navigation handlers
  const handleStartAssessment = useCallback(() => {
    if (!isApiReady) {
      setCurrentScreen(SCREENS.ERROR);
      return;
    }
    setCurrentScreen(SCREENS.WELCOME);
  }, [isApiReady]);

  const handleWelcomeComplete = useCallback((data) => {
    setUserData(data);
    setSurveyStartTime(Date.now());
    setCurrentScreen(SCREENS.ASSESSMENT);
  }, []);

  const handleAssessmentComplete = useCallback((data) => {
    setAssessmentData(data);
    setCurrentScreen(SCREENS.RESULTS);
  }, []);

  const handleRestart = useCallback(() => {
    setUserData(null);
    setSurveyStartTime(0);
    setAssessmentData(null);
    setCurrentScreen(SCREENS.LANDING);
  }, []);

  // Show error if API is not available
  if (apiError && currentScreen !== SCREENS.LANDING) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">⚠️ Connection Error</h2>
          <p className="text-red-300 mb-4">{apiError}</p>
          <p className="text-gray-300 mb-4">Make sure the FastAPI backend is running:</p>
          <code className="bg-black/30 text-cyan-300 px-4 py-2 rounded-lg font-mono text-sm mb-6">
            cd backend && uvicorn api:app --reload
          </code>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-cyan-900">
      {currentScreen === SCREENS.LANDING && (
        <LandingPage 
          onStartAssessment={handleStartAssessment} 
          isApiReady={isApiReady}
          apiError={apiError}
        />
      )}

      {currentScreen === SCREENS.WELCOME && (
        <WelcomeForm onStart={handleWelcomeComplete} />
      )}
      
      {currentScreen === SCREENS.ASSESSMENT && userData && questions.length > 0 && (
        <QuestionCard
          userData={userData}
          surveyStartTime={surveyStartTime}
          onComplete={handleAssessmentComplete}
          questions={questions}
          likertOptions={likertOptions}
        />
      )}
      
      {currentScreen === SCREENS.RESULTS && assessmentData && (
        <>
          <Results 
            assessmentData={assessmentData} 
            questions={questions}
            traitInfo={traitInfo}
          />
          <div className="flex justify-center py-8 bg-linear-to-b from-transparent to-slate-100">
            <button 
              className="px-8 py-4 bg-linear-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-2xl hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              onClick={handleRestart}
            >
              Start New Assessment
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

