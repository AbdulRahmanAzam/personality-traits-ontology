import { useState } from 'react';
import { countries } from '../data/questions';
import './WelcomeForm.css';

function WelcomeForm({ onStart }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    country: '',
    university: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 13 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age (13-120)';
    }
    if (!formData.country) newErrors.country = 'Please select your country';
    if (!formData.university.trim()) newErrors.university = 'University name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onStart({
        ...formData,
        age: parseInt(formData.age)
      });
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-header">
          <div className="logo-icon">🧠</div>
          <h1>Big Five Personality Assessment</h1>
          <p className="subtitle">IPIP-50 Scale</p>
        </div>
        
        <div className="welcome-intro">
          <p>
            Welcome to the Big Five Personality Assessment based on the International 
            Personality Item Pool (IPIP-50). This scientifically validated questionnaire 
            measures five major dimensions of personality:
          </p>
          <div className="traits-preview">
            <span className="trait-badge extraversion">Extraversion</span>
            <span className="trait-badge agreeableness">Agreeableness</span>
            <span className="trait-badge conscientiousness">Conscientiousness</span>
            <span className="trait-badge neuroticism">Neuroticism</span>
            <span className="trait-badge openness">Openness</span>
          </div>
          <p className="time-estimate">
            <span className="icon">⏱️</span>
            Estimated time: 10-15 minutes (50 questions)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="welcome-form">
          <h2>Please provide your information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Your age"
                min="13"
                max="120"
                className={errors.age ? 'error' : ''}
              />
              {errors.age && <span className="error-message">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={errors.country ? 'error' : ''}
              >
                <option value="">Select your country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="university">University / Institution</label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="Enter your university or institution name"
              className={errors.university ? 'error' : ''}
            />
            {errors.university && <span className="error-message">{errors.university}</span>}
          </div>

          <button type="submit" className="start-button">
            <span>Start Assessment</span>
            <span className="arrow">→</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default WelcomeForm;
