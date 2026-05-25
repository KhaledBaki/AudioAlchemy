import React from "react";

function ThemeSelector({ selectedTheme, setSelectedTheme }) {
    return (
        <div className="theme-selector">
            <h3 className="theme-selector-title">Choose Theme</h3>

            <div className="theme-button-group">
                <button
                    className={
                        selectedTheme === "rustic"
                            ? "theme-button rustic-theme-button active-theme"
                            : "theme-button rustic-theme-button"
                    }
                    onClick={() => setSelectedTheme("rustic")}
                >
                    Rustic
                </button>

                <button
                    className={
                        selectedTheme === "concert"
                            ? "theme-button concert-theme-button active-theme"
                            : "theme-button concert-theme-button"
                    }
                    onClick={() => setSelectedTheme("concert")}
                >
                    Concert Black
                </button>

                <button
                    className={
                        selectedTheme === "beach"
                            ? "theme-button beach-theme-button active-theme"
                            : "theme-button beach-theme-button"
                    }
                    onClick={() => setSelectedTheme("beach")}
                >
                    Summer Beach
                </button>
            </div>
        </div>
    );
}

export default ThemeSelector;