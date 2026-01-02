import React from 'react';
import { ScrollText, CheckCircle2 } from 'lucide-react';

const PALETTE = {
    darkest: '#3c1361',
    dark: '#52307c',
    medium: '#7c5295',
    light: '#bca0dc',
    white: '#ffffff',
};

const ActiveRulesList = ({ rules }) => {
    if (!rules || rules.length === 0) return null;

    const formatRule = (rawRule) => {
        let ruleObj = rawRule;

        try {
            if (typeof rawRule === 'string') {
                if (rawRule.trim().startsWith('{')) {
                    ruleObj = JSON.parse(rawRule);
                } else {
                    return rawRule;
                }
            }

            const ruleId = ruleObj.rule_id || "Rule";
            let logic = ruleObj.logic || ruleObj.description || ""; 
            const strength = ruleObj.strength !== undefined ? ruleObj.strength : "";

            const match = logic.match(/THEN\s+\[performance\[(.*?)\]\]/i);
            if (match && match[1]) {
                const resultValue = match[1]; 
                const capitalizedResult = resultValue.charAt(0).toUpperCase() + resultValue.slice(1);
                logic = logic.replace(match[0], `THEN performance is ${capitalizedResult}`);
            }

            return `${ruleId}: ${logic} (strength: ${strength})`;

        } catch (e) {
            console.warn("Error formatting rule:", e);
            return typeof rawRule === 'object' ? JSON.stringify(rawRule) : String(rawRule);
        }
    };

    return (
        /* The outer container expands to fill the card space provided by App.jsx */
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 className="font-bold" style={{ color: PALETTE.darkest, display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '1.1rem' }}>
                <ScrollText style={{ width: '20px', height: '20px', marginRight: '8px', color: PALETTE.medium }} />
                Active Fuzzy Rules
            </h3>
            
            {/* FIX: added maxHeight: '320px' to force scrolling and prevent layout overflow */}
            <div className="custom-scrollbar" style={{ 
                maxHeight: '320px', 
                overflowY: 'auto', 
                paddingRight: '8px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px' 
            }}>
                {rules.map((rule, index) => {
                    const formattedRuleText = formatRule(rule);
                    
                    return (
                        <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'start',
                            padding: '12px 16px', 
                            backgroundColor: '#f9fafb', 
                            borderRadius: '12px',
                            borderLeft: `4px solid ${PALETTE.medium}`,
                            fontSize: '0.9rem',
                            lineHeight: '1.5'
                        }}>
                            <CheckCircle2 size={18} style={{ color: PALETTE.medium, marginRight: '12px', marginTop: '3px', flexShrink: 0 }} />
                            <span style={{ color: PALETTE.darkest, fontWeight: '500', fontFamily: 'monospace' }}>
                                {formattedRuleText}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActiveRulesList;