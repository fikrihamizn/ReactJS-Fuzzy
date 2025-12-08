// --- SERVICE LOGIC (FASTAPI INTEGRATION) ---
// Base URL for the FastAPI backend, assuming it runs on localhost:8000
const MOCK_API_BASE = 'http://127.0.0.1:8000/docs#';

/**
 * Calls the FastAPI /evaluate endpoint to run the Fuzzy Logic system.
 * @param {object} inputs - { attendance, test_score, assignment_score }
 */
export const callEvaluate = async (inputs) => {
    const response = await fetch(`${MOCK_API_BASE}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Evaluation failed with status: ${response.status}`);
    }
    return response.json();
};

/**
 * Calls the FastAPI /suggestion endpoint to get AI feedback.
 * @param {object} inputs - { attendance, test_score, assignment_score }
 */
export const callGetSuggestion = async (inputs) => {
    const response = await fetch(`${MOCK_API_BASE}/suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Suggestion failed with status: ${response.status}`);
    }
    return response.json();
};

/**
 * Calls the FastAPI /chat endpoint to talk to the Lecturer LLM.
 * @param {object} payload - { student_performance_level, question, history }
 */
export const callChatWithLecturer = async (payload) => {
    const response = await fetch(`${MOCK_API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Chat failed with status: ${response.status}`);
    }
    return response.json();
};

/**
 * Triggers the FastAPI /report/download endpoint (GET request).
 * @param {object} inputs - { attendance, test_score, assignment_score }
 */
export const callDownloadReport = (inputs) => {
    const params = new URLSearchParams(inputs).toString();
    // This uses window.open to initiate a file download in a new tab/window
    window.open(`${MOCK_API_BASE}/report/download?${params}`, '_blank');
};