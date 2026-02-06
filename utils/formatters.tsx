import React from 'react';

export const formatLuxuryText = (text: string) => {
    if (!text) return null;

    // Pattern to match:
    // 1. New italic syntax: *text*
    // 2. Legacy HTML italic: <span class="italic">text</span> or <span class='italic'>text</span>
    // 3. Newlines: \n
    // 4. Legacy line breaks: <br /> or <br>
    const parts = text.split(/(\*[^*]+\*|<span\s+class=["']italic["']>.*?<\/span>|\n|<br\s*\/?>)/gi);

    return parts.map((part, i) => {
        if (!part) return null;

        // Handle newlines and legacy <br>
        if (part === '\n' || /<br\s*\/?>/i.test(part)) {
            return <br key={i} />;
        }

        // Handle new italic syntax: *text*
        if (part.startsWith('*') && part.endsWith('*')) {
            return (
                <span key={i} className="italic">
                    {part.slice(1, -1)}
                </span>
            );
        }

        // Handle legacy italic syntax: <span class="italic">text</span>
        const spanMatch = part.match(/<span\s+class=["']italic["']>(.*?)<\/span>/i);
        if (spanMatch) {
            return (
                <span key={i} className="italic">
                    {spanMatch[1]}
                </span>
            );
        }

        return part;
    });
};
