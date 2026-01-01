import { useState, useCallback, useEffect } from 'react';
import { LandingPage, WelcomeForm, QuestionCard, Results, AdminLogin, AdminPanel } from './components';
import { fetchQuestions, fetchTraits, checkApiHealth } from './services/api';

// Screen states as constants for type safety and maintainability
const SCREENS = {
  LANDING: 'landing',
  WELCOME: 'welcome',
  ASSESSMENT: 'assessment',
  RESULTS: 'results',
  ADMIN_LOGIN: 'admin_login',
  ADMIN_PANEL: 'admin_panel',
  LOADING: 'loading',
  ERROR: 'error'
};

function App() {
  // UI State
  const [currentScreen, setCurrentScreen] = useState(SCREENS.LANDING);
  
  // Theme State - persisted to localStorage
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
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
  
  // Admin State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Theme effect - sync with document
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Check for admin route on mount
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      const storedToken = sessionStorage.getItem('adminToken');
      if (storedToken) {
        setIsAdminAuthenticated(true);
        setCurrentScreen(SCREENS.ADMIN_PANEL);
      } else {
        setCurrentScreen(SCREENS.ADMIN_LOGIN);
      }
    }
  }, []);

  // Load questions from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Checking API health...');
        
        // Check if API is running
        const isHealthy = await checkApiHealth();
        if (!isHealthy) {
          console.error('❌ Backend API health check failed!');
          setApiError('Backend API is not running. Please start the FastAPI server.');
          return;
        }

        console.log('✅ API is healthy, fetching data...');
        
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
        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load data from API:', error.message);
        setApiError(`Failed to connect to API: ${error.message}`);
      }
    };

    loadData();
  }, []);

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
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

  const handleAdminLogin = useCallback((success) => {
    if (success) {
      setIsAdminAuthenticated(true);
      setCurrentScreen(SCREENS.ADMIN_PANEL);
    }
  }, []);

  const handleAdminLogout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    setIsAdminAuthenticated(false);
    setCurrentScreen(SCREENS.LANDING);
    window.history.pushState({}, '', '/');
  }, []);

  const handleGoToAdmin = useCallback(() => {
    window.history.pushState({}, '', '/admin');
    const storedToken = sessionStorage.getItem('adminToken');
    if (storedToken) {
      setIsAdminAuthenticated(true);
      setCurrentScreen(SCREENS.ADMIN_PANEL);
    } else {
      setCurrentScreen(SCREENS.ADMIN_LOGIN);
    }
  }, []);

  // Theme toggle button component
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all ${
        isDark 
          ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
          : 'bg-white/10 hover:bg-white/20 text-white'
      }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );

  // Admin screens
  if (currentScreen === SCREENS.ADMIN_LOGIN) {
    return <AdminLogin onLogin={handleAdminLogin} isDark={isDark} />;
  }

  if (currentScreen === SCREENS.ADMIN_PANEL && isAdminAuthenticated) {
    return <AdminPanel onLogout={handleAdminLogout} isDark={isDark} />;
  }

  // Show error if API is not available
  if (apiError && currentScreen !== SCREENS.LANDING) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-linear-to-br from-slate-900 via-blue-900 to-cyan-900'}`}>
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
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-linear-to-br from-slate-900 via-blue-900 to-cyan-900'}`}>
      {/* Fixed Theme Toggle & Admin Access */}
      {(currentScreen === SCREENS.LANDING || currentScreen === SCREENS.WELCOME) && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <ThemeToggle />
          <button
            onClick={handleGoToAdmin}
            className={`p-2 rounded-lg transition-all ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Admin Panel"
          >
            🔐
          </button>
        </div>
      )}

      {currentScreen === SCREENS.LANDING && (
        <LandingPage 
          onStartAssessment={handleStartAssessment} 
          isApiReady={isApiReady}
          apiError={apiError}
          isDark={isDark}
        />
      )}

      {currentScreen === SCREENS.WELCOME && (
        <WelcomeForm onStart={handleWelcomeComplete} isDark={isDark} />
      )}
      
      {currentScreen === SCREENS.ASSESSMENT && userData && questions.length > 0 && (
        <QuestionCard
          userData={userData}
          surveyStartTime={surveyStartTime}
          onComplete={handleAssessmentComplete}
          questions={questions}
          likertOptions={likertOptions}
          isDark={isDark}
        />
      )}
      
      {currentScreen === SCREENS.RESULTS && assessmentData && (
        <>
          <Results 
            assessmentData={assessmentData} 
            questions={questions}
            traitInfo={traitInfo}
            isDark={isDark}
          />
          <div className={`flex justify-center py-8 ${isDark ? 'bg-slate-800' : 'bg-linear-to-b from-transparent to-slate-100'}`}>
            <button 
              className="px-8 py-4 bg-linear-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-2xl hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              onClick={handleRestart}
            >
              Take Another Assessment
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;