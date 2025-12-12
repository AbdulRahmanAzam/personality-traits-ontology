import './LandingPage.css';

const developers = [
  {
    name: 'Developer 1',
    role: 'Frontend Developer',
    description: 'Specializes in React.js and UI/UX design for interactive web applications.',
    avatar: '👨‍💻'
  },
  {
    name: 'Developer 2',
    role: 'Backend Developer',
    description: 'Expert in Python, OWL ontologies, and knowledge representation systems.',
    avatar: '👩‍💻'
  },
  {
    name: 'Developer 3',
    role: 'Full Stack Developer',
    description: 'Handles integration, testing, and deployment of the complete system.',
    avatar: '🧑‍💻'
  }
];

function LandingPage({ onStartAssessment, isApiReady, apiError }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero-section">
        <nav className="navbar">
          <div className="nav-logo">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">Big Five Assessment</span>
          </div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#team">Team</a>
            <a href="#assessment">Assessment</a>
          </div>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">
            Discover Your <span className="highlight">Personality</span>
          </h1>
          <p className="hero-subtitle">
            A scientifically validated Big Five Personality Assessment powered by 
            Knowledge Representation and Reasoning using OWL Ontology
          </p>
          <div className="hero-badges">
            <span className="badge">IPIP-50 Scale</span>
            <span className="badge">50 Questions</span>
            <span className="badge">~15 Minutes</span>
            <span className={`badge api-status ${isApiReady ? 'connected' : 'disconnected'}`}>
              {isApiReady ? '✓ API Connected' : '⚠ API Offline'}
            </span>
          </div>
          {apiError && (
            <div className="api-error-banner">
              <p>⚠️ {apiError}</p>
              <p className="api-hint">Run: <code>cd backend && uvicorn api:app --reload</code></p>
            </div>
          )}
          <button 
            className="cta-button" 
            onClick={onStartAssessment}
            disabled={!isApiReady}
          >
            {isApiReady ? 'Take the Assessment' : 'Waiting for API...'}
            <span className="arrow">→</span>
          </button>
        </div>

        <div className="hero-visual">
          <div className="trait-circle openness">O</div>
          <div className="trait-circle conscientiousness">C</div>
          <div className="trait-circle extraversion">E</div>
          <div className="trait-circle agreeableness">A</div>
          <div className="trait-circle neuroticism">N</div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <h2 className="section-title">About This Project</h2>
          <div className="about-content">
            <div className="about-card">
              <div className="about-icon">📊</div>
              <h3>Big Five Model</h3>
              <p>
                The Big Five personality traits, also known as OCEAN, is the most widely 
                accepted model in personality psychology. It measures five core dimensions: 
                Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.
              </p>
            </div>
            <div className="about-card">
              <div className="about-icon">🔬</div>
              <h3>IPIP-50 Scale</h3>
              <p>
                We use the International Personality Item Pool (IPIP-50), a scientifically 
                validated 50-item questionnaire that provides reliable personality assessment 
                based on decades of psychological research.
              </p>
            </div>
            <div className="about-card">
              <div className="about-icon">🧩</div>
              <h3>OWL Ontology</h3>
              <p>
                This project implements Knowledge Representation and Reasoning (KRR) using 
                OWL (Web Ontology Language) to model personality traits, questions, and 
                scoring algorithms in a semantic knowledge base.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Traits Section */}
      <section className="traits-section">
        <div className="section-container">
          <h2 className="section-title">The Five Personality Dimensions</h2>
          <div className="traits-grid">
            <div className="trait-card extraversion">
              <div className="trait-letter">E</div>
              <h3>Extraversion</h3>
              <p>Energy, positive emotions, sociability, and the tendency to seek stimulation.</p>
            </div>
            <div className="trait-card agreeableness">
              <div className="trait-letter">A</div>
              <h3>Agreeableness</h3>
              <p>Tendency to be compassionate and cooperative rather than suspicious.</p>
            </div>
            <div className="trait-card conscientiousness">
              <div className="trait-letter">C</div>
              <h3>Conscientiousness</h3>
              <p>Self-discipline, carefulness, and preference for planned behavior.</p>
            </div>
            <div className="trait-card neuroticism">
              <div className="trait-letter">N</div>
              <h3>Neuroticism</h3>
              <p>Tendency to experience unpleasant emotions like anger and anxiety.</p>
            </div>
            <div className="trait-card openness">
              <div className="trait-letter">O</div>
              <h3>Openness</h3>
              <p>Appreciation for art, emotion, adventure, and intellectual curiosity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="section-container">
          <h2 className="section-title">Our Team</h2>
          
          {/* Supervisor */}
          <div className="supervisor-card">
            <div className="supervisor-avatar">👨‍🏫</div>
            <div className="supervisor-info">
              <span className="supervisor-label">Project Supervisor</span>
              <h3 className="supervisor-name">Dr. Muhammad Rafi</h3>
              <p className="supervisor-title">Department of Computer Science</p>
              <p className="supervisor-desc">
                Expert in Knowledge Representation, Semantic Web Technologies, and Artificial Intelligence. 
                Guiding this project to bridge the gap between psychological assessment and modern AI techniques.
              </p>
            </div>
          </div>

          {/* Developers */}
          <h3 className="developers-heading">Development Team</h3>
          <div className="developers-grid">
            {developers.map((dev, index) => (
              <div key={index} className="developer-card">
                <div className="developer-avatar">{dev.avatar}</div>
                <h4 className="developer-name">{dev.name}</h4>
                <span className="developer-role">{dev.role}</span>
                <p className="developer-desc">{dev.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="assessment" className="cta-section">
        <div className="section-container">
          <h2>Ready to Discover Your Personality?</h2>
          <p>Take the scientifically validated Big Five assessment and gain insights into your personality traits.</p>
          <button className="cta-button large" onClick={onStartAssessment}>
            Start Assessment Now
            <span className="arrow">→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🧠</span>
            <span>Big Five Personality Assessment</span>
          </div>
          <p className="footer-text">
            A Knowledge Representation and Reasoning (KRR) Project
          </p>
          <p className="footer-copyright">
            © 2025 All Rights Reserved | Supervised by Dr. Muhammad Rafi
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
