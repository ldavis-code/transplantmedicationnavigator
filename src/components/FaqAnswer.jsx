/**
 * FaqAnswer - renders the light markdown used in faqs.json / faqs.es.json
 * answers (**bold**, • / - / 1. list lines, blank-line paragraphs) as real
 * HTML. The FAQ data files are written by non-developers, so the renderer
 * stays forgiving: anything it doesn't recognize falls back to plain text.
 */

// Split "text **bold** text" into <strong> runs. Unmatched ** is left as-is.
const renderInline = (text) => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
};

const BULLET_RE = /^\s*(?:[•–—-]|\*(?!\*))\s+/;
const NUMBER_RE = /^\s*\d+[.)]\s+/;

// Group the answer's lines into paragraph / ul / ol blocks.
const toBlocks = (answer) => {
    const blocks = [];
    for (const rawLine of String(answer).split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;
        const kind = BULLET_RE.test(line) ? 'ul' : NUMBER_RE.test(line) ? 'ol' : 'p';
        const text = kind === 'p' ? line : line.replace(kind === 'ul' ? BULLET_RE : NUMBER_RE, '');
        const prev = blocks[blocks.length - 1];
        if (kind !== 'p' && prev && prev.kind === kind) {
            prev.items.push(text);
        } else {
            blocks.push(kind === 'p' ? { kind, text } : { kind, items: [text] });
        }
    }
    return blocks;
};

const FaqAnswer = ({ answer }) => (
    <div className="text-slate-700 leading-relaxed space-y-3">
        {toBlocks(answer).map((block, i) => {
            if (block.kind === 'p') return <p key={i}>{renderInline(block.text)}</p>;
            const List = block.kind === 'ul' ? 'ul' : 'ol';
            return (
                <List key={i} className={`${block.kind === 'ul' ? 'list-disc' : 'list-decimal'} pl-5 space-y-1`}>
                    {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </List>
            );
        })}
    </div>
);

export default FaqAnswer;
