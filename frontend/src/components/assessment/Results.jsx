import { useState, useEffect, useMemo } from 'react';
import { submitAssessment } from '../../services/api';
import GuidanceChat from '../guidance/GuidanceChat';

// Default trait colors
const traitColors = {
  extraversion: '#ef4444',
  agreeableness: '#22c55e',
  conscientiousness: '#3b82f6',
  neuroticism: '#f59e0b',
  openness: '#8b5cf6'
};

const traitIcons = {
  extraversion: '🗣️',
  agreeableness: '🤝',
  conscientiousness: '📋',
  neuroticism: '😰',
  openness: '💡'
};

export function Results({ assessmentData, questions, isDark = false }) {
  const { userData, responses, timestamps } = assessmentData;
  const [apiResults, setApiResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [showAllTimestamps, setShowAllTimestamps] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  // Fetch results from API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        // Include timestamps in the submission
        const result = await submitAssessment({
          responses,
          userData,
          timestamps: {
            surveyStartTime: timestamps.surveyStartTime,
            surveyEndTime: timestamps.surveyEndTime,
            totalDuration: timestamps.totalDuration,
            questionTimestamps: timestamps.questionTimestamps
          }
        });
        setApiResults(result);
        if (result.assessmentId) {
          setAssessmentId(result.assessmentId);
        }
      } catch (err) {
        console.error('Failed to fetch results from API:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [responses, userData, timestamps]);

  // Format duration
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Get average time per question
  const avgQuestionTime = useMemo(() => {
    const times = Object.values(timestamps.questionTimestamps);
    if (times.length === 0) return 0;
    return times.reduce((sum, t) => sum + t.duration, 0) / times.length;
  }, [timestamps.questionTimestamps]);

  // Convert API results to display format
  const traitScores = useMemo(() => {
    if (!apiResults?.traits) return [];
    
    return Object.entries(apiResults.traits).map(([key, trait]) => {
      const percentage = Math.round(trait.percentile);
      let level;
      if (percentage >= 70) level = 'High';
      else if (percentage >= 40) level = 'Moderate';
      else level = 'Low';

      return {
        key: key.charAt(0).toUpperCase(),
        traitKey: key,
        name: trait.name,
        color: traitColors[key] || '#666',
        rawScore: trait.rawScore,
        maxScore: trait.maxScore,
        percentage,
        percentile: trait.percentile,
        tScore: trait.tScore,
        level,
        interpretation: trait.interpretation,
        description: getTraitDescription(key.charAt(0).toUpperCase(), level)
      };
    });
  }, [apiResults]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto p-6 min-h-screen flex flex-col gap-6 ${isDark ? 'bg-slate-900' : 'bg-linear-to-b from-slate-50 to-slate-100'}`}>
        <div className="flex flex-col items-center justify-center flex-1 py-16">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Analyzing your responses...</h2>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Calculating your personality profile using ontology data</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`max-w-4xl mx-auto p-6 min-h-screen flex flex-col gap-6 ${isDark ? 'bg-slate-900' : 'bg-linear-to-b from-slate-50 to-slate-100'}`}>
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error loading results</h2>
          <p className={`mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{error}</p>
          <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>Please make sure the backend API is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 min-h-screen flex flex-col gap-6 ${isDark ? 'bg-slate-900' : 'bg-linear-to-b from-slate-50 to-slate-100'}`}>
      <div className="text-center py-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>🎯 Your Personality Profile</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Big Five Assessment Results (Powered by OWL Ontology)</p>
      </div>

      <div className={`rounded-2xl p-6 shadow-lg border flex flex-col md:flex-row justify-between gap-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col">
            <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Participant</span>
            <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{userData.name}</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Age</span>
            <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{userData.age}</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Country</span>
            <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{userData.country}</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>University</span>
            <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{userData.university || 'N/A'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Time</span>
            <span className="text-lg font-bold text-cyan-600">{formatDuration(timestamps.totalDuration)}</span>
          </div>
          <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Avg. per Question</span>
            <span className="text-lg font-bold text-cyan-600">{(avgQuestionTime / 1000).toFixed(1)}s</span>
          </div>
          <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Questions</span>
            <span className="text-lg font-bold text-cyan-600">{questions?.length || 50}</span>
          </div>
        </div>
      </div>

      {/* Trait Scores Section */}
      <div className={`rounded-2xl p-6 shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}> Your Trait Analysis</h2>
        <div className="space-y-6">
          {traitScores.map(trait => (
            <div key={trait.key} className={`border-b pb-5 last:border-b-0 last:pb-0 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="flex items-center gap-4 mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0"
                  style={{ backgroundColor: trait.color }}
                >
                  {traitIcons[trait.traitKey] || '📊'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{trait.name}</h3>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: trait.color + '20', color: trait.color }}>
                      {trait.interpretation || trait.level}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>T-Score: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{trait.tScore.toFixed(1)}</strong></span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Percentile: <strong style={{ color: trait.color }}>{trait.percentile.toFixed(1)}%</strong></span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Raw: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{trait.rawScore}/{trait.maxScore}</strong></span>
                  </div>
                </div>
              </div>
              <div className={`h-2 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${trait.percentage}%`, backgroundColor: trait.color }}
                />
              </div>
              <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{trait.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions Section */}
      {apiResults?.predictions && Object.keys(apiResults.predictions).length > 0 && (
        <div className={`rounded-2xl p-6 shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>📈 Predicted Outcomes</h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Based on meta-analytic correlations from psychological research</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(apiResults.predictions).map(([key, prediction]) => (
              <div key={key} className={`rounded-xl p-4 border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-linear-to-br from-slate-50 to-slate-100 border-slate-200'}`}>
                <h4 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatPredictionName(key)}</h4>
                <div className="mb-3">
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                    <div 
                      className="h-full bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${prediction.score}%` }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-cyan-600">{prediction.score.toFixed(1)}</span>
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{prediction.interpretation}</span>
                <div className="mt-3 flex flex-wrap gap-1">
                  {prediction.contributingTraits?.map((ct, idx) => (
                    <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                      {ct.trait}: r={ct.correlation.toFixed(2)} ({ct.numStudies} studies)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <button 
          className="px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-indigo-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
          onClick={() => setShowGuidance(true)}
          disabled={!assessmentId}
          title={!assessmentId ? 'Results must be saved to database first' : 'Get AI-powered personalized guidance'}
        >
          🧠 Get Personalized Guidance
        </button>
        <button 
          className="px-6 py-3 bg-linear-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-400 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
          onClick={() => downloadPDF(assessmentId, userData.name)}
          disabled={!assessmentId}
          title={!assessmentId ? 'Results must be saved to database first' : 'Download PDF Report'}
        >
          📄 Download PDF Report
        </button>
      </div>

      { /* Timestamps Section */}
      <div className={`rounded-2xl p-6 shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>⏱️ Response Timing Details</h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Survey started: {new Date(timestamps.surveyStartTime).toLocaleString()}
        </p>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Object.entries(timestamps.questionTimestamps)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .slice(0, showAllTimestamps ? undefined : 10)
            .map(([id, data]) => (
              <div key={id} className={`rounded-lg p-2 text-center ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Q{id}</span>
                <span className="text-sm font-bold text-cyan-600">{(data.duration / 1000).toFixed(1)}s</span>
              </div>
            ))}
        </div>
        {Object.keys(timestamps.questionTimestamps).length > 10 && (
          <button 
            onClick={() => setShowAllTimestamps(!showAllTimestamps)}
            className={`mt-4 w-full py-2 px-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
          >
            {showAllTimestamps ? (
              <>
                <span>Show Less</span>
                <span>↑</span>
              </>
            ) : (
              <>
                <span>Show All {Object.keys(timestamps.questionTimestamps).length} Questions</span>
                <span>↓</span>
              </>
            )}
          </button>
        )}
      </div>

      

      {/* Guidance Modal */}
      {showGuidance && (
        <GuidanceChat 
          assessmentId={assessmentId}
          userName={userData.name}
          onClose={() => setShowGuidance(false)}
        />
      )}
    </div>
  );
}

async function downloadPDF(assessmentId, userName) {
  if (!assessmentId) {
    alert('Results must be saved to database to export PDF');
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/export/pdf/${assessmentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personality-report-${userName.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF download error:', error);
    alert('Failed to download PDF. Please ensure the backend is running.');
  }
}

function formatPredictionName(key) {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getTraitDescription(trait, level) {
  const descriptions = {
    E: {
      High: 'You are outgoing, energetic, and thrive in social situations. You enjoy being around others and often take the lead.',
      Moderate: 'You have a balanced approach to socializing. You enjoy company but also value your alone time.',
      Low: 'You prefer solitude or small groups. You recharge through quiet time and introspection.'
    },
    A: {
      High: 'You are cooperative, trusting, and considerate of others. Building harmony is important to you.',
      Moderate: 'You balance assertiveness with cooperation. You can be both competitive and collaborative.',
      Low: 'You tend to be more competitive and skeptical. You prioritize your own interests and speak your mind.'
    },
    C: {
      High: 'You are organized, disciplined, and goal-oriented. You plan ahead and follow through on commitments.',
      Moderate: 'You balance structure with flexibility. You can be organized when needed but also spontaneous.',
      Low: 'You prefer flexibility and spontaneity. You may find strict schedules constraining.'
    },
    N: {
      High: 'You experience emotions intensely and may be prone to stress. You are sensitive to your environment.',
      Moderate: 'You have typical emotional responses. You handle stress reasonably well most of the time.',
      Low: 'You are emotionally stable and resilient. You tend to stay calm under pressure.'
    },
    O: {
      High: 'You are curious, creative, and open to new experiences. You appreciate art, ideas, and adventure.',
      Moderate: 'You balance tradition with openness. You appreciate new ideas while valuing familiarity.',
      Low: 'You prefer routine and familiarity. You are practical and prefer concrete over abstract.'
    }
  };
  return descriptions[trait]?.[level] || '';
}

export default Results;
