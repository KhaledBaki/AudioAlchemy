import React from "react";
import { useNavigate } from "react-router-dom";
import Mascot from "../components/Mascot";
import ThemeSelector from "../components/ThemeSelector";
import "../styles/MainMenu.css";

function MainMenu({ selectedTheme, setSelectedTheme }) {
    const navigate = useNavigate();

    return (
        <div className="main-menu-page">
            <div className="main-menu-card">
                <h1 className="main-menu-title">AudioAlchemy</h1>
                <p className="main-menu-subtitle">A warm place to create music</p>

                <Mascot label="Your musical companion" />

                <div className="main-menu-button-group">
                    <button
                        className="main-menu-button"
                        onClick={() => navigate("/Freeform")}
                    >
                        Freeform Music
                    </button>

                    <button
                        className="main-menu-button"
                        onClick={() => navigate("/ai-assisted")}
                    >
                        AI Assisted Song Creation
                    </button>

                    <button
                        className="main-menu-button"
                        onClick={() => navigate("/backtracking")}
                    >
                        Backtracking
                    </button>

                    <button
                        className="main-menu-button"
                        onClick={() => navigate("/metronome")}
                    >
                        Metronome
                    </button>
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