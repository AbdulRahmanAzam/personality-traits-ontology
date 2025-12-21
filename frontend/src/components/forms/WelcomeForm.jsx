import { useState } from 'react';

const countries = [
  "Afghanistan", "Australia",
  "France", "Germany", "Greece", "Saudi Arabia",
    "Pakistan", "Poland",
  "Qatar", "South Africa",
  "UAE", "Ukraine", "United Kingdom", "United States", "Other"
];

export function WelcomeForm({ onStart }) {
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
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      <div className="bg-white rounded-3xl p-12 pt-5 max-w-xl w-full shadow-2xl" style={{ animation: 'slideUp 0.6s ease-out' }}>
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Big Five Personality Assessment</h1>
          <p className="text-slate-500 text-base mt-1">IPIP-50 Scale</p>
        </div>
        
        <div className="bg-slate-50 rounded-2xl p-5 mb-5">
          <p className="text-slate-600 leading-relaxed mb-3">
            Welcome to the Big Five Personality Assessment based on the International 
            Personality Item Pool (IPIP-50). This scientifically validated questionnaire 
            measures five major dimensions of personality:
          </p>
          <div className="flex flex-wrap gap-2 my-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-600">Extraversion</span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-600">Agreeableness</span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-600">Conscientiousness</span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-600">Neuroticism</span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-100 text-purple-600">Openness</span>
          </div>
          <p className="flex items-center gap-2 text-slate-500 text-sm m-0">
            <span className="text-xl">⏱️</span>
            Estimated time: 10-15 minutes (50 questions)
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Please provide your information</h2>
          
          <div className="mb-3">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 border-2 rounded-xl text-base text-slate-800 bg-white transition-all focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.name && <span className="block text-red-500 text-xs mt-1.5">{errors.name}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-2">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Your age"
                min="13"
                max="120"
                className={`w-full px-4 py-3 border-2 rounded-xl text-base text-slate-800 bg-white transition-all focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 ${errors.age ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.age && <span className="block text-red-500 text-xs mt-1.5">{errors.age}</span>}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl text-base text-slate-800 bg-white transition-all focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 ${errors.country ? 'border-red-500' : 'border-slate-200'}`}
              >
                <option value="">Select your country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && <span className="block text-red-500 text-xs mt-1.5">{errors.country}</span>}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="university" className="block text-sm font-medium text-slate-700 mb-2">University / Institution</label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="Enter your university or institution name"
              className={`w-full px-4 py-3 border-2 rounded-xl text-base text-slate-800 bg-white transition-all focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 ${errors.university ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.university && <span className="block text-red-500 text-xs mt-1.5">{errors.university}</span>}
          </div>

          <button 
            type="submit" 
            className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-lg font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all mt-6 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/40 group"
          >
            <span>Start Assessment</span>
            <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </button>
        </form>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
          <span className="text-2xl">🔒</span>
          <p className="text-slate-500 text-xs m-0">
            Your responses are confidential and will only be used for assessment purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeForm;
