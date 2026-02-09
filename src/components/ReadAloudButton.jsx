import { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Square } from 'lucide-react';

const ReadAloudButton = ({ contentRef, label = 'Read Aloud' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef(null);

    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    const stop = useCallback(() => {
        if (supported) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, [supported]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (supported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [supported]);

    // Sync state if speech ends naturally
    useEffect(() => {
        if (!supported) return;

        const check = setInterval(() => {
            if (isSpeaking && !window.speechSynthesis.speaking) {
                setIsSpeaking(false);
            }
        }, 250);

        return () => clearInterval(check);
    }, [isSpeaking, supported]);

    const speak = useCallback(() => {
        if (!supported || !contentRef?.current) return;

        // Stop any current speech first
        window.speechSynthesis.cancel();

        const text = contentRef.current.innerText || contentRef.current.textContent || '';
        if (!text.trim()) return;

        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.rate = 0.95;
        utterance.pitch = 1;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    }, [supported, contentRef]);

    if (!supported) return null;

    return (
        <div className="flex items-center gap-2 no-print">
            {isSpeaking ? (
                <button
                    onClick={stop}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition min-h-[44px] min-w-[44px]"
                    aria-label="Stop reading aloud"
                >
                    <Square size={16} aria-hidden="true" />
                    Stop
                </button>
            ) : (
                <button
                    onClick={speak}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition min-h-[44px] min-w-[44px]"
                    aria-label={label}
                >
                    <Volume2 size={16} aria-hidden="true" />
                    {label}
                </button>
            )}
        </div>
    );
};

export default ReadAloudButton;
