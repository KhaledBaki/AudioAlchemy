import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoadingScreen.css";

const MESSAGES = [
    "Tuning the instruments...",
    "Warming up the synths...",
    "Arranging the chords...",
    "Polishing the sound...",
    "Almost ready to jam!",
];

function LoadingScreen() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        let current = 0;
        const timer = setInterval(() => {
            current += Math.random() * 8 + 3;
            if (current >= 100) {
                current = 100;
                clearInterval(timer);
                setTimeout(() => navigate("/menu"), 400);
            }
            setProgress(Math.min(Math.round(current), 100));
            setMsgIdx(Math.floor((Math.min(current, 99) / 100) * MESSAGES.length));
        }, 120);
        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="loading-screen">
            <div className="loading-logo-area">
                <svg className="loading-logo-svg" viewBox="0 0 80 80" fill="none" aria-label="AudioAlchemy">
                    <circle cx="32" cy="58" r="18" fill="var(--primary-color)" stroke="var(--secondary-color)" strokeWidth="4"/>
                    <rect x="48" y="8" width="9" height="54" rx="4.5" fill="var(--primary-color)" stroke="var(--secondary-color)" strokeWidth="3"/>
                    <path d="M57 8 Q76 15 70 30 Q64 44 57 42" fill="var(--secondary-color)" opacity="0.85"/>
                    <circle cx="32" cy="58" r="7" fill="var(--secondary-color)" opacity="0.7"/>
                </svg>
                <h1 className="loading-title">AudioAlchemy</h1>
                <p className="loading-subtitle">Your Music Studio</p>
            </div>

            <div className="loading-bar-wrapper">
                <div className="loading-bar-track">
                    <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="loading-percent">{progress}%</div>
            </div>

            <p className="loading-message">{MESSAGES[msgIdx] || MESSAGES[0]}</p>

            <div className="loading-note-ring">
                {[0,1,2,3].map(i => <div key={i} className="loading-note-dot" />)}
            </div>
        </div>
    );
}

export default LoadingScreen;
