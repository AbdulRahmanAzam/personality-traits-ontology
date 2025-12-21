import { useState, useEffect, useRef } from 'react';

function GuidanceChat({ assessmentId, userName, onClose }) {
  const [step, setStep] = useState('questions'); // 'questions' | 'loading' | 'guidance'
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [guidance, setGuidance] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const guidanceRef = useRef(null);

  // Fetch lifestyle questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Auto-scroll during streaming
  useEffect(() => {
    if (guidanceRef.current && isStreaming) {
      guidanceRef.current.scrollTop = guidanceRef.current.scrollHeight;
    }
  }, [guidance, isStreaming]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/guidance/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error(err);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const allQuestionsAnswered = questions.length > 0 && 
    questions.every(q => answers[q.id] && answers[q.id].trim() !== '');

  const generateGuidance = async () => {
    setStep('loading');
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/guidance/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          lifestyle_answers: {
            current_situation: answers.current_situation || '',
            career_goal: answers.career_goal || '',
            work_environment: answers.work_environment || '',
            main_challenge: answers.main_challenge || '',
            life_priority: answers.life_priority || ''
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate guidance');
      }

      setStep('guidance');
      setIsStreaming(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                setGuidance(prev => prev + data.chunk);
              }
              if (data.done) {
                setIsStreaming(false);
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      setIsStreaming(false);
    } catch (err) {
      setError(err.message);
      setStep('questions');
      console.error(err);
    }
  };

  // Render markdown-like content with basic formatting
  const renderGuidance = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-bold text-slate-800 mt-6 mb-3">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold text-slate-900 mt-6 mb-4">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('- **') || line.startsWith('* **')) {
        const content = line.slice(2);
        const boldMatch = content.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
        if (boldMatch) {
          elements.push(
            <li key={index} className="ml-4 mb-2 text-slate-700">
              <span className="font-semibold text-slate-900">{boldMatch[1]}</span>
              {boldMatch[2] && `: ${boldMatch[2]}`}
            </li>
          );
        } else {
          elements.push(
            <li key={index} className="ml-4 mb-2 text-slate-700">{content}</li>
          );
        }
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-4 mb-2 text-slate-700">{line.slice(2)}</li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={index} className="ml-4 mb-2 text-slate-700 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        // Handle inline bold
        const parts = line.split(/\*\*(.+?)\*\*/g);
        const formattedLine = parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
        );
        elements.push(
          <p key={index} className="text-slate-700 mb-2 leading-relaxed">{formattedLine}</p>
        );
      }
    });
    
    return elements;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🧠 Personalized Guidance</h2>
              <p className="text-purple-200 text-sm mt-1">
                {step === 'questions' && 'Answer a few questions to get AI-powered insights'}
                {step === 'loading' && 'Analyzing your personality profile...'}
                {step === 'guidance' && `Personalized guidance for ${userName}`}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-light transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8" ref={guidanceRef}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700">⚠️ {error}</p>
            </div>
          )}

          {step === 'questions' && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-purple-900 mb-2">✨ What you'll get:</h3>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Detailed analysis of your personality strengths</li>
                  <li>• Career path recommendations based on your profile</li>
                  <li>• Personalized growth strategies and action plans</li>
                  <li>• Insights on relationships and leadership style</li>
                </ul>
              </div>

              {questions.map((question, index) => (
                <div key={question.id} className="bg-slate-50 rounded-xl p-6">
                  <label className="block text-slate-800 font-medium mb-3">
                    <span className="text-purple-600 font-bold mr-2">{index + 1}.</span>
                    {question.question}
                  </label>
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-white"
                  >
                    <option value="">Select an option...</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Generating Your Personalized Guidance</h3>
              <p className="text-slate-500 text-center max-w-md">
                Our AI is analyzing your Big Five personality profile and combining it with psychological research to create tailored advice just for you...
              </p>
              <div className="flex gap-2 mt-6">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Analyzing traits</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">RAG retrieval</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Gemini AI</span>
              </div>
            </div>
          )}

          {step === 'guidance' && (
            <div className="prose prose-slate max-w-none">
              {renderGuidance(guidance)}
              {isStreaming && (
                <span className="inline-block w-2 h-5 bg-purple-600 animate-pulse ml-1"></span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-4 bg-slate-50">
          {step === 'questions' && (
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm">
                {Object.keys(answers).length} of {questions.length} questions answered
              </p>
              <button
                onClick={generateGuidance}
                disabled={!allQuestionsAnswered}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  allQuestionsAnswered
                    ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Generate My Guidance
                <span>✨</span>
              </button>
            </div>
          )}

          {step === 'guidance' && !isStreaming && (
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm">
                Guidance generated by Groq AI with RAG-enhanced personality knowledge
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('questions');
                    setGuidance('');
                  }}
                  className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GuidanceChat;
