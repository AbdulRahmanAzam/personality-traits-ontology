// API service for Big Five Personality Assessment

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Fetch all questions and Likert options from the ontology
 */
export async function fetchQuestions() {
  const response = await fetch(`${API_BASE_URL}/questions`);
  if (!response.ok) {
    throw new Error('Failed to fetch questions from API');
  }
  return response.json();
}

/**
 * Fetch Likert scale options
 */
export async function fetchLikertOptions() {
  const response = await fetch(`${API_BASE_URL}/likert-options`);
  if (!response.ok) {
    throw new Error('Failed to fetch Likert options from API');
  }
  return response.json();
}

/**
 * Fetch trait information
 */
export async function fetchTraits() {
  const response = await fetch(`${API_BASE_URL}/traits`);
  if (!response.ok) {
    throw new Error('Failed to fetch traits from API');
  }
  return response.json();
}

/**
 * Submit assessment responses and get results
 * @param {Object} data - { responses: {questionId: score}, userData: {} }
 */
export async function submitAssessment(data) {
  const response = await fetch(`${API_BASE_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to submit assessment');
  }
  return response.json();
}

/**
 * Check if API is running
 */
export async function checkApiHealth() {
  try {
    const response = await fetch('http://localhost:8000/');
    return response.ok;
  } catch {
    return false;
  }
}
