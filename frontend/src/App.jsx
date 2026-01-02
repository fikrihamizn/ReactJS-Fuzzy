import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, BarChart3, Bot, Send, Download, RefreshCw, Loader2, MessageSquare, Settings2, GraduationCap, Brain, ShieldCheck, Clock, BookOpen, Sparkles, FileText, Activity } from 'lucide-react';
import FuzzyOutputGraph, { MembershipGraph, GRAPH_CONFIG } from "./ui/FuzzyGraph";
import ActiveRulesList from "./ui/ActiveRulesList";
import './App.css';

// --- SERVICE LOGIC (FASTAPI INTEGRATION) ---
const MOCK_API_BASE = 'http://localhost:8000/api/v1';

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

const callDownloadReport = (inputs) => {
    const params = new URLSearchParams(inputs).toString();
    window.open(`${MOCK_API_BASE}/report/download?${params}`, '_blank');
};

const PALETTE = {
    darkest: '#3c1361',
    dark:    '#52307c',
    medium:  '#7c5295',
    light:   '#bca0dc',
    white:   '#ffffff',
    error:   '#fee2e2',
    errorTx: '#991b1b'
};

// --- COMPONENTS ---

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
        }, 3500); 

        return () => clearInterval(interval);
    }, [words.length]);

    const displayWord = words[index];
    const fadeClass = fade ? 'flip-text-fade-in' : 'flip-text-fade-out';

    return <span className={`flip-text-word ${fadeClass}`}>{displayWord}</span>;
};

// UPDATED: Added 'icon' prop to render icons next to label
const InputSlider = ({ label, value, onChange, name, icon: Icon }) => (
    <div className="input-slider-container">
        <label htmlFor={name} className="input-slider-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {Icon && <Icon size={16} color={PALETTE.medium} />}
                {label}
            </span>
            <span className="input-slider-val">{value}%</span>
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
            style={{
                background: `linear-gradient(to right, ${PALETTE.medium} 0%, ${PALETTE.medium} ${value}%, ${PALETTE.light} ${value}%, ${PALETTE.light} 100%)`
            }}
        />
    </div>
);

const EvaluationForm = ({ onEvaluate, isLoading, inputs, setInputs, graphConfig }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onEvaluate(inputs);
    };

    const graphStyle = { 
        marginTop: 0, 
        borderTopLeftRadius: 0, 
        borderTopRightRadius: 0, 
        borderTop: 'none', 
        backgroundColor: PALETTE.dark, 
        padding: '16px', 
        marginBottom: 0,
        borderBottomLeftRadius: '12px', 
        borderBottomRightRadius: '12px'
    };

    return (
        <div>
            {/* UPDATED: Removed centering, title is now left-aligned */}
            <h2 className="font-bold card-title form-header" style={{ marginBottom: '32px' }}>
                <Settings2 style={{ width: '24px', height: '24px', marginRight: '12px' }} />
                Input Parameters
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="inputs-grid">
                    {/* UPDATED: Passed specific icons to each InputSlider */}
                    <div className="parameter-card">
                        <InputSlider label="Attendance" icon={Clock} name="attendance" value={inputs.attendance} onChange={handleChange} />
                        <MembershipGraph title="Attendance" value={inputs.attendance} config={graphConfig.attendance} style={graphStyle} />
                    </div>
                    <div className="parameter-card">
                        <InputSlider label="Test Score" icon={FileText} name="test_score" value={inputs.test_score} onChange={handleChange} />
                        <MembershipGraph title="Test Score" value={inputs.test_score} config={graphConfig.test} style={graphStyle} />
                    </div>
                    <div className="parameter-card">
                        <InputSlider label="Assignment" icon={BookOpen} name="assignment_score" value={inputs.assignment_score} onChange={handleChange} />
                        <MembershipGraph title="Assignment" value={inputs.assignment_score} config={graphConfig.assignment} style={graphStyle} />
                    </div>
                    <div className="parameter-card">
                        <InputSlider label="Ethics" icon={ShieldCheck} name="ethics" value={inputs.ethics} onChange={handleChange} />
                        <MembershipGraph title="Ethics" value={inputs.ethics} config={graphConfig.ethics} style={graphStyle} />
                    </div>
                    <div className="parameter-card">
                        <InputSlider label="Cognitive & Professionalism" icon={Brain} name="cognitive" value={inputs.cognitive} onChange={handleChange} />
                        <MembershipGraph title="Cognitive & Professionalism" value={inputs.cognitive} config={graphConfig.cognitive} style={graphStyle} />
                    </div>
                </div>

                <div className="submit-btn-container" style={{ marginTop: '32px' }}>
                    <button
                        type="submit"
                        className="submit-button font-semibold"
                        disabled={isLoading}
                        style={{ padding: '16px 64px', fontSize: '1.1rem', width: '100%' }}
                    >
                        {isLoading ? (
                            <> <Loader2 style={{ width: '24px', height: '24px', marginRight: '8px' }} className="animate-spin" /> Calculating... </>
                        ) : ( "Run Evaluation" )}
                    </button>
                </div>
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

    if (!result) return null;

    // Helper style for icon alignment in metrics
    const labelStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' };
    const iconSize = 14;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 className="font-bold card-title result-card-title" style={{ margin: 0 }}>
                    <BarChart3 style={{ width: '24px', height: '24px', marginRight: '8px', color: PALETTE.medium }} />
                    Evaluation Metrics
                </h3>
                <div className={`level-badge ${getLevelClass(result.performance_level)}`} style={{ marginBottom: 0 }}>
                    {result.performance_level}
                </div>
            </div>

            <div className="results-metrics-grid">
                {/* UPDATED: Added icons to all metric labels */}
                <div className="metric-item">
                    <p className="metric-label" style={labelStyle}><Activity size={iconSize}/> Fuzzy Score</p>
                    <p className="metric-value font-bold">{result.fuzzy_score}</p>
                </div>
                <div className="metric-item">
                    <p className="metric-label" style={labelStyle}><Clock size={iconSize}/> Attendance</p>
                    <p className="metric-value font-bold">{evaluationInputs.attendance}%</p>
                </div>
                <div className="metric-item">
                    <p className="metric-label" style={labelStyle}><FileText size={iconSize}/> Test</p>
                    <p className="metric-value font-bold">{evaluationInputs.test_score}%</p>
                </div>
                <div className="metric-item">
                    <p className="metric-label" style={labelStyle}><BookOpen size={iconSize}/> Assignment</p>
                    <p className="metric-value font-bold">{evaluationInputs.assignment_score}%</p>
                </div>
                <div className="metric-item">
                    <p className="metric-label" style={labelStyle}><ShieldCheck size={iconSize}/> Ethics</p>
                    <p className="metric-value font-bold">{evaluationInputs.ethics}%</p>
                </div>
                <div className="metric-item">
                    <p className="metric-label" style={labelStyle}><Brain size={iconSize}/> Cognitive & Professionalism</p>
                    <p className="metric-value font-bold">{evaluationInputs.cognitive}%</p>
                </div>
            </div>

            <div className="action-buttons">
                <button onClick={onGetSuggestion} className="ai-suggest-btn font-semibold" disabled={isLoading.suggestion}>
                    {isLoading.suggestion ? <><Loader2 className="animate-spin" style={{marginRight:'8px'}}/> AI Thinking...</> : <><Bot style={{marginRight:'8px'}}/> AI Suggestion</>}
                </button>
                <button onClick={onDownloadReport} className="download-report-btn font-semibold" disabled={isLoading.report}>
                    {isLoading.report ? <><Loader2 className="animate-spin" style={{marginRight:'8px'}}/> Generating...</> : <><Download style={{marginRight:'8px'}}/> PDF Report</>}
                </button>
            </div>
        </div>
    );
};

