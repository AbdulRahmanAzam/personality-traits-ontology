import { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import WelcomeForm from './components/WelcomeForm';
import QuestionCard from './components/QuestionCard';
import Results from './components/Results';
import { fetchQuestions, fetchTraits, checkApiHealth } from './services/api';
import './App.css';

// Screen states
const SCREENS = {
  LANDING: 'landing',
  WELCOME: 'welcome',
  ASSESSMENT: 'assessment',
  RESULTS: 'results',
  LOADING: 'loading',
  ERROR: 'error'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.LANDING);
  const [userData, setUserData] = useState(null);
  const [surveyStartTime, setSurveyStartTime] = useState(0);
  const [assessmentData, setAssessmentData] = useState(null);
  
  // Data from API
  const [questions, setQuestions] = useState([]);
  const [likertOptions, setLikertOptions] = useState([]);
  const [traitInfo, setTraitInfo] = useState({});
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
      <div className="app">
        <div className="error-container">
          <h2>⚠️ Connection Error</h2>
          <p>{apiError}</p>
          <p>Make sure the FastAPI backend is running:</p>
          <code>cd backend && uvicorn api:app --reload</code>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
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
          <div className="restart-section">
            <button className="restart-button" onClick={handleRestart}>
              Start New Assessment
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
