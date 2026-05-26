import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Freeform.css";

const FUNDAMENTAL_KEYS = ["1","2","3","4","5","6","7","8","9","0","-","="];
const FUNDAMENTAL_CHORDS = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
const VARIATION_KEYS = ["q","w","e","r","t","y","u","i","o"];
const VARIATIONS = [
  { label: "Major", suffix: "", intervals: [0,4,7] },
  { label: "Minor", suffix: "m", intervals: [0,3,7] },
  { label: "maj7",  suffix: "maj7", intervals: [0,4,7,11] },
  { label: "m7",    suffix: "m7",   intervals: [0,3,7,10] },
  { label: "sus2",  suffix: "sus2", intervals: [0,2,7] },
  { label: "sus4",  suffix: "sus4", intervals: [0,5,7] },
  { label: "dim",   suffix: "dim",  intervals: [0,3,6] },
  { label: "aug",   suffix: "aug",  intervals: [0,4,8] },
  { label: "dom7",  suffix: "7",    intervals: [0,4,7,10] },
];
const MUSIC_CIRCLE = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];
const NOTE_SEMITONE = { C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11 };

function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function getRootMidi(n) { return 60 + (NOTE_SEMITONE[n] ?? 0); }
function buildChordName(root, variation) {
  if (!variation || variation.label === "Major") return root;
  if (variation.label === "Minor") return `${root}m`;
  return `${root}${variation.suffix}`;
}

