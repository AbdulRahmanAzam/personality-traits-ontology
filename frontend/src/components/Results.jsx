import { useState, useEffect, useMemo } from 'react';
import { submitAssessment } from '../services/api';
import './Results.css';

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

function Results({ assessmentData, questions }) {
  const { userData, responses, timestamps } = assessmentData;
  const [apiResults, setApiResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch results from API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const result = await submitAssessment({
          responses,
          userData
        });
        setApiResults(result);
      } catch (err) {
        console.error('Failed to fetch results from API:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [responses, userData]);

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
      <div className="results-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Analyzing your responses...</h2>
          <p>Calculating your personality profile using ontology data</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="results-container">
        <div className="error-state">
          <h2>⚠️ Error loading results</h2>
          <p>{error}</p>
          <p>Please make sure the backend API is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>🎯 Your Personality Profile</h1>
        <p>Big Five Assessment Results (Powered by OWL Ontology)</p>
      </div>

      <div className="participant-card">
        <div className="participant-info">
          <div className="info-item">
            <span className="info-label">Participant</span>
            <span className="info-value">{userData.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age</span>
            <span className="info-value">{userData.age}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Country</span>
            <span className="info-value">{userData.country}</span>
          </div>
          <div className="info-item">
            <span className="info-label">University</span>
            <span className="info-value">{userData.university || 'N/A'}</span>
          </div>
        </div>
        <div className="timing-info">
          <div className="timing-item">
            <span className="timing-label">Total Time</span>
            <span className="timing-value">{formatDuration(timestamps.totalDuration)}</span>
          </div>
          <div className="timing-item">
            <span className="timing-label">Avg. per Question</span>
            <span className="timing-value">{(avgQuestionTime / 1000).toFixed(1)}s</span>
          </div>
          <div className="timing-item">
            <span className="timing-label">Questions</span>
            <span className="timing-value">{questions?.length || 50}</span>
          </div>
        </div>
      </div>

      <div className="traits-grid">
        {traitScores.map(trait => (
          <div key={trait.key} className="trait-card">
            <div className="trait-header" style={{ backgroundColor: trait.color + '15' }}>
              <div className="trait-icon" style={{ backgroundColor: trait.color }}>
                {traitIcons[trait.traitKey] || '📊'}
              </div>
              <h3 className="trait-name">{trait.name}</h3>
              <span className="trait-level" style={{ color: trait.color }}>
                {trait.interpretation || trait.level}
              </span>
            </div>
            
            <div className="trait-score-section">
              <div className="score-bar-container">
                <div 
                  className="score-bar" 
                  style={{ 
                    width: `${trait.percentage}%`,
                    backgroundColor: trait.color
                  }}
                />
              </div>
              <div className="score-numbers">
                <span className="raw-score">{trait.rawScore}/{trait.maxScore}</span>
                <span className="percentage" style={{ color: trait.color }}>
                  {trait.percentile.toFixed(1)}% (Percentile)
                </span>
              </div>
              <div className="t-score">
                T-Score: {trait.tScore.toFixed(1)}
              </div>
            </div>

            <p className="trait-description">{trait.description}</p>
          </div>
        ))}
      </div>

      {/* Predictions Section */}
      {apiResults?.predictions && Object.keys(apiResults.predictions).length > 0 && (
        <div className="predictions-section">
          <h2>📈 Predicted Outcomes</h2>
          <p className="predictions-note">Based on meta-analytic correlations from psychological research</p>
          <div className="predictions-grid">
            {Object.entries(apiResults.predictions).map(([key, prediction]) => (
              <div key={key} className="prediction-card">
                <h4>{formatPredictionName(key)}</h4>
                <div className="prediction-score">
                  <div className="prediction-bar-bg">
                    <div 
                      className="prediction-bar-fill"
                      style={{ width: `${prediction.score}%` }}
                    />
                  </div>
                  <span className="prediction-value">{prediction.score.toFixed(1)}</span>
                </div>
                <span className="prediction-interpretation">{prediction.interpretation}</span>
                <div className="contributing-traits">
                  {prediction.contributingTraits?.map((ct, idx) => (
                    <span key={idx} className="contributing-trait">
                      {ct.trait}: r={ct.correlation.toFixed(2)} ({ct.numStudies} studies)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="summary-section">
        <h2>📊 Summary</h2>
        <div className="summary-chart">
          {traitScores.map(trait => (
            <div key={trait.key} className="chart-bar-row">
              <span className="chart-label">{trait.name.substring(0, 3)}</span>
              <div className="chart-bar-bg">
                <div 
                  className="chart-bar-fill"
                  style={{ 
                    width: `${trait.percentage}%`,
                    backgroundColor: trait.color
                  }}
                />
              </div>
              <span className="chart-value">{trait.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="interpretation-section">
        <h2>🔍 What This Means</h2>
        <div className="interpretations">
          {traitScores.map(trait => (
            <div key={trait.key} className="interpretation-item">
              <div 
                className="interpretation-badge"
                style={{ backgroundColor: trait.color }}
              >
                {trait.name.charAt(0)}
              </div>
              <div className="interpretation-content">
                <strong>{trait.name} ({trait.interpretation || trait.level}):</strong> {trait.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="timestamp-section">
        <h2>⏱️ Response Timing Details</h2>
        <p className="timestamp-note">
          Survey started: {new Date(timestamps.surveyStartTime).toLocaleString()}
        </p>
        <div className="timestamp-grid">
          {Object.entries(timestamps.questionTimestamps)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .slice(0, 10)
            .map(([id, data]) => (
              <div key={id} className="timestamp-item">
                <span className="q-num">Q{id}</span>
                <span className="q-time">{(data.duration / 1000).toFixed(1)}s</span>
              </div>
            ))}
          {Object.keys(timestamps.questionTimestamps).length > 10 && (
            <div className="timestamp-item more">
              +{Object.keys(timestamps.questionTimestamps).length - 10} more
            </div>
          )}
        </div>
      </div>

      <button 
        className="download-button"
        onClick={() => downloadResults(assessmentData, traitScores, apiResults)}
      >
        📥 Download Results (JSON)
      </button>
    </div>
  );
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

function downloadResults(data, scores, apiResults) {
  const exportData = {
    participant: data.userData,
    results: scores.map(s => ({
      trait: s.name,
      rawScore: s.rawScore,
      percentile: s.percentile,
      tScore: s.tScore,
      interpretation: s.interpretation,
      level: s.level
    })),
    predictions: apiResults?.predictions || {},
    responses: data.responses,
    timing: {
      startTime: data.timestamps.surveyStartTime,
      endTime: data.timestamps.surveyEndTime,
      totalDuration: data.timestamps.totalDuration,
      questionTimes: data.timestamps.questionTimestamps
    },
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `personality-results-${data.userData.name.replace(/\s+/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default Results;
