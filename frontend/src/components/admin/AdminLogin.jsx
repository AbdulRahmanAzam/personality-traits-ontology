import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function AdminLogin({ onLogin, isDark }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': password
        }
      });

      if (response.ok) {
        // Store the token securely in session storage (not localStorage for security)
        sessionStorage.setItem('adminToken', password);
        onLogin(true);
      } else {
        const data = await response.json();
        setError(data.detail || 'Invalid credentials');
      }
    } catch {
      setError('Connection failed. Please check if the server is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 shadow-xl max-w-md w-full mx-4`}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Access</h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mt-2`}>Enter administrator password to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-800'} focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 transition-all`}
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 px-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Verifying...
              </span>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <a href="/" className="hover:text-cyan-500 transition-colors">← Back to Assessment</a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