export default function Freeform() {
  const navigate = useNavigate();
  const [activeRoot, setActiveRoot] = useState("C");
  const [activeVarIdx, setActiveVarIdx] = useState(0);
  const [history, setHistory] = useState([]);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef(null);
  const activeChordRef = useRef(null);
  const heldFundRef = useRef(null);
  const heldVarRef = useRef(null);

  const activeVariation = VARIATIONS[activeVarIdx];
  const displayedChord = useMemo(() => buildChordName(activeRoot, activeVariation), [activeRoot, activeVariation]);

  const ensureCtx = async () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === "suspended")
      await audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const stopChord = () => {
    const active = activeChordRef.current;
    if (!active) return;
    const { ctx, gainNodes, oscillators } = active;
    const now = ctx.currentTime;
    gainNodes.forEach(g => { try { g.gain.cancelScheduledValues(now); g.gain.setTargetAtTime(0.0001, now, 0.08); } catch(e){} });
    oscillators.forEach(o => { try { o.stop(now + 0.35); } catch(e){} });
    activeChordRef.current = null;
    setIsPlaying(false);
  };

  const startChord = async (root, variation) => {
    const ctx = await ensureCtx();
    stopChord();
    const rootMidi = getRootMidi(root);
    const now = ctx.currentTime;
    const oscillators = [], gainNodes = [];
    variation.intervals.forEach((interval, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(midiToFreq(rootMidi + interval + (idx === 0 ? -12 : 0)), now);
      filt.type = "lowpass"; filt.frequency.setValueAtTime(1600, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.08);
      osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      osc.start(now);
      oscillators.push(osc); gainNodes.push(gain);
    });
    activeChordRef.current = { ctx, oscillators, gainNodes };
    setIsPlaying(true);
  };

  const play = async (root, varIdx) => {
    const variation = VARIATIONS[varIdx];
    setActiveRoot(root); setActiveVarIdx(varIdx);
    const name = buildChordName(root, variation);
    setHistory(prev => [name, ...prev].slice(0, 16));
    await startChord(root, variation);
  };

  const maybeRelease = () => {
    if (heldFundRef.current === null && heldVarRef.current === null) stopChord();
  };

  useEffect(() => {
    const onDown = async (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const key = e.key.toLowerCase();
      setPressedKeys(prev => { if (prev.has(key)) return prev; const n = new Set(prev); n.add(key); return n; });
      const fi = FUNDAMENTAL_KEYS.indexOf(key);
      if (fi !== -1 && !e.repeat) {
        e.preventDefault(); heldFundRef.current = fi;
        await play(FUNDAMENTAL_CHORDS[fi], heldVarRef.current ?? activeVarIdx);
        return;
      }
      const vi = VARIATION_KEYS.indexOf(key);
      if (vi !== -1 && !e.repeat) {
        e.preventDefault(); heldVarRef.current = vi;
        await play(heldFundRef.current !== null ? FUNDAMENTAL_CHORDS[heldFundRef.current] : activeRoot, vi);
      }
    };
    const onUp = (e) => {
      const key = e.key.toLowerCase();
      setPressedKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
      const fi = FUNDAMENTAL_KEYS.indexOf(key);
      if (fi !== -1) { if (heldFundRef.current === fi) heldFundRef.current = null; maybeRelease(); }
      const vi = VARIATION_KEYS.indexOf(key);
      if (vi !== -1) { if (heldVarRef.current === vi) heldVarRef.current = null; maybeRelease(); }
    };
    const onBlur = () => {
      heldFundRef.current = null; heldVarRef.current = null;
      setPressedKeys(new Set()); stopChord();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      stopChord();
    };
  }, [activeRoot, activeVarIdx]);

  const onFundDown = async (i) => { heldFundRef.current = i; await play(FUNDAMENTAL_CHORDS[i], heldVarRef.current ?? activeVarIdx); };
  const onVarDown  = async (i) => { heldVarRef.current = i; await play(heldFundRef.current !== null ? FUNDAMENTAL_CHORDS[heldFundRef.current] : activeRoot, i); };
  const onUp = () => { heldFundRef.current = null; heldVarRef.current = null; stopChord(); };

  return (
    <div className="freeform-page">
      <div className="freeform-bg-orb-1" />

      <div className="freeform-topbar">
        <button className="freeform-back-btn" onClick={() => navigate("/menu")}>← Menu</button>
        <span style={{fontFamily:'var(--font-heading)',fontWeight:700,fontSize:'0.9rem',color:'var(--text-bright)'}}>Freeform Play</span>
        <div className="freeform-topbar-info">
          <div className={`freeform-live-chord${isPlaying ? " active" : ""}`}>
            {isPlaying ? "♪ " : ""}{displayedChord}
          </div>
        </div>
      </div>

      <div className="freeform-layout">
        {/* Left — circle + status */}
        <div className="freeform-circle-panel">
          <div className="freeform-panel-label">Circle of Fifths</div>

          <div className="music-circle">
            {MUSIC_CIRCLE.map((chord, i) => {
              const angle = (i / MUSIC_CIRCLE.length) * Math.PI * 2 - Math.PI / 2;
              const r = 120;
              return (
                <div
                  key={chord}
                  className={`circle-chord${chord === activeRoot ? " active" : ""}`}
                  style={{ transform: `translate(${Math.cos(angle)*r}px, ${Math.sin(angle)*r}px)` }}
                >
                  {chord}
                </div>
              );
            })}
            <div className="circle-center">
              <span>Live Chord</span>
              <strong>{displayedChord}</strong>
              <small>{pressedKeys.size > 0 ? "Holding…" : "Press key"}</small>
            </div>
          </div>

          <div className="freeform-status">
            {[["Root", activeRoot], ["Variation", activeVariation.label], ["Chord", displayedChord]].map(([k,v]) => (
              <div key={k} className="freeform-status-row">
                <span className="freeform-status-key">{k}</span>
                <span className="freeform-status-val">{v}</span>
              </div>
            ))}
          </div>

          <div className="freeform-panel-label">Recent Chords</div>
          <div className="freeform-history-list">
            {history.length === 0
              ? <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--text-ghost)'}}>Play something…</span>
              : history.map((ch, i) => (
                <div key={`${ch}-${i}`} className="freeform-history-item">
                  <span className="freeform-history-chord">{ch}</span>
                  <span className="freeform-history-idx">#{i+1}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Right — keyboard */}
        <div className="freeform-keys-panel">
          <div className="freeform-instructions">
            {[["1–=","Root notes"],["q–o","Chord type"],["Hold","Sustain"]].map(([k,v]) => (
              <div key={k} className="freeform-instruction-chip"><kbd>{k}</kbd>{v}</div>
            ))}
          </div>

          <div className="freeform-key-section">
            <div className="freeform-key-section-title">Fundamental Chords (1 – =)</div>
            <div className="freeform-key-grid freeform-key-grid-fundamentals">
              {FUNDAMENTAL_CHORDS.map((chord, i) => (
                <button
                  key={`${chord}-${i}`}
                  className={`key-button${pressedKeys.has(FUNDAMENTAL_KEYS[i]) ? " pressed" : ""}`}
                  onMouseDown={() => onFundDown(i)} onMouseUp={onUp} onMouseLeave={onUp}
                  onTouchStart={(e) => { e.preventDefault(); onFundDown(i); }} onTouchEnd={onUp}
                >
                  <span className="keycap">{FUNDAMENTAL_KEYS[i]}</span>
                  <span className="key-name">{chord}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="freeform-key-section">
            <div className="freeform-key-section-title">Variations (q – o)</div>
            <div className="freeform-key-grid freeform-key-grid-variations">
              {VARIATIONS.map((v, i) => (
                <button
                  key={v.label}
                  className={`key-button variation-button${pressedKeys.has(VARIATION_KEYS[i]) ? " pressed" : ""}`}
                  onMouseDown={() => onVarDown(i)} onMouseUp={onUp} onMouseLeave={onUp}
                  onTouchStart={(e) => { e.preventDefault(); onVarDown(i); }} onTouchEnd={onUp}
                >
                  <span className="keycap">{VARIATION_KEYS[i]}</span>
                  <span className="key-name">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
