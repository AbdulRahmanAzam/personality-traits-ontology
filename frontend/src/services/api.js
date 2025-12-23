// API service for Big Five Personality Assessment

// const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL = 'https://scoremebackend.abdulrahmanazam.me/api';
// Base root (without trailing /api)
const API_ROOT = API_BASE_URL.replace(/\/api\/?$/i, '');

// Enable for debugging (set to false in production)
const DEBUG = false;
const log = (...args) => DEBUG && console.log('[API]', ...args);

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  log(options.method || 'GET', url);
  
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${text}`);
    }
    
    return JSON.parse(text);
  } catch (err) {
    log('Error:', err.message);
    throw err;
  }
}

/**
 * Fetch all questions and Likert options from the ontology
 */
export async function fetchQuestions() {
  return apiFetch('/questions');
}

/**
 * Fetch Likert scale options
 */
export async function fetchLikertOptions() {
  return apiFetch('/likert-options');
}

/**
 * Fetch trait information
 */
export async function fetchTraits() {
  return apiFetch('/traits');
}

/**
 * Submit assessment responses and get results
 * @param {Object} data - { responses: {questionId: score}, userData: {}, timestamps: {} }
 */
export async function submitAssessment(data) {
  return apiFetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Get assessment results by ID
 */
export async function getAssessmentById(assessmentId) {
  return apiFetch(`/results/${assessmentId}`);
}

/**
 * Get all assessment results (admin)
 */
export async function getAllAssessments(limit = 100, skip = 0) {
  return apiFetch(`/results?limit=${limit}&skip=${skip}`);
}

/**
 * Get aggregate statistics
 */
export async function getAssessmentStats() {
  return apiFetch('/stats');
}

/**
 * Check if API is running
 */
export async function checkApiHealth() {
  try {
    const data = await apiFetch('/health');
    return data.ontology === 'loaded';
  } catch {
    return false;
  }
}
