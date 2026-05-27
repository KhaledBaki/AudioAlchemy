import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SongLab.css";

const STEPS = 16;

const INSTRUMENT_CATALOG = [
  { id: "kick",    name: "Kick Drum",  icon: "🥁" },
  { id: "snare",   name: "Snare",      icon: "🪘" },
  { id: "hihat",   name: "Hi-Hat",     icon: "🎵" },
  { id: "piano",   name: "Piano",      icon: "🎹" },
  { id: "bass",    name: "Bass",       icon: "🎸" },
  { id: "strings", name: "Strings",    icon: "🎻" },
  { id: "synth",   name: "Synth Lead", icon: "🎛️" },
  { id: "pad",     name: "Soft Pad",   icon: "🌊" },
];

const ALL_NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

// Build a full list of playable notes: C2 – C7
const NOTE_OPTIONS = [];
for (let oct = 2; oct <= 7; oct++) {
  ALL_NOTES.forEach(n => NOTE_OPTIONS.push({ label: `${n}${oct}`, midi: (oct + 1) * 12 + ALL_NOTES.indexOf(n) }));
}

const SCALE_PATTERNS = {
  major:      [0,2,4,5,7,9,11],
  minor:      [0,2,3,5,7,8,10],
  pentatonic: [0,2,4,7,9],
  blues:      [0,3,5,6,7,10],
};
const CHORD_QUALITIES_MAJOR = ["","m","m","","","m","dim"];
const CHORD_QUALITIES_MINOR = ["m","dim","","m","m","",""];

function getScaleChords(root, scale) {
  const rootIdx = ALL_NOTES.indexOf(root);
  const pattern = SCALE_PATTERNS[scale] || SCALE_PATTERNS.major;
  const qualities = scale === "minor" ? CHORD_QUALITIES_MINOR : CHORD_QUALITIES_MAJOR;
  return pattern.slice(0,7).map((interval, i) => {
    const note = ALL_NOTES[(rootIdx + interval) % 12];
    return note + (qualities[i] || "");
  });
}

function midiFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

const DRUM_IDS = ["kick","snare","hihat"];
const MELODIC_IDS = ["piano","bass","strings","synth","pad"];

// Default midi per instrument (middle octave sensible defaults)
const DEFAULT_MIDI = { piano: 60, bass: 48, strings: 64, synth: 67, pad: 55 };

function playDrumSound(ctx, type, vol) {
  const now = ctx.currentTime;
  const g = ctx.createGain();
  g.connect(ctx.destination);
  g.gain.setValueAtTime(vol * 0.8, now);
  if (type === "kick") {
    const osc = ctx.createOscillator();
    osc.connect(g);
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.001, now + 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now); osc.stop(now + 0.4);
  } else if (type === "snare") {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass"; filt.frequency.value = 3500; filt.Q.value = 0.5;
    src.connect(filt); filt.connect(g);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    src.start(now);
  } else if (type === "hihat") {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "highpass"; filt.frequency.value = 8000;
    src.connect(filt); filt.connect(g);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    src.start(now);
  }
}

