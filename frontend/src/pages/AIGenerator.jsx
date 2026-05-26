import React, { useState } from "react";
import "./AIGenerator.css";
import { useNavigate } from "react-router-dom";
import { analyzeMusicRequest } from "../utils/aiMusicEngine";

const GENRES = ["Cinematic","Lofi","Electronic","Jazz","Ambient","Epic","Pop","Classical"];
const MOODS  = ["Heroic","Happy","Calm","Sad","Dark","Mysterious","Energetic","Melancholic"];

const WAVE_BARS = 24;

function AIGenerator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Cinematic");
  const [mood, setMood] = useState("Heroic");
  const [bpm, setBpm] = useState(120);
  const [duration, setDuration] = useState(30);
  const [instrumentalOnly, setInstrumentalOnly] = useState(true);
  const [track, setTrack] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTrack(null);
    setTimeout(() => {
      try {
        const result = analyzeMusicRequest({ prompt, genre, mood, bpm, duration, instrumentalOnly });
        setTrack(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    }, 1800);
  };

  return (
    <div className="ai-page">
      <div className="ai-bg-orb-1" />
      <div className="ai-bg-orb-2" />

      {/* Top bar */}
      <div className="ai-topbar">
        <button className="ai-back-btn" onClick={() => navigate("/menu")}>
          ← Menu
        </button>
        <span className="ai-topbar-title">AI Composer</span>
        <span className="ai-topbar-badge">
          <span className="badge badge-green">● Live</span>
        </span>
      </div>

      <div className="ai-layout">
        {/* Form panel */}
        <div className="ai-form-panel">
          <div className="ai-form-header">
            <div className="ai-form-eyebrow">Composition Engine</div>
            <h2 className="ai-form-title">Describe your music</h2>
            <p className="ai-form-subtitle">
              The engine analyzes your intent and returns a full musical blueprint.
            </p>
          </div>

          <div className="ai-form">
            <div className="ai-field">
              <label className="ai-label"><span className="ai-label-icon">✍️</span> Vision Prompt</label>
              <textarea
                className="ai-textarea"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. A cinematic battle theme with rising tension and a triumphant finale..."
                rows={4}
              />
            </div>

            <div className="ai-row">
              <div className="ai-field">
                <label className="ai-label"><span className="ai-label-icon">🎼</span> Genre</label>
                <select className="ai-select" value={genre} onChange={e => setGenre(e.target.value)}>
                  {GENRES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="ai-field">
                <label className="ai-label"><span className="ai-label-icon">🌊</span> Mood</label>
                <select className="ai-select" value={mood} onChange={e => setMood(e.target.value)}>
                  {MOODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="ai-row">
              <div className="ai-field">
                <label className="ai-label"><span className="ai-label-icon">⚡</span> BPM</label>
                <input
                  type="number"
                  className="ai-number"
                  value={bpm}
                  onChange={e => setBpm(Number(e.target.value))}
                  min={40} max={220}
                />
              </div>
              <div className="ai-field">
                <label className="ai-label"><span className="ai-label-icon">⏱</span> Duration (s)</label>
                <input
                  type="number"
                  className="ai-number"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  min={5} max={180}
                />
              </div>
            </div>

            <div
              className="ai-checkbox-row"
              onClick={() => setInstrumentalOnly(v => !v)}
            >
              <input
                type="checkbox"
                className="ai-checkbox"
                checked={instrumentalOnly}
                onChange={() => setInstrumentalOnly(v => !v)}
              />
              <label className="ai-checkbox-label">
                🎹 Instrumental only (no vocal arrangement)
              </label>
            </div>

            <button
              className={`ai-generate-btn${isGenerating ? " generating" : ""}`}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "⚗️ Composing..." : "⚗️ Generate Track"}
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="ai-output-panel">
          {!track && !isGenerating && (
            <div className="ai-empty-state">
              <div className="ai-empty-icon">🎵</div>
              <p className="ai-empty-text">Your composition will appear here</p>
            </div>
          )}

          {isGenerating && (
            <div className="ai-generating-overlay">
              <div className="ai-gen-rings">
                <div className="ai-gen-ring ai-gen-ring-1" />
                <div className="ai-gen-ring ai-gen-ring-2" />
                <span className="ai-gen-icon">⚗️</span>
              </div>
              <p className="ai-gen-label">Analyzing harmonic patterns…</p>
            </div>
          )}

          {track && !isGenerating && (
            <div className="ai-output-card">
              <div className="ai-output-header">
                <div>
                  <div className="ai-output-title">{track.title}</div>
                  <div className="ai-output-desc">{track.description}</div>
                </div>
                <span className="badge badge-gold">Generated</span>
              </div>

              <div className="ai-stats-grid">
                <div className="ai-stat">
                  <div className="ai-stat-value">{track.tempo}</div>
                  <div className="ai-stat-label">BPM</div>
                </div>
                <div className="ai-stat">
                  <div className="ai-stat-value" style={{textTransform:'capitalize'}}>{track.scale}</div>
                  <div className="ai-stat-label">Scale</div>
                </div>
                <div className="ai-stat">
                  <div className="ai-stat-value" style={{textTransform:'capitalize'}}>{track.mood}</div>
                  <div className="ai-stat-label">Mood</div>
                </div>
              </div>

              <div className="ai-data-section">
                {[
                  ["Instrument", track.instrument],
                  ["Chord Prog.", track.chordProgression],
                ].map(([k,v],i) => (
                  <div key={k} className="ai-data-row" style={{animationDelay:`${i*0.07}s`}}>
                    <span className="ai-data-key">{k}</span>
                    <span className="ai-data-val">{v}</span>
                  </div>
                ))}

                <div className="ai-data-row">
                  <span className="ai-data-key">Melody</span>
                  <div className="ai-melody-notes">
                    {track.melodyNotes.map((n, i) => (
                      <span key={i} className="ai-note-chip" style={{animationDelay:`${i*0.06}s`}}>{n}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative wave */}
              <div className="ai-wave-viz">
                {Array.from({length: WAVE_BARS}).map((_, i) => (
                  <div
                    key={i}
                    className="ai-wave-bar"
                    style={{
                      height: `${20 + Math.sin(i * 0.7) * 40 + Math.random() * 20}%`,
                      animationDelay: `${(i * 0.06) % 1.4}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIGenerator;
