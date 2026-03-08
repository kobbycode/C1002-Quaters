import React from 'react';

interface HighlighterProps {
    text: string | number;
    search: string;
}

export const Highlighter: React.FC<HighlighterProps> = ({ text, search }) => {
    if (!search.trim()) return <>{text}</>;

    const stringText = String(text);
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = stringText.split(regex);

    return (
        <>
            {parts.map((part, i) => (
                regex.test(part) ? (
                    <mark key={i} className="bg-gold/20 text-gold rounded-sm px-0.5 border-b border-gold/30">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            ))}
        </>
    );
};