function playMelodicSound(ctx, instrumentId, midiNote, vol, dur) {
  const now = ctx.currentTime;
  const freq = midiFreq(midiNote);
  const g = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  filt.connect(ctx.destination);
  g.connect(filt);
  g.gain.setValueAtTime(0.0001, now);
  let oscType = "sine";
  filt.type = "lowpass";
  if (instrumentId === "piano") {
    oscType = "triangle"; filt.frequency.value = 2000;
    g.gain.linearRampToValueAtTime(vol * 0.25, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.7);
  } else if (instrumentId === "bass") {
    oscType = "sawtooth"; filt.frequency.value = 800;
    g.gain.linearRampToValueAtTime(vol * 0.3, now + 0.02);
    g.gain.linearRampToValueAtTime(0.001, now + dur - 0.05);
  } else if (instrumentId === "strings") {
    oscType = "sawtooth"; filt.frequency.value = 1400;
    g.gain.linearRampToValueAtTime(vol * 0.15, now + 0.12);
    g.gain.linearRampToValueAtTime(0.001, now + dur - 0.05);
  } else if (instrumentId === "synth") {
    oscType = "square"; filt.frequency.value = 1200;
    g.gain.linearRampToValueAtTime(vol * 0.2, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur - 0.05);
  } else if (instrumentId === "pad") {
    oscType = "sine"; filt.frequency.value = 1000;
    g.gain.linearRampToValueAtTime(vol * 0.2, now + 0.2);
    g.gain.linearRampToValueAtTime(0.001, now + dur - 0.1);
  } else {
    oscType = "triangle"; filt.frequency.value = 1600;
    g.gain.linearRampToValueAtTime(vol * 0.2, now + 0.05);
    g.gain.linearRampToValueAtTime(0.001, now + dur - 0.05);
  }
  const osc = ctx.createOscillator();
  osc.type = oscType;
  osc.frequency.setValueAtTime(freq, now);
  osc.connect(g);
  osc.start(now);
  osc.stop(now + dur);
}

// A "step" is either false (off) or an object { midi }
function createTrack(instrumentId) {
  const inst = INSTRUMENT_CATALOG.find(i => i.id === instrumentId) || INSTRUMENT_CATALOG[0];
  const defaultMidi = DEFAULT_MIDI[instrumentId] || 60;
  return {
    id: Date.now() + Math.random(),
    instrumentId,
    name: inst.name,
    icon: inst.icon,
    // Each step: null = off, number = midi note (on)
    steps: Array(STEPS).fill(null),
    volume: 0.8,
    defaultMidi,
  };
}

export default function SongLab() {
  const navigate = useNavigate();
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [tracks, setTracks] = useState([
    createTrack("kick"),
    createTrack("hihat"),
    createTrack("piano"),
    createTrack("bass"),
  ]);
  const [selectedKey, setSelectedKey] = useState("C");
  const [selectedScale, setSelectedScale] = useState("major");
  const [selectedChords, setSelectedChords] = useState([]);
  const [showExport, setShowExport] = useState(false);
  // Note picker popup state: { trackId, stepIdx } or null
  const [notePicker, setNotePicker] = useState(null);

  const audioCtxRef = useRef(null);
  const playIntervalRef = useRef(null);
  const stepRef = useRef(0);
  const tracksRef = useRef(tracks);
  const bpmRef = useRef(bpm);

  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const fireStep = useCallback((step) => {
    const ctx = getAudioCtx();
    const dur = 60 / bpmRef.current;
    tracksRef.current.forEach(track => {
      const stepVal = track.steps[step];
      if (stepVal === null || stepVal === undefined) return;
      if (DRUM_IDS.includes(track.instrumentId)) {
        playDrumSound(ctx, track.instrumentId, track.volume);
      } else {
        const midi = typeof stepVal === "number" ? stepVal : track.defaultMidi;
        playMelodicSound(ctx, track.instrumentId, midi, track.volume, dur * 0.85);
      }
    });
  }, []);

  const startSequencer = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    stepRef.current = 0;
    const msPerStep = (60 / bpm) * 1000;
    fireStep(0);
    setCurrentStep(0);
    playIntervalRef.current = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % STEPS;
      setCurrentStep(stepRef.current);
      fireStep(stepRef.current);
    }, msPerStep);
  };

  const stopSequencer = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    clearInterval(playIntervalRef.current);
  };

  useEffect(() => () => clearInterval(playIntervalRef.current), []);

  // Left-click: toggle step on/off (uses defaultMidi when turning on)
  const toggleStep = (trackId, stepIdx) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      const newSteps = [...t.steps];
      newSteps[stepIdx] = newSteps[stepIdx] !== null ? null : t.defaultMidi;
      return { ...t, steps: newSteps };
    }));
  };

  // Right-click on an active melodic step: open note picker
  const handleStepRightClick = (e, track, stepIdx) => {
    e.preventDefault();
    if (DRUM_IDS.includes(track.instrumentId)) return; // drums don't need note picker
    if (track.steps[stepIdx] === null) return; // step is off, nothing to edit
    setNotePicker({ trackId: track.id, stepIdx });
  };

  // Called from note picker to set the note for a specific step
  const setStepNote = (trackId, stepIdx, midi) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      const newSteps = [...t.steps];
      newSteps[stepIdx] = midi;
      return { ...t, steps: newSteps };
    }));
    setNotePicker(null);
    // Preview the note
    const ctx = getAudioCtx();
    const track = tracks.find(t => t.id === trackId);
    if (track) playMelodicSound(ctx, track.instrumentId, midi, track.volume, 0.6);
  };

  // Set ALL active steps of a track to the same note
  const setTrackDefaultNote = (trackId, midi) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;
      const newSteps = t.steps.map(s => s !== null ? midi : null);
      return { ...t, defaultMidi: midi, steps: newSteps };
    }));
    const ctx = getAudioCtx();
    const track = tracks.find(t => t.id === trackId);
    if (track) playMelodicSound(ctx, track.instrumentId, midi, track.volume, 0.6);
  };

  const setVolume = (trackId, vol) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, volume: vol } : t));
  };

  const removeTrack = (trackId) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const addTrack = (instrumentId) => {
    if (tracks.length >= 8) return;
    setTracks(prev => [...prev, createTrack(instrumentId)]);
  };

  const clearAll = () => {
    stopSequencer();
    setTracks(prev => prev.map(t => ({ ...t, steps: Array(STEPS).fill(null) })));
  };

  const scaleChords = getScaleChords(selectedKey, selectedScale);

  const toggleChord = (chord) => {
    setSelectedChords(prev =>
      prev.includes(chord) ? prev.filter(c => c !== chord) : [...prev, chord]
    );
  };

  const buildExport = () => {
    const lines = [
      "🎼 SongLab Blueprint — AudioAlchemy",
      `Key: ${selectedKey} ${selectedScale} | BPM: ${bpm}`,
      selectedChords.length ? `Chord Progression: ${selectedChords.join(" → ")}` : "",
      "",
      "Tracks:",
      ...tracks.map(t => {
        const pattern = t.steps.map((s, i) => {
          if (s === null) return "·";
          if (DRUM_IDS.includes(t.instrumentId)) return i % 4 === 0 ? "X" : "x";
          const noteObj = NOTE_OPTIONS.find(n => n.midi === s);
          return noteObj ? noteObj.label : "x";
        }).join(" ");
        return `  ${t.icon} ${t.name.padEnd(12)} | ${pattern} | vol: ${Math.round(t.volume * 100)}%`;
      }),
    ].filter(Boolean);
    return lines.join("\n");
  };

  const availableToAdd = INSTRUMENT_CATALOG.filter(inst =>
    tracks.filter(t => t.instrumentId === inst.id).length < 2
  );

  const sliderBg = (val) =>
    `linear-gradient(to right, var(--primary-color) ${val * 100}%, var(--border-color) ${val * 100}%)`;

  // Note picker popup component (inline)
  const pickerTrack = notePicker ? tracks.find(t => t.id === notePicker.trackId) : null;
  const pickerCurrentMidi = pickerTrack && notePicker ? pickerTrack.steps[notePicker.stepIdx] : null;

  return (
    <div className="songlab-page" onClick={() => setNotePicker(null)}>
      {/* Note Picker Popup */}
      {notePicker && pickerTrack && (
        <div className="note-picker-overlay" onClick={e => e.stopPropagation()}>
          <div className="note-picker-popup">
            <div className="note-picker-header">
              <span>{pickerTrack.icon} {pickerTrack.name} — Step {notePicker.stepIdx + 1}</span>
              <button className="note-picker-close" onClick={() => setNotePicker(null)}>✕</button>
            </div>
            <div className="note-picker-hint">Click a note to set it. Scroll to see all octaves.</div>
            <div className="note-picker-grid">
              {NOTE_OPTIONS.map(({ label, midi }) => (
                <button
                  key={midi}
                  className={`note-picker-btn${midi === pickerCurrentMidi ? " note-picker-selected" : ""}${ALL_NOTES.indexOf(label.replace(/\d/g, "")) === 0 ? " note-picker-c" : ""}${label.includes("#") ? " note-picker-sharp" : ""}`}
                  onClick={() => setStepNote(notePicker.trackId, notePicker.stepIdx, midi)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="songlab-topbar">
        <div className="songlab-topbar-left">
          <button className="back-btn" onClick={() => { stopSequencer(); navigate("/menu"); }}>← Menu</button>
          <h1 className="songlab-title">🎼 SongLab</h1>
        </div>
        <div className="songlab-controls">
          <div className="bpm-control">
            <span className="bpm-label">BPM</span>
            <span className="bpm-value">{bpm}</span>
            <input
              type="range" className="bpm-slider" min="40" max="220" value={bpm}
              onChange={e => { setBpm(+e.target.value); if (isPlaying) stopSequencer(); }}
              style={{ background: sliderBg((bpm - 40) / 180) }}
            />
          </div>
          <button className="clear-btn" onClick={clearAll}>🗑 Clear</button>
          <button
            className={`play-btn${isPlaying ? " playing" : ""}`}
            onClick={isPlaying ? stopSequencer : startSequencer}
          >
            {isPlaying ? "⏹ Stop" : "▶ Play"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="songlab-legend">
        <span className="legend-item"><span className="legend-dot legend-left" />Left-click step to toggle on/off</span>
        <span className="legend-item"><span className="legend-dot legend-right" />Right-click an active melodic step to change its note</span>
        <span className="legend-item"><span className="legend-dot legend-track" />Use the note selector on each melodic track to set a default note for all steps</span>
      </div>

      {/* Sequencer Grid */}
      <div className="sequencer-wrapper">
        {/* Header */}
        <div className="sequencer-header">
          <div className="seq-header-track">Track</div>
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={i}
              className={`seq-header-beat${i % 4 === 0 ? " beat-one" : ""}${currentStep === i ? " active-beat" : ""}`}
            >
              {i % 4 === 0 ? i / 4 + 1 : "·"}
            </div>
          ))}
          <div className="seq-header-vol">Vol</div>
        </div>

        {/* Tracks */}
        {tracks.map(track => {
          const isMelodic = MELODIC_IDS.includes(track.instrumentId);
          return (
            <div key={track.id} className="track-row">
              <div className="track-info">
                <span className="track-icon">{track.icon}</span>
                <div className="track-info-col">
                  <span className="track-name">{track.name}</span>
                  {isMelodic && (
                    <div className="track-note-selector">
                      <span className="track-note-label">Default:</span>
                      <select
                        className="track-note-select"
                        value={track.defaultMidi}
                        onChange={e => setTrackDefaultNote(track.id, +e.target.value)}
                        title="Set note for all active steps on this track"
                      >
                        {NOTE_OPTIONS.map(({ label, midi }) => (
                          <option key={midi} value={midi}>{label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <button className="track-remove" onClick={() => removeTrack(track.id)} aria-label={`Remove ${track.name}`}>×</button>
              </div>

              {track.steps.map((stepVal, i) => {
                const isOn = stepVal !== null;
                const noteObj = isOn && isMelodic ? NOTE_OPTIONS.find(n => n.midi === stepVal) : null;
                const noteLabel = noteObj ? noteObj.label : null;
                return (
                  <button
                    key={i}
                    className={`step-btn${isOn ? " active" : ""}${isOn && i % 4 === 0 ? " beat-one-col" : ""}${currentStep === i ? " playing-step" : ""}${isOn && isMelodic ? " has-note" : ""}`}
                    onClick={() => toggleStep(track.id, i)}
                    onContextMenu={(e) => handleStepRightClick(e, track, i)}
                    title={isMelodic && isOn ? `Note: ${noteLabel} — right-click to change` : isMelodic ? "Left-click to enable, then right-click to pick note" : ""}
                    aria-label={`Step ${i + 1} ${isOn ? "on" : "off"}`}
                  >
                    {isOn && isMelodic && noteLabel && (
                      <span className="step-note-label">{noteLabel}</span>
                    )}
                  </button>
                );
              })}

              <div>
                <input
                  type="range" className="vol-slider" min="0" max="1" step="0.01"
                  value={track.volume}
                  onChange={e => setVolume(track.id, +e.target.value)}
                  style={{ background: sliderBg(track.volume) }}
                />
              </div>
            </div>
          );
        })}

        {/* Add Track Row */}
        <div className="add-track-row">
          <span className="add-track-label">+ Add Track:</span>
          {availableToAdd.map(inst => (
            <button key={inst.id} className="instrument-chip" onClick={() => addTrack(inst.id)}>
              {inst.icon} {inst.name}
            </button>
          ))}
          {tracks.length >= 8 && (
            <span className="add-track-label" style={{ color: "var(--secondary-color)" }}>Max 8 tracks</span>
          )}
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="songlab-panels">
        {/* Chord Picker */}
        <div className="info-panel">
          <div className="info-panel-title">🎵 Chord Picker</div>
          <div className="key-select-row">
            <select className="form-select" value={selectedKey} onChange={e => setSelectedKey(e.target.value)} style={{ flex: 1 }}>
              {ALL_NOTES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select className="form-select" value={selectedScale} onChange={e => setSelectedScale(e.target.value)} style={{ flex: 1 }}>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="pentatonic">Pentatonic</option>
              <option value="blues">Blues</option>
            </select>
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
            Click to build your progression:
          </p>
          <div className="chords-grid">
            {scaleChords.map(ch => (
              <button
                key={ch}
                className={`chord-chip${selectedChords.includes(ch) ? " selected" : ""}`}
                onClick={() => toggleChord(ch)}
              >
                {ch}
              </button>
            ))}
          </div>
          {selectedChords.length > 0 && (
            <div style={{ marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "var(--surface-offset)", borderRadius: "var(--r-md)", border: "2px solid var(--border-color)", fontSize: "var(--text-sm)", fontWeight: "700", color: "var(--primary-color)", letterSpacing: "1px" }}>
              {selectedChords.join(" → ")}
              <button onClick={() => setSelectedChords([])} style={{ marginLeft: "var(--sp-3)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
            </div>
          )}
        </div>

        {/* Blueprint Export */}
        <div className="info-panel">
          <div className="info-panel-title">📋 Song Blueprint</div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
            Export a text summary of your pattern including all per-step notes.
          </p>
          <button className="btn-primary" style={{ marginBottom: "var(--sp-3)", width: "100%" }} onClick={() => setShowExport(v => !v)}>
            {showExport ? "Hide Blueprint" : "Generate Blueprint"}
          </button>
          {showExport && <pre className="export-box">{buildExport()}</pre>}
          {showExport && (
            <button
              className="btn-secondary"
              style={{ marginTop: "var(--sp-3)", width: "100%" }}
              onClick={() => {
                const blob = new Blob([buildExport()], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "songlab-blueprint.txt";
                a.click();
              }}
            >
              ⬇ Download .txt
            </button>
          )}
          <div style={{ marginTop: "var(--sp-4)", padding: "var(--sp-3)", background: "var(--surface-offset)", border: "2px solid var(--border-color)", borderRadius: "var(--r-md)" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "var(--sp-2)" }}>Quick Stats</div>
            <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap" }}>
              {[
                { label: "Tracks", value: tracks.length },
                { label: "BPM", value: bpm },
                { label: "Active Steps", value: tracks.reduce((a, t) => a + t.steps.filter(s => s !== null).length, 0) },
                { label: "Key", value: `${selectedKey} ${selectedScale}` },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "var(--text-lg)", fontWeight: "700", color: "var(--primary-color)", fontFamily: "var(--font-display)" }}>{s.value}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
