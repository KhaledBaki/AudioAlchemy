import React from "react";

const THEMES = [
    { id: "rustic",  label: "Rustic",        dot: "#8B2232",  bg: "#EDE8E0" },
    { id: "concert", label: "Concert Black",  dot: "#7B68EE",  bg: "#18161A" },
    { id: "beach",   label: "Summer Beach",   dot: "#C05A20",  bg: "#E8F4F8" },
];

function ThemeSelector({ selectedTheme, setSelectedTheme }) {
    return (
        <div className="theme-selector">
            <h3 className="theme-selector-title">Choose Theme</h3>
            <div className="theme-button-group">
                {THEMES.map(t => (
                    <button
                        key={t.id}
                        className={`theme-button${selectedTheme === t.id ? " active-theme" : ""}`}
                        onClick={() => setSelectedTheme(t.id)}
                    >
                        <span
                            className="theme-dot"
                            style={{ background: t.dot }}
                        />
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ThemeSelector;