const SuggestionDisplay = ({ suggestionText, isLoading, error }) => {
    return (
        <div className="card-base suggestion-box">
            {/* 1. Title Box (Header) */}
            <div className="suggestion-header">
                <Bot style={{ width: '20px', height: '20px', marginRight: '8px', color: PALETTE.light }} />
                Personalized AI Suggestion
            </div>

            {/* 2. Text Box (Content) */}
            <div className="suggestion-content custom-scrollbar">
                {isLoading ? (
                    <div className="flex-center full-height" style={{ color: PALETTE.dark, flexDirection: 'column' }}>
                        <Loader2 style={{ width: '24px', height: '24px', marginBottom: '12px' }} className="animate-spin" />
                        <p>Analyzing Fuzzy Score...</p>
                    </div>
                ) : error ? (
                    <p className="error-text" style={{ color: PALETTE.errorTx }}>Error: {error}</p>
                ) : suggestionText ? (
                    <p className="suggestion-text">{suggestionText}</p>
                ) : (
                    <div className="flex-center full-height" style={{ flexDirection: 'column', opacity: 0.5 }}>
                        <Bot size={48} style={{ marginBottom: '16px' }} />
                        <p className="placeholder-text" style={{ marginTop: 0 }}>
                            Click 'AI Suggestion' to generate personalized feedback.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatBox = ({ performanceLevel, evaluationInputs }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        if (messages.length > 0 || isTyping) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
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

        const scoreContext = evaluationInputs ? 
            `My scores are: Attendance=${evaluationInputs.attendance}%, Test=${evaluationInputs.test_score}%, Assignment=${evaluationInputs.assignment_score}%. ` : '';
        
        const currentQuestionWithContext = `${scoreContext}${userMessage.content}`;

        try {
            const payload = {
                student_performance_level: performanceLevel,
                question: currentQuestionWithContext, 
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
                <div className="message-role" style={{ color: isUser ? PALETTE.dark : PALETTE.darkest }}>{roleName}</div>
                <div style={{ color: PALETTE.darkest }}>{message.content}</div>
            </div>
        );
    };

    return (
        <div className="card-base chat-container">
            <div className="chat-header">
                <MessageSquare style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                Chat with Virtual Lecturer
            </div>
            <div className="chat-messages custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center" style={{ padding: '40px', color: PALETTE.dark, fontStyle: 'italic' }}>
                        Ask your lecturer about your evaluation results or suggestions.
                        <p style={{ marginTop: '8px', fontSize: '0.875rem' }}>Current Level: <span className="font-semibold" style={{ color: PALETTE.medium }}>{performanceLevel || 'N/A'}</span></p>
                    </div>
                ) : (
                    messages.map((msg, index) => <ChatMessage key={index} message={msg} />)
                )}
                {isTyping && (
                    <div className="message-bubble message-assistant">
                        <div className="message-role" style={{ color: PALETTE.darkest }}>Lecturer Bot</div>
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
                />
                <button
                    type="submit"
                    className="chat-action-button"
                    disabled={!performanceLevel || isTyping || !input.trim()}
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


// --- MAIN APP COMPONENT ---

const App = () => {
    // State
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [hasRunEvaluation, setHasRunEvaluation] = useState(false);
    const [evaluationInputs, setEvaluationInputs] = useState({
        attendance: 80,
        test_score: 75,
        assignment_score: 90,
        ethics: 85,
        cognitive: 70
    });
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState({ evaluate: false, suggestion: false, report: false });
    const [error, setError] = useState(null);

    const rightPanelRef = React.useRef(null);
    const suggestionRef = React.useRef(null);

    const handleEvaluate = useCallback(async (inputs) => {
        setError(null);
        setIsLoading(prev => ({ ...prev, evaluate: true }));
        setAiSuggestion('');
        
        try {
            // 1. Call API (Remote) - Logic is now entirely on backend
            const result = await callEvaluate(inputs); 
            
            setEvaluationResult(result);
            setEvaluationInputs(inputs);
            setHasRunEvaluation(true);

            setTimeout(() => {
                rightPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (err) {
            console.error("CRITICAL ERROR:", err);
            setError(`Evaluation failed: ${err.message}`);
        } finally {
            setIsLoading(prev => ({ ...prev, evaluate: false }));
        }
    }, []);

    const handleGetSuggestion = useCallback(async () => {
        if (!evaluationInputs) return;
        
        setTimeout(() => {
            suggestionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

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

    const scrollToEvaluation = () => {
        document.getElementById('evaluation-section').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="app-container">                
            
            {/* 1. HOMEPAGE HERO */}
            <div className="homepage-section">
                
                <div className="bg-pattern"></div>

                <div className="max-width-container">
                    
                    {/* LEFT SIDE: Text & CTA */}
                    <div style={{ textAlign: 'left' }}>
                        <div className="pill-badge">
                            <Sparkles size={16} style={{ color: PALETTE.light, marginRight: '8px' }} />
                            <span className="pill-text">AI-POWERED FUZZY LOGIC</span>
                        </div>
                        
                        <h1 className="hero-title font-black">
                            Unlock Student <br />
                            <FlipText words={words} />
                        </h1>
                        
                        <p className="hero-subtitle font-light">
                            Go beyond simple grades. Evaluate <strong>Cognitive</strong>, <strong>Ethical</strong>, and <strong>Academic</strong> traits to reveal the true potential of every student.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <button 
                                onClick={scrollToEvaluation} 
                                className="homepage-button font-bold" 
                            >
                                <BarChart3 style={{ width: '20px', height: '20px', marginRight: '8px' }} /> 
                                Start Evaluation
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Visual Composition */}
                    <div className="visual-container">
                        <div className="central-circle">
                            <GraduationCap size={80} style={{ color: PALETTE.light }} />
                        </div>

                        <div className="floating-card" style={{ top: '10%', left: '0%', animationDelay: '0s' }}>
                            <div className="floating-icon-box"><Brain size={20} color="white"/></div>
                            <div>
                                <div className="floating-label">PARAMETER</div>
                                <div className="floating-value">Cognitive & Professionalism</div>
                            </div>
                        </div>

                        <div className="floating-card" style={{ top: '20%', right: '0%', animationDelay: '1s', animationDuration: '5s' }}>
                            <div className="floating-icon-box"><ShieldCheck size={20} color="white"/></div>
                            <div>
                                <div className="floating-label">PARAMETER</div>
                                <div className="floating-value">Ethics</div>
                            </div>
                        </div>

                        <div className="floating-card" style={{ bottom: '20%', left: '5%', animationDelay: '0.5s', animationDuration: '7s' }}>
                            <div className="floating-icon-box"><Clock size={20} color="white"/></div>
                            <div>
                                <div className="floating-label">PARAMETER</div>
                                <div className="floating-value">Attendance</div>
                            </div>
                        </div>

                        <div className="floating-card" style={{ bottom: '10%', right: '10%', animationDelay: '1.5s', animationDuration: '8s' }}>
                            <div className="floating-icon-box"><BookOpen size={20} color="white"/></div>
                            <div>
                                <div className="floating-label">PARAMETER</div>
                                <div className="floating-value">Academics</div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="scroll-indicator" onClick={scrollToEvaluation}>
                    <span className="scroll-text">Scroll to Start</span>
                    <ChevronDown style={{ width: '24px', height: '24px' }} />
                </div>
            </div>

            {/* 2. SPLIT DASHBOARD SECTION */}
            <div id="evaluation-section" className="evaluation-section">
                <div className="content-wrapper">
                    
                    {error && (
                        <div className="error-message-box" style={{marginBottom: '24px'}}>
                            <p>Error: {error}</p>
                        </div>
                    )}

                    <div className="split-layout">
                        
                        {/* --- LEFT PANEL: INPUTS --- */}
                        <div className="left-panel">
                            {/* FIX: Removed inline style to use CSS white background */}
                            <div className="input-card card-base">
                                <EvaluationForm
                                    onEvaluate={handleEvaluate}
                                    isLoading={isLoading.evaluate}
                                    inputs={evaluationInputs}
                                    setInputs={setEvaluationInputs}
                                    graphConfig={GRAPH_CONFIG}
                                />
                            </div>
                        </div>

                        {/* --- RIGHT PANEL: RESULTS --- */}
                        <div className="right-panel" ref={rightPanelRef}>
                            
                            {!hasRunEvaluation ? (
                                /* EMPTY STATE */
                                <div className="empty-state-card">
                                    <BarChart3 size={64} style={{ opacity: 0.3, marginBottom: '24px' }} />
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Ready to Evaluate</h3>
                                    <p>Adjust the parameters on the left and click <strong>Run Evaluation</strong> to see the Fuzzy Logic analysis here.</p>
                                </div>
                            ) : (
                                /* ACTIVE STATE */
                                <div className="fade-in-anim" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    
                                    {/* 1. TOP: OUTPUT GRAPH */}
                                    <div className="results-card">
                                        <FuzzyOutputGraph result={evaluationResult} />
                                    </div>

                                    {/* 2. MIDDLE: METRICS & BUTTONS */}
                                    <div className="results-card">
                                        <ResultsDisplay
                                            result={evaluationResult}
                                            evaluationInputs={evaluationInputs}
                                            onGetSuggestion={handleGetSuggestion}
                                            onDownloadReport={handleDownloadReport}
                                            isLoading={isLoading}
                                        />
                                    </div>

                                    {/* 3. BOTTOM: ACTIVE RULES */}
                                    {/* Added 'results-card' for width alignment and 'flex: 1' to stretch vertically */}
                                    <div className="results-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <ActiveRulesList rules={evaluationResult?.rules_triggered || []} />
                                    </div>

                                </div>
                            )}

                        </div>
                    </div>

                    {/* 3. BOTTOM CONTENT (Chat & Suggestions) */}
                    {hasRunEvaluation && (
                        <div className="fade-in-anim" style={{ marginTop: '40px' }} ref={suggestionRef}>
                            <div className="bottom-row-grid">
                                <div className="full-height">
                                    <SuggestionDisplay suggestionText={aiSuggestion} isLoading={isLoading.suggestion} error={error} />
                                </div>
                                <div className="full-height">
                                    <ChatBox performanceLevel={performanceLevel} evaluationInputs={evaluationInputs} />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default App;