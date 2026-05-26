import React from "react";
import { useNavigate } from "react-router-dom";
import Mascot from "../components/Mascot";
import "../styles/MainMenu.css";

const NAV_CARDS = [
  {
    path: "/freeform",
    title: "Freeform Play",
    desc: "Perform live with keyboard shortcuts — hold roots, layer variations, feel the chord.",
    icon: "🎹",
    cls: "card-gold",
  },
  {
    path: "/ai-assisted",
    title: "AI Composer",
    desc: "Describe your vision. The engine analyzes mood, genre, and returns a full musical blueprint.",
    icon: "🤖",
    cls: "card-crimson",
  },
  {
    path: "/backtracking",
    title: "Backing Track",
    desc: "Build rich diatonic progressions with multiple instruments. Press play and improvise.",
    icon: "🎸",
    cls: "card-violet",
  },
  {
    path: "/metronome",
    title: "Metronome",
    desc: "Precision tempo control with custom time signatures and animated beat visualization.",
    icon: "🥁",
    cls: "card-teal",
  },
];

const THEMES = [
  { id: "rustic",  label: "Rustic",  swatch: "#9D2F38" },
  { id: "concert", label: "Concert", swatch: "#D4CAB0" },
  { id: "beach",   label: "Beach",   swatch: "#6A4A2F" },
];

function MainMenu({ selectedTheme, setSelectedTheme }) {
  const navigate = useNavigate();

  return (
    <div className="main-menu-page">
      {/* Background */}
      <div className="mm-bg">
        <div className="mm-orb mm-orb-1" />
        <div className="mm-orb mm-orb-2" />
        <div className="mm-orb mm-orb-3" />
        <div className="mm-grid" />
      </div>

      <div className="mm-layout">
        {/* Sidebar */}
        <aside className="mm-sidebar">
          <div className="mm-brand">
            <div className="mm-brand-symbol">𝅘𝅥𝅮</div>
            <div className="mm-brand-name">AudioAlchemy</div>
            <div className="mm-brand-tag">music creation platform</div>
          </div>

          <div className="mm-mascot-wrap">
            <Mascot label="Your musical companion" />
          </div>

          <div className="mm-sidebar-footer">
            <div className="mm-version">v2.0.0 — dark alchemy</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="mm-content">
          <div className="mm-header">
            <div className="mm-greeting">Studio Dashboard</div>
            <h1 className="mm-title">
              What will you<br />
              <span>create today?</span>
            </h1>
            <p className="mm-subtitle">
              Choose a tool to start crafting. Each module is designed
              for a different creative mode — explore freely.
            </p>
          </div>

          {/* Nav cards */}
          <div className="mm-nav-grid">
            {NAV_CARDS.map((card) => (
              <button
                key={card.path}
                className={`mm-nav-card ${card.cls}`}
                onClick={() => navigate(card.path)}
              >
                <div className="mm-card-accent">{card.icon}</div>
                <div className="mm-card-body">
                  <div className="mm-card-title">{card.title}</div>
                  <div className="mm-card-desc">{card.desc}</div>
                </div>
                <span className="mm-card-arrow">↗</span>
              </button>
            ))}
          </div>

          {/* Theme selector */}
          <div className="mm-theme-section">
            <div className="mm-theme-label">Visual theme</div>
            <div className="mm-theme-pills">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`mm-theme-pill${selectedTheme === t.id ? " active" : ""}`}
                  onClick={() => setSelectedTheme(t.id)}
                >
                  <span className="mm-theme-swatch" style={{ background: t.swatch }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status bar */}
          <div className="mm-status-bar">
            <div className="mm-status-item">
              <div className="mm-status-dot" />
              Engine online
            </div>
            <div className="mm-status-item">⚡ 4 modules loaded</div>
            <div className="mm-status-item">🎵 Web Audio API ready</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainMenu;
