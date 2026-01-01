const developers = [
  {
    name: 'Muhammad Abbas',
    role: 'Frontend Developer',
    description: 'Specializes in React.js and UI/UX design for interactive web applications.',
    avatar: '👨‍💻'
  },
  {
    name: 'Abdul Rahman Azam',
    role: 'AI Developer',
    description: 'Expert in Python, OWL ontologies, and knowledge representation systems.',
    avatar: '👩‍💻'
  },
  {
    name: 'Hamza Shiekh',
    role: 'Backend Developer',
    description: 'Handles integration, testing, and deployment of the complete system.',
    avatar: '🧑‍💻'
  }
];

export function LandingPage({ onStartAssessment, isApiReady, apiError, isDark = false }) {
  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Hero Section */}
      <header className="bg-linear-to-br from-slate-900 via-blue-900 to-cyan-900 pb-16 pt-[70px] relative overflow-hidden">
        <nav className="flex justify-between items-center px-8 py-4 max-w-6xl mx-auto fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-slate-900 to-blue-900 shadow-xl">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <span className="text-2xl">🧠</span>
            <span>Big Five Assessment</span>
          </div>
          <div className="flex gap-8">
            <a href="#about" className="text-white/85 hover:text-white font-medium text-sm transition-colors">About</a>
            <a href="#team" className="text-white/85 hover:text-white font-medium text-sm transition-colors">Team</a>
            <a href="#assessment" className="text-white/85 hover:text-white font-medium text-sm transition-colors">Assessment</a>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto text-center px-8 py-16">
          <h1 className="text-5xl font-extrabold text-white mb-5 leading-tight">
            Discover Your <span className="bg-linear-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">Personality</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-6 leading-relaxed">
            A scientifically validated Big Five Personality Assessment powered by 
            Knowledge Representation and Reasoning using OWL Ontology
          </p>
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <span className="bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm font-medium backdrop-blur border border-white/15">IPIP-50 Scale</span>
            <span className="bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm font-medium backdrop-blur border border-white/15">50 Questions</span>
            <span className="bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm font-medium backdrop-blur border border-white/15">~15 Minutes</span>
            <span className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium backdrop-blur border ${isApiReady ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'bg-red-500/20 border-red-500/40 text-red-300'}`}>
              {isApiReady ? '✓ API Connected' : '⚠ API Offline'}
            </span>
          </div>
          {apiError && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-6 py-4 mb-6 max-w-lg mx-auto">
              <p className="text-red-300 text-sm mb-2">⚠️ {apiError}</p>
              <p className="text-white/70 text-xs">Run: <code className="bg-black/30 px-2 py-1 rounded font-mono text-xs">cd backend && uvicorn api:app --reload</code></p>
            </div>
          )}
          <button 
            className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none group"
            onClick={onStartAssessment}
            disabled={!isApiReady}
          >
            {isApiReady ? 'Take the Assessment' : 'Waiting for API...'}
            <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-linear-to-br from-purple-500 to-purple-600" style={{ animation: 'float 3s ease-in-out infinite 2s' }}>O</div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-linear-to-br from-blue-500 to-blue-600" style={{ animation: 'float 3s ease-in-out infinite 1s' }}>C</div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-linear-to-br from-red-500 to-red-600" style={{ animation: 'float 3s ease-in-out infinite 0s' }}>E</div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-linear-to-br from-emerald-500 to-emerald-600" style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}>A</div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-linear-to-br from-amber-500 to-amber-600" style={{ animation: 'float 3s ease-in-out infinite 1.5s' }}>N</div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className={`py-16 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto px-8">
          <h2 className={`text-3xl font-bold text-center mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>About This Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`rounded-2xl p-7 text-center transition-all hover:-translate-y-2 hover:shadow-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Big Five Model</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                The Big Five personality traits, also known as OCEAN, is the most widely 
                accepted model in personality psychology. It measures five core dimensions: 
                Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.
              </p>
            </div>
            <div className={`rounded-2xl p-7 text-center transition-all hover:-translate-y-2 hover:shadow-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <div className="text-4xl mb-4">🔬</div>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>IPIP-50 Scale</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                We use the International Personality Item Pool (IPIP-50), a scientifically 
                validated 50-item questionnaire that provides reliable personality assessment 
                based on decades of psychological research.
              </p>
            </div>
            <div className={`rounded-2xl p-7 text-center transition-all hover:-translate-y-2 hover:shadow-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <div className="text-4xl mb-4">🧩</div>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>OWL Ontology</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                This project implements Knowledge Representation and Reasoning (KRR) using 
                OWL (Web Ontology Language) to model personality traits, questions, and 
                scoring algorithms in a semantic knowledge base.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Traits Section */}
      <section className={`py-16 ${isDark ? 'bg-slate-900' : 'bg-linear-to-b from-slate-100 to-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-8">
          <h2 className={`text-3xl font-bold text-center mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>The Five Personality Dimensions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            <div className={`rounded-2xl p-6 text-center shadow-md border-t-4 border-red-500 transition-all hover:-translate-y-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">E</div>
              <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Extraversion</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Energy, positive emotions, sociability, and the tendency to seek stimulation.</p>
            </div>
            <div className={`rounded-2xl p-6 text-center shadow-md border-t-4 border-emerald-500 transition-all hover:-translate-y-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">A</div>
              <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Agreeableness</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tendency to be compassionate and cooperative rather than suspicious.</p>
            </div>
            <div className={`rounded-2xl p-6 text-center shadow-md border-t-4 border-blue-500 transition-all hover:-translate-y-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">C</div>
              <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Conscientiousness</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Self-discipline, carefulness, and preference for planned behavior.</p>
            </div>
            <div className={`rounded-2xl p-6 text-center shadow-md border-t-4 border-amber-500 transition-all hover:-translate-y-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">N</div>
              <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Neuroticism</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tendency to experience unpleasant emotions like anger and anxiety.</p>
            </div>
            <div className={`rounded-2xl p-6 text-center shadow-md border-t-4 border-purple-500 transition-all hover:-translate-y-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">O</div>
              <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Openness</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Appreciation for art, emotion, adventure, and intellectual curiosity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className={`py-16 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto px-8">
          <h2 className={`text-3xl font-bold text-center mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>Our Team</h2>
          
          {/* Supervisor */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-linear-to-r from-slate-900 to-blue-900 rounded-2xl p-8 mb-12 text-white">
            <div className="text-6xl bg-white/10 p-6 rounded-full">👨‍🏫</div>
            <div className="text-center md:text-left">
              <span className="bg-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">Project Supervisor</span>
              <h3 className="text-2xl font-bold mt-3 mb-1">Dr. Muhammad Rafi</h3>
              <p className="text-white/70 mb-3">Department of Computer Science</p>
              <p className="text-white/80 text-sm leading-relaxed max-w-lg">
                Expert in Knowledge Representation, Semantic Web Technologies, and Artificial Intelligence. 
                Guiding this project to bridge the gap between psychological assessment and modern AI techniques.
              </p>
            </div>
          </div>

          {/* Developers */}
          <h3 className={`text-xl font-semibold text-center mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Development Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {developers.map((dev, index) => (
              <div key={index} className={`rounded-2xl p-7 text-center transition-all hover:-translate-y-2 hover:shadow-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-5xl mb-4">{dev.avatar}</div>
                <h4 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{dev.name}</h4>
                <span className="inline-block bg-linear-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">{dev.role}</span>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{dev.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="assessment" className="bg-linear-to-br from-slate-900 via-blue-900 to-cyan-900 text-center py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Discover Your Personality?</h2>
          <p className="text-white/80 text-lg max-w-lg mx-auto mb-8">Take the scientifically validated Big Five assessment and gain insights into your personality traits.</p>
          <button 
            className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/40 group"
            onClick={onStartAssessment}
          >
            Start Assessment Now
            <span className="text-2xl transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-center px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/60 text-sm mb-2">&copy; {new Date().getFullYear()} Big Five Personality Assessment. International Personality Item Pool guidelines.</p>
          <p className="text-white/40 text-xs">Built with ❤️ by Abdul Rahman Azam</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
