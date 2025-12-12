// API service for Big Five Personality Assessment

// const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL = 'https://scoremebackend.abdulrahmanazam.me/api';
// Base root (without trailing /api)
const API_ROOT = API_BASE_URL.replace(/\/api\/?$/i, '');

/**
 * Fetch all questions and Likert options from the ontology
 */
export async function fetchQuestions() {
  const url = `${API_BASE_URL}/questions`;
  console.log('API: GET', url);
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log('API response (questions):', response.status, text);
    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.status}`);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('fetchQuestions error:', err);
    throw err;
  }
}

/**
 * Fetch Likert scale options
 */
export async function fetchLikertOptions() {
  const url = `${API_BASE_URL}/likert-options`;
  console.log('API: GET', url);
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log('API response (likert-options):', response.status, text);
    if (!response.ok) {
      throw new Error(`Failed to fetch likert options: ${response.status}`);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('fetchLikertOptions error:', err);
    throw err;
  }
}

/**
 * Fetch trait information
 */
export async function fetchTraits() {
  const url = `${API_BASE_URL}/traits`;
  console.log('API: GET', url);
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log('API response (traits):', response.status, text);
    if (!response.ok) {
      throw new Error(`Failed to fetch traits: ${response.status}`);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('fetchTraits error:', err);
    throw err;
  }
}

/**
 * Submit assessment responses and get results
 * @param {Object} data - { responses: {questionId: score}, userData: {} }
 */
export async function submitAssessment(data) {
  const url = `${API_BASE_URL}/submit`;
  console.log('API: POST', url, data);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const text = await response.text();
    console.log('API response (submit):', response.status, text);
    if (!response.ok) {
      throw new Error(`Failed to submit assessment: ${response.status}`);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('submitAssessment error:', err);
    throw err;
  }
}

/**
 * Check if API is running
 */
export async function checkApiHealth() {
  try {
    const url = `${API_ROOT}/`;
    console.log('API health-check:', url);
    const response = await fetch(url);
    console.log('API health status:', response.status);
    return response.ok;
  } catch {
    return false;
  }
}
