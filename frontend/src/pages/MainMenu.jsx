import React from "react";
import { useNavigate } from "react-router-dom";
import Mascot from "../components/Mascot";
import ThemeSelector from "../components/ThemeSelector";
import "../styles/MainMenu.css";

function MainMenu({ selectedTheme, setSelectedTheme }) {
    const navigate = useNavigate();

    const features = [
        { label: "Freeform Music",          desc: "Play chords with your keyboard",    icon: "🎹", path: "/freeform",     isNew: false },
        { label: "Assisted Song Generator",        desc: "Describe music, get a blueprint",   icon: "✨", path: "/ai-assisted",  isNew: false },
        { label: "Backtracking",             desc: "Practice over chord progressions",  icon: "🎸", path: "/backtracking", isNew: false },
        { label: "Metronome",                desc: "Perfect your timing & rhythm",      icon: "🥁", path: "/metronome",    isNew: false },
        { label: "SongLab",                  desc: "Build & layer a full song",         icon: "🎼", path: "/songlab",      isNew: true  },
        { label: "Ear Trainer",              desc: "Train your musical ear",            icon: "👂", path: "/ear-trainer",  isNew: true  },
    ];

    return (
        <div className="main-menu-page">
            <div className="main-menu-card">
                <div className="main-menu-logo-area">
                    <svg className="main-menu-logo-svg" viewBox="0 0 52 52" fill="none" aria-label="AudioAlchemy logo">
                        <circle cx="22" cy="38" r="12" fill="var(--primary-color)" stroke="var(--secondary-color)" strokeWidth="3"/>
                        <rect x="32" y="6" width="6" height="36" rx="3" fill="var(--primary-color)" stroke="var(--secondary-color)" strokeWidth="2.5"/>
                        <path d="M38 6 Q50 10 46 20 Q42 28 38 26" fill="var(--secondary-color)" opacity="0.9"/>
                        <circle cx="22" cy="38" r="5" fill="var(--secondary-color)" opacity="0.7"/>
                    </svg>
                    <h1 className="main-menu-title">AudioAlchemy</h1>
                </div>

                <p className="main-menu-subtitle">Your personal music creation studio</p>

                <Mascot label="Ready to make some music?" />

                <div className="main-menu-button-group">
                    {features.map((f) => (
                        <button
                            key={f.path}
                            className={`main-menu-button${f.isNew ? " btn-new" : ""}`}
                            onClick={() => navigate(f.path)}
                        >
                            {f.isNew && <span className="new-badge">NEW</span>}
                            <span className="btn-icon">{f.icon}</span>
                            <span className="btn-label">{f.label}</span>
                            <span className="btn-desc">{f.desc}</span>
                        </button>
                    ))}
                </div>

                <ThemeSelector
                    selectedTheme={selectedTheme}
                    setSelectedTheme={setSelectedTheme}
                />
            </div>
        </div>
    );
}

export default MainMenu;
