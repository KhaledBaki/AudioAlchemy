import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoadingScreen.css";

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${4 + Math.random() * 8}s`,
  delay: `${Math.random() * 6}s`,
  size: `${1 + Math.random() * 3}px`,
}));

const HINTS = [
  { icon: "🎹", label: "Freeform" },
  { icon: "🤖", label: "AI Music" },
  { icon: "🥁", label: "Metronome" },
  { icon: "🎸", label: "Backtrack" },
];

const MESSAGES = [
  "Calibrating alchemical constants...",
  "Tuning harmonic frequencies...",
  "Loading chord progressions...",
  "Preparing your studio...",
];

function LoadingScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const DURATION = 2200;
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const p = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(Math.floor(p));
      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => navigate("/menu"), 300);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [navigate]);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 550);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="loading-screen-container">
      {/* Orbs */}
      <div className="loading-bg-orb loading-bg-orb-1" />
      <div className="loading-bg-orb loading-bg-orb-2" />
      <div className="loading-bg-orb loading-bg-orb-3" />
      <div className="loading-grid" />

      {/* Particles */}
      <div className="loading-particles">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="loading-particle"
            style={{
              left: p.left,
              animationDuration: p.duration,
              animationDelay: p.delay,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="loading-logo-wrap">
        <div className="loading-rings">
          <div className="loading-ring loading-ring-1" />
          <div className="loading-ring loading-ring-2" />
          <div className="loading-ring loading-ring-3" />
          <span className="loading-symbol">𝅘𝅥𝅮</span>
        </div>

        <h1 className="loading-title">AudioAlchemy</h1>
        <p className="loading-tagline">— compose your world —</p>

        <div className="loading-progress-wrap">
          <div className="loading-progress-label">
            <span>{MESSAGES[msgIdx]}</span>
            <span className="loading-progress-pct">{progress}%</span>
          </div>
          <div className="loading-bar-track">
            <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Hints */}
      <div className="loading-hints">
        {HINTS.map((h) => (
          <div key={h.label} className="loading-hint">
            <span className="loading-hint-icon">{h.icon}</span>
            <span className="loading-hint-text">{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingScreen;
