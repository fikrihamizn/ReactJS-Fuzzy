import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * 1. EXPORTED CONFIGURATION
 * Note: Colors now map to gradient IDs defined in the component below.
 */
export const GRAPH_CONFIG = {
    attendance: [
        { points: "0,10 0,10 150,100 0,100", color: "#ef4444", id: "red", label: "LOW" },
        { points: "75,100 150,10 225,100", color: "#eab308", id: "yellow", label: "MEDIUM" },
        { points: "150,100 300,10 300,100 300,100", color: "#22c55e", id: "green", label: "HIGH" }
    ],
    test: [
        { points: "0,10 0,10 150,100 0,100", color: "#ef4444", id: "red", label: "LOW" },
        { points: "90,100 180,10 240,100", color: "#eab308", id: "yellow", label: "MEDIUM" },
        { points: "210,100 300,10 300,100 300,100", color: "#22c55e", id: "green", label: "HIGH" }
    ],
    assignment: [
        { points: "0,10 0,10 150,100 0,100", color: "#ef4444", id: "red", label: "LOW" },
        { points: "90,100 180,10 240,100", color: "#eab308", id: "yellow", label: "MEDIUM" },
        { points: "210,100 300,10 300,100 300,100", color: "#22c55e", id: "green", label: "HIGH" }
    ],
    ethics: [
        { points: "0,10 0,10 150,100 0,100", color: "#ef4444", id: "red", label: "LOW" },
        { points: "75,100 150,10 225,100", color: "#eab308", id: "yellow", label: "MEDIUM" },
        { points: "150,100 300,10 300,100 300,100", color: "#22c55e", id: "green", label: "HIGH" }
    ],
    cognitive: [
        { points: "0,10 0,10 150,100 0,100", color: "#ef4444", id: "red", label: "LOW" },
        { points: "75,100 150,10 225,100", color: "#eab308", id: "yellow", label: "MEDIUM" },
        { points: "150,100 300,10 300,100 300,100", color: "#22c55e", id: "green", label: "HIGH" }
    ],
    performance: [
        { points: "0,10 0,10 120,100 0,100", color: "#ef4444", id: "red", label: "WEAK" },        
        { points: "105,100 150,10 195,100", color: "#eab308", id: "yellow", label: "AVG" },          
        { points: "180,100 225,10 255,100", color: "#3b82f6", id: "blue", label: "GOOD" },        
        { points: "240,100 300,10 300,100 300,100", color: "#22c55e", id: "green", label: "EXC" }   
    ]
};

/**
 * 2. EXPORTED SINGLE GRAPH COMPONENT
 */
export const MembershipGraph = ({ title, value, config, unit = "%", style = {}, className = "" }) => {
    const currentX = (value / 100) * 300;

    return (
        <div className={`graph-container ${className}`} style={style}>
            <div className="graph-header">
                <span className="graph-title">
                    {title}
                </span>
                <div className="graph-value-badge">
                    {value}{unit}
                </div>
            </div>

            <div className="graph-legend">
                {config.map((item, index) => (
                    <div key={index} className="legend-item">
                        <div className="legend-dot" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                        <span className="legend-label">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="graph-svg-wrapper">
                <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="graph-svg">
                    {/* --- DEFINITIONS FOR GRADIENTS --- */}
                    <defs>
                        {/* Red Gradient */}
                        <linearGradient id="grad-red" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                        </linearGradient>
                        {/* Yellow Gradient */}
                        <linearGradient id="grad-yellow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#eab308" stopOpacity="0.05" />
                        </linearGradient>
                        {/* Green Gradient */}
                        <linearGradient id="grad-green" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                        </linearGradient>
                        {/* Blue Gradient */}
                        <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    {/* Background Axis Line */}
                    <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    
                    {/* Render Shapes */}
                    {config.map((shape, index) => (
                        <g key={index}>
                            {/* Fill with Gradient */}
                            <polygon 
                                points={shape.points} 
                                fill={`url(#grad-${shape.id})`} 
                                stroke={shape.color} 
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                        </g>
                    ))}
                    
                    {/* Current Value Indicator Line (Dashed) */}
                    <line 
                        x1={currentX} y1="0" x2={currentX} y2="100" 
                        stroke="white" strokeWidth="2" strokeDasharray="4,4" opacity="0.8" 
                    />
                    
                    {/* Current Value Target Dot (Ring style) */}
                    <circle cx={currentX} cy="100" r="5" fill="#3c1361" stroke="white" strokeWidth="2.5" />
                </svg>
            </div>
        </div>
    );
};

/**
 * 3. MAIN OUTPUT GRAPH
 */
const FuzzyOutputGraph = ({ result }) => {
    const finalScore = result?.fuzzy_score || 0;
    const finalLevel = result?.performance_level || "---";

    return (
        <div>
             <div className="output-section-header">
                <ArrowRight size={30} style={{ marginRight: '8px' }} />
                <h3>Output Layer</h3>
            </div>

            {/* Linguistic Value Box */}
             <div className="linguistic-result-box">
                <span className="linguistic-result-text">
                    {finalLevel}
                </span>
            </div>

            {/* Graph Component */}
            <MembershipGraph 
                title="Student Performance Score" 
                value={finalScore} 
                config={GRAPH_CONFIG.performance}
                className="graph-container-output"
            />
        </div>
    );
};

export default FuzzyOutputGraph;