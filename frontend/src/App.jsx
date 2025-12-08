import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, BarChart3, Bot, Send, Download, RefreshCw, Loader2, MessageSquare } from 'lucide-react';

// --- SERVICE LOGIC (FASTAPI INTEGRATION - Integrated into this file) ---
const MOCK_API_BASE = 'http://localhost:8000/api/v1';

/**
 * Calls the FastAPI /evaluate endpoint to run the Fuzzy Logic system.
 */
const callEvaluate = async (inputs) => {
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
 */
const callGetSuggestion = async (inputs) => {
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
 */
const callChatWithLecturer = async (payload) => {
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
 */
const callDownloadReport = (inputs) => {
    const params = new URLSearchParams(inputs).toString();
    // This uses window.open to initiate a file download in a new tab/window
    window.open(`${MOCK_API_BASE}/report/download?${params}`, '_blank');
};


// --- Global Constants (for colors in JS) ---
const PRIMARY_COLOR = '#BC6FF1';
const SECONDARY_COLOR = '#892CDC';
const DARK_ACCENT = '#52057B';


// --- HOMEPAGE COMPONENTS ---

const FlipText = ({ words }) => {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            const fadeTimeout = setTimeout(() => {
                setIndex((prevIndex) => (prevIndex + 1) % words.length);
                setFade(true);
            }, 3000); 

            return () => clearTimeout(fadeTimeout);
        }, 3500); // Total cycle time

        return () => clearInterval(interval);
    }, [words.length]);

    const displayWord = words[index];
    const fadeClass = fade ? 'flip-text-fade-in' : 'flip-text-fade-out';

    return (
        <span className={`flip-text-word ${fadeClass}`} style={{ color: PRIMARY_COLOR }}>
            {displayWord}
        </span>
    );
};

// --- EVALUATION COMPONENTS ---

const InputSlider = ({ label, value, onChange, name }) => (
    <div className="input-slider-container">
        <label htmlFor={name} className="input-slider-label">
            {label}
            <span className="input-slider-value">{value}%</span>
        </label>
        <input
            type="range"
            id={name}
            name={name}
            min="0"
            max="100"
            step="1"
            value={value}
            onChange={onChange}
            className="input-slider"
            // Dynamic background fill for interactivity (must be inline)
            style={{
                background: `linear-gradient(to right, ${PRIMARY_COLOR} 0%, ${PRIMARY_COLOR} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
            }}
        />
    </div>
);

const EvaluationForm = ({ onEvaluate, isLoading, inputs, setInputs }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onEvaluate(inputs);
    };

    return (
        <div className="card-base form-card">
            <h2 className="font-bold card-title" style={{ color: 'black', display: 'flex', alignItems: 'center' }}>
                <BarChart3 style={{ width: '24px', height: '24px', marginRight: '8px', color: SECONDARY_COLOR }} />
                Fuzzy Logic Evaluation
            </h2>
            <form onSubmit={handleSubmit}>
                <InputSlider
                    label="Attendance Percentage"
                    name="attendance"
                    value={inputs.attendance}
                    onChange={handleChange}
                />
                <InputSlider
                    label="Test Score Percentage"
                    name="test_score"
                    value={inputs.test_score}
                    onChange={handleChange}
                />
                <InputSlider
                    label="Assignment Score Percentage"
                    name="assignment_score"
                    value={inputs.assignment_score}
                    onChange={handleChange}
                />
                <button
                    type="submit"
                    className="submit-button font-semibold"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 style={{ width: '20px', height: '20px', marginRight: '8px' }} className="animate-spin" /> Calculating...
                        </>
                    ) : (
                        "Run Fuzzy Evaluation"
                    )}
                </button>
            </form>
        </div>
    );
};

const ResultsDisplay = ({ result, onGetSuggestion, onDownloadReport, isLoading, evaluationInputs }) => {
    const getLevelClass = (level) => {
        switch (level) {
            case 'Excellent': return 'level-excellent';
            case 'Good': return 'level-good';
            case 'Average': return 'level-average';
            case 'Weak': return 'level-weak';
            default: return 'level-default';
        }
    };

    if (!result) return <div className="card-base text-center result-placeholder">Enter scores and run evaluation to see results.</div>;

    return (
        <div className="card-base results-card">
            <h3 className="font-bold card-title" style={{ color: 'black', display: 'flex', alignItems: 'center' }}>
                <BarChart3 style={{ width: '24px', height: '24px', marginRight: '8px', color: PRIMARY_COLOR }} />
                Evaluation Result
            </h3>

            <div className={`level-badge ${getLevelClass(result.performance_level)}`}>
                Level: {result.performance_level}
            </div>

            <div className="results-grid">
                <div className="result-item">
                    <p className="result-label">Fuzzy Score (0-100)</p>
                    <p className="result-value font-black" style={{ color: DARK_ACCENT }}>{result.fuzzy_score}</p>
                </div>
                <div className="result-item">
                    <p className="result-label">Attendance</p>
                    <p className="result-value font-bold" style={{ fontSize: '1.25rem', color: '#1f2937' }}>{evaluationInputs.attendance}%</p>
                </div>
                <div className="result-item">
                    <p className="result-label">Test Score</p>
                    <p className="result-value font-bold" style={{ fontSize: '1.25rem', color: '#1f2937' }}>{evaluationInputs.test_score}%</p>
                </div>
                <div className="result-item">
                    <p className="result-label">Assignment Score</p>
                    <p className="result-value font-bold" style={{ fontSize: '1.25rem', color: '#1f2937' }}>{evaluationInputs.assignment_score}%</p>
                </div>
            </div>

            <div className="action-button-group">
                <button
                    onClick={onGetSuggestion}
                    className="ai-suggestion-button font-semibold"
                    disabled={isLoading.suggestion}
                >
                    {isLoading.suggestion ? (
                        <>
                            <Loader2 style={{ width: '20px', height: '20px', marginRight: '8px' }} className="animate-spin" /> Generating Suggestion...
                        </>
                    ) : (
                        <>
                            <Bot style={{ width: '20px', height: '20px', marginRight: '8px' }} /> Get AI Suggestion
                        </>
                    )}
                </button>
                <button
                    onClick={onDownloadReport}
                    className="report-button font-semibold"
                    disabled={isLoading.report}
                >
                    {isLoading.report ? (
                        <>
                            <Loader2 style={{ width: '20px', height: '20px', marginRight: '8px' }} className="animate-spin" /> Generating PDF...
                        </>
                    ) : (
                        <>
                            <Download style={{ width: '20px', height: '20px', marginRight: '8px' }} /> Download Full Report
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const SuggestionDisplay = ({ suggestionText, isLoading, error }) => {
    return (
        <div className="card-base suggestion-box flex-column full-height" style={{ padding: '24px' }}>
            <h3 className="font-bold suggestion-title" style={{ color: 'black', display: 'flex', alignItems: 'center' }}>
                <Bot style={{ width: '20px', height: '20px', marginRight: '8px', color: PRIMARY_COLOR }} />
                Personalized AI Suggestion
            </h3>
            <div className="suggestion-content">
                {isLoading ? (
                    <div className="flex-center full-height" style={{ color: '#6b7280' }}>
                        <Loader2 style={{ width: '20px', height: '20px', marginRight: '8px' }} className="animate-spin" />
                        AI is thinking...
                    </div>
                ) : error ? (
                    <p className="error-text">Error: {error}</p>
                ) : suggestionText ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{suggestionText}</p>
                ) : (
                    <p className="placeholder-text italic">Click 'Get AI Suggestion' to generate personalized feedback based on the Fuzzy Score.</p>
                )}
            </div>
        </div>
    );
};


// --- CHAT COMPONENTS ---

const ChatBox = ({ performanceLevel, evaluationInputs }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping || !performanceLevel) return;

        const userMessage = { role: 'user', content: input.trim() };
        const newHistory = [...messages, userMessage];
        setMessages(newHistory);
        setInput('');
        setIsTyping(true);

        const chatHistoryForAPI = newHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // --- CONTEXT ENHANCEMENT FIX ---
        // Concatenate scores into the user's question for context-aware LLM response
        const scoreContext = evaluationInputs ? 
            `My scores are: Attendance=${evaluationInputs.attendance}%, Test=${evaluationInputs.test_score}%, Assignment=${evaluationInputs.assignment_score}%. ` : '';
        
        const currentQuestionWithContext = `${scoreContext}${userMessage.content}`;
        // -------------------------------

        try {
            const payload = {
                student_performance_level: performanceLevel,
                question: currentQuestionWithContext, // Use the enriched prompt
                history: chatHistoryForAPI 
            };
            
            const response = await callChatWithLecturer(payload);
            
            if (response.status === 'success') {
                const assistantMessage = { role: 'assistant', content: response.answer };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                setMessages(prev => [...prev, { role: 'system', content: `Error: Could not get response.` }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'system', content: `API Error: ${error.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const ChatMessage = ({ message }) => {
        const isUser = message.role === 'user';
        const alignClass = isUser ? 'message-user' : 'message-assistant';
        const roleName = isUser ? 'You' : 'Lecturer Bot';

        return (
            <div className={`message-bubble ${alignClass}`}>
                <div className="message-role" style={{ color: isUser ? SECONDARY_COLOR : DARK_ACCENT }}>{roleName}</div>
                <div>{message.content}</div>
            </div>
        );
    };

    return (
        <div className="card-base chat-container full-height">
            <div className="chat-header" style={{ backgroundColor: DARK_ACCENT }}>
                <MessageSquare style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                Chat with Virtual Lecturer
            </div>
            <div className="chat-messages custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center" style={{ padding: '40px', color: '#6b7280', fontStyle: 'italic' }}>
                        Ask your lecturer about your evaluation results or suggestions.
                        <p style={{ marginTop: '8px', fontSize: '0.875rem' }}>Current Level: <span className="font-semibold" style={{ color: PRIMARY_COLOR }}>{performanceLevel || 'N/A'}</span></p>
                    </div>
                ) : (
                    messages.map((msg, index) => <ChatMessage key={index} message={msg} />)
                )}
                {isTyping && (
                    <div className="message-bubble message-assistant">
                        <div className="message-role" style={{ color: DARK_ACCENT }}>Lecturer Bot</div>
                        <span className="typing-indicator">
                            <span />
                            <span />
                            <span />
                        </span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} className="chat-footer">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={performanceLevel ? "Ask a question..." : "Run evaluation first to chat..."}
                    className="chat-input"
                    disabled={!performanceLevel || isTyping}
                    style={{ borderColor: PRIMARY_COLOR }}
                />
                <button
                    type="submit"
                    className="chat-action-button"
                    disabled={!performanceLevel || isTyping || !input.trim()}
                    style={{ backgroundColor: PRIMARY_COLOR }}
                >
                    <Send style={{ width: '20px', height: '20px' }} />
                </button>
                <button
                    type="button"
                    onClick={() => setMessages([])}
                    className="chat-clear-button"
                    title="Clear Chat"
                >
                    <RefreshCw style={{ width: '20px', height: '20px' }} />
                </button>
            </form>
        </div>
    );
};


// --- MAIN APP COMPONENT (Single Page Logic) ---

const App = () => {
    // Evaluation State
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [evaluationInputs, setEvaluationInputs] = useState({
        attendance: 80,
        test_score: 75,
        assignment_score: 90,
    });
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState({ evaluate: false, suggestion: false, report: false });
    const [error, setError] = useState(null);

    const handleEvaluate = useCallback(async (inputs) => {
        setError(null);
        setIsLoading(prev => ({ ...prev, evaluate: true }));
        setAiSuggestion('');

        try {
            const result = await callEvaluate(inputs);
            setEvaluationResult(result);
            setEvaluationInputs(inputs); 
        } catch (err) {
            setError(`Evaluation failed: ${err.message}`);
            console.error("Evaluation API Error:", err);
        } finally {
            setIsLoading(prev => ({ ...prev, evaluate: false }));
        }
    }, []);

    const handleGetSuggestion = useCallback(async () => {
        if (!evaluationInputs) return;
        
        setError(null);
        setIsLoading(prev => ({ ...prev, suggestion: true }));
        setAiSuggestion('');

        try {
            const response = await callGetSuggestion(evaluationInputs);
            setAiSuggestion(response.suggestion);
        } catch (err) {
            setError(`AI Suggestion failed: ${err.message}`);
            console.error("Suggestion API Error:", err);
        } finally {
            setIsLoading(prev => ({ ...prev, suggestion: false }));
        }
    }, [evaluationInputs]);

    const handleDownloadReport = useCallback(() => {
        if (!evaluationInputs) return;

        setIsLoading(prev => ({ ...prev, report: true }));
        try {
            callDownloadReport(evaluationInputs);
        } catch (err) {
            setError(`Report download failed: ${err.message}`);
            console.error("Report API Error:", err);
        } finally {
            setTimeout(() => setIsLoading(prev => ({ ...prev, report: false })), 1500);
        }
    }, [evaluationInputs]);

    const performanceLevel = evaluationResult?.performance_level || null;
    const words = ["Performance", "Future", "Potential", "Success"];

    // Function to handle scrolling to the evaluation section
    const scrollToEvaluation = () => {
        document.getElementById('evaluation-section').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="app-container">
            
            {/* 1. HOMEPAGE SECTION (Header) */}
            <div className="homepage-section">
                <div className="relative" style={{ zIndex: 10 }}>
                    <div className="text-center" style={{ maxWidth: '960px' }}>
                        <h1 className="homepage-title font-black">
                            Unlock Student <FlipText words={words} />
                        </h1>
                        <p className="homepage-subtitle font-light">
                            A cutting-edge evaluation system using **Fuzzy Logic** and **Local LLMs** to provide precise, personalized academic insights.
                        </p>
                        <button
                            onClick={scrollToEvaluation}
                            className="homepage-button font-bold"
                        >
                            <BarChart3 style={{ width: '20px', height: '20px', marginRight: '8px' }} /> Start Performance Evaluation
                        </button>
                    </div>
                </div>
                <div className="scroll-indicator" onClick={scrollToEvaluation}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px' }}>Scroll to Evaluate</span>
                    <ChevronDown style={{ width: '32px', height: '32px' }} />
                </div>
            </div>

            {/* 2. EVALUATION SECTION (Main Content) */}
            <div id="evaluation-section" className="evaluation-section">
                <div className="max-width-container">
                    <h2 className="page-title font-extrabold" style={{ color: DARK_ACCENT }}>
                        Student Performance Dashboard
                    </h2>

                    {error && (
                        <div className="card-base error-message-box" style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', fontWeight: '500', textAlign: 'center' }}>
                            <p>Connection Error: {error}</p>
                            <p className="error-message-detail">Ensure your FastAPI backend is running at <code>http://localhost:8000</code>.</p>
                        </div>
                    )}

                    {/* Evaluation Form and Results */}
                    <div className="main-grid-2-cols" style={{ marginBottom: '48px' }}>
                        <EvaluationForm
                            onEvaluate={handleEvaluate}
                            isLoading={isLoading.evaluate}
                            inputs={evaluationInputs}
                            setInputs={setEvaluationInputs}
                        />
                        <ResultsDisplay
                            result={evaluationResult}
                            evaluationInputs={evaluationInputs}
                            onGetSuggestion={handleGetSuggestion}
                            onDownloadReport={handleDownloadReport}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Suggestion and Chat */}
                    <div className="main-grid-5-cols chat-suggestion-area">
                        <div className="suggestion-container full-height">
                            <SuggestionDisplay
                                suggestionText={aiSuggestion}
                                isLoading={isLoading.suggestion}
                                error={error}
                            />
                        </div>
                        <div className="chat-container-wrapper full-height">
                            {/* Passing evaluationInputs to ChatBox */}
                            <ChatBox 
                                performanceLevel={performanceLevel} 
                                evaluationInputs={evaluationInputs}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default App;