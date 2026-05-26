import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Backtracking.css";
import { getAvailableKeys, getCustomChordTypes, getDiatonicChords, getInstrumentOptions } from "../utils/musicTheory";

export default function Backtracking() {
  const [scaleType, setScaleType] = useState("major");
  const [selectedKey, setSelectedKey] = useState("C");
  const [bpm, setBpm] = useState(100);
  const [instrument, setInstrument] = useState("Warm Pad");
  const [progression, setProgression] = useState(["C","F","G","C"]);
  const [customProgression, setCustomProgression] = useState([
    {root:"C",type:""},{root:"F",type:""},{root:"G",type:"7"},{root:"C",type:""}
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  const audioContextRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const activeNodesRef = useRef([]);

  const availableKeys = useMemo(() => getAvailableKeys(), []);
  const customChordTypes = useMemo(() => getCustomChordTypes(), []);
  const instrumentOptions = useMemo(() => getInstrumentOptions(), []);
  const availableChords = useMemo(() => scaleType === "custom" ? [] : getDiatonicChords(selectedKey, scaleType), [selectedKey, scaleType]);

  useEffect(() => {
    if (scaleType !== "custom") setProgression(getDiatonicChords(selectedKey, scaleType).slice(0, 4));
  }, [selectedKey, scaleType]);

  useEffect(() => () => stopBackingTrack(), []);

  const handleChordChange = (i, v) => { const u = [...progression]; u[i] = v; setProgression(u); };
  const handleCustomRoot = (i, v) => { const u = [...customProgression]; u[i].root = v; setCustomProgression(u); };
  const handleCustomType = (i, v) => { const u = [...customProgression]; u[i].type = v; setCustomProgression(u); };

  const addChord = () => {
    if (scaleType === "custom") { setCustomProgression([...customProgression, {root:"C",type:""}]); return; }
    setProgression([...progression, availableChords[0] || "C"]);
  };
  const removeChord = () => {
    if (scaleType === "custom") { if (customProgression.length > 1) setCustomProgression(customProgression.slice(0,-1)); return; }
    if (progression.length > 1) setProgression(progression.slice(0,-1));
  };

  const getChromaticNotes = () => ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const getNoteAt = (start, offset) => { const c = getChromaticNotes(); return c[(c.indexOf(start)+offset)%c.length]; };

  const getChordNotes = (name) => {
    const root = name.replace(/maj7|sus2|sus4|aug|dim|m7|7|m/g, "");
    if (name.endsWith("maj7")) return [root, getNoteAt(root,4), getNoteAt(root,7), getNoteAt(root,11)];
    if (name.endsWith("m7"))   return [root, getNoteAt(root,3), getNoteAt(root,7), getNoteAt(root,10)];
    if (name.endsWith("7"))    return [root, getNoteAt(root,4), getNoteAt(root,7), getNoteAt(root,10)];
    if (name.endsWith("sus2")) return [root, getNoteAt(root,2), getNoteAt(root,7)];
    if (name.endsWith("sus4")) return [root, getNoteAt(root,5), getNoteAt(root,7)];
    if (name.endsWith("aug"))  return [root, getNoteAt(root,4), getNoteAt(root,8)];
    if (name.endsWith("dim"))  return [root, getNoteAt(root,3), getNoteAt(root,6)];
    if (name.endsWith("m"))    return [root, getNoteAt(root,3), getNoteAt(root,7)];
    return [root, getNoteAt(root,4), getNoteAt(root,7)];
  };

  const getFreq = (note, octave=4) => {
    const nm = {C:0,"C#":1,D:2,"D#":3,E:4,F:5,"F#":6,G:7,"G#":8,A:9,"A#":10,B:11};
    return 440 * Math.pow(2, ((octave+1)*12 + nm[note] - 69) / 12);
  };

  const createEnvelope = (gain, now, dur, inst) => {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0.0001, now);
    if (inst === "Bell Tone") { gain.gain.linearRampToValueAtTime(0.16, now+0.02); gain.gain.exponentialRampToValueAtTime(0.0001, now+Math.max(0.2,dur*0.8)); return; }
    if (inst === "Orchestral") { gain.gain.linearRampToValueAtTime(0.14, now+0.18); gain.gain.linearRampToValueAtTime(0.10, now+dur*0.75); gain.gain.linearRampToValueAtTime(0.0001, now+dur); return; }
    gain.gain.linearRampToValueAtTime(0.16, now+0.05);
    gain.gain.linearRampToValueAtTime(0.0001, now+dur-0.05);
  };

  const buildVoice = (ctx, freq, inst, idx) => {
    const osc = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    if (inst === "Orchestral") { osc.type = "sawtooth"; filt.type = "lowpass"; filt.frequency.setValueAtTime(1200, ctx.currentTime); if (idx>0) osc.detune.setValueAtTime(idx*4, ctx.currentTime); }
    else if (inst === "Woodwind") { osc.type = "triangle"; filt.type = "lowpass"; filt.frequency.setValueAtTime(1400, ctx.currentTime); }
    else if (inst === "Soft Organ") { osc.type = "square"; filt.type = "lowpass"; filt.frequency.setValueAtTime(1300, ctx.currentTime); }
    else if (inst === "Bell Tone") { osc.type = "triangle"; filt.type = "highpass"; filt.frequency.setValueAtTime(500, ctx.currentTime); }
    else { osc.type = "sine"; filt.type = "lowpass"; filt.frequency.setValueAtTime(1600, ctx.currentTime); }
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(filt);
    return { osc, filt };
  };

  const getCurrentProg = () => scaleType === "custom" ? customProgression.map(c => c.root+c.type) : progression;

  const clearNodes = () => {
    activeNodesRef.current.forEach(g => g.oscillators.forEach(o => { try { o.stop(); } catch(e){} }));
    activeNodesRef.current = [];
  };

  const playChord = (name, dur) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const notes = getChordNotes(name);
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    createEnvelope(masterGain, now, dur, instrument);
    const oscillators = notes.map((note, i) => {
      const freq = getFreq(note, i === 0 ? 3 : 4);
      const { osc, filt } = buildVoice(ctx, freq, instrument, i);
      filt.connect(masterGain);
      osc.start(now); osc.stop(now+dur);
      return osc;
    });
    activeNodesRef.current.push({ oscillators, gainNode: masterGain });
  };

  const startBackingTrack = async () => {
    if (isPlaying) return;
    if (!audioContextRef.current) audioContextRef.current = new window.AudioContext();
    if (audioContextRef.current.state === "suspended") await audioContextRef.current.resume();
    const prog = getCurrentProg();
    setIsPlaying(true);
    const chordDur = (60/bpm)*4;
    let idx = 0;
    playChord(prog[idx], chordDur);
    playbackIntervalRef.current = setInterval(() => {
      idx = (idx+1) % prog.length;
      playChord(prog[idx], chordDur);
    }, chordDur*1000);
  };

  const stopBackingTrack = () => {
    if (playbackIntervalRef.current) { clearInterval(playbackIntervalRef.current); playbackIntervalRef.current = null; }
    clearNodes();
    setIsPlaying(false);
  };

  const currentProg = getCurrentProg();

  return (
    <div className="backtracking-page">
      <div className="bt-bg-orb-1" /><div className="bt-bg-orb-2" />

      <div className="backtracking-topbar">
        <button className="bt-back-btn" onClick={() => navigate("/menu")}>← Menu</button>
        <span className="bt-topbar-title">Backing Track Generator</span>
        {isPlaying && (
          <div className="bt-play-indicator">
            <div className="bt-play-dot" /> Playing
          </div>
        )}
      </div>

      <div className="bt-content">
        <div className="bt-header">
          <h1 className="backtracking-title">Backing Track</h1>
          <p className="backtracking-subtitle">Build chord progressions, choose an instrument color, and improvise over a live backing track.</p>
        </div>

        <div className="bt-controls-grid">
          {[
            { id:"scaleType", label:"Mode", value:scaleType, onChange:e=>setScaleType(e.target.value), opts:[["major","Major"],["minor","Minor"],["custom","Custom"]] },
            { id:"key", label:"Root Key", value:selectedKey, onChange:e=>setSelectedKey(e.target.value), opts:availableKeys.map(k=>[k,k]), disabled: isPlaying || scaleType==="custom" },
            { id:"inst", label:"Instrument", value:instrument, onChange:e=>setInstrument(e.target.value), opts:instrumentOptions.map(o=>[o,o]) },
          ].map(f => (
            <div key={f.id} className="form-group">
              <label htmlFor={f.id}>{f.label}</label>
              <select id={f.id} value={f.value} onChange={f.onChange} disabled={f.disabled || isPlaying}>
                {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="bpm">Tempo — {bpm} BPM</label>
            <input id="bpm" type="range" min="60" max="240" value={bpm}
              onChange={e => { setBpm(Number(e.target.value)); if (isPlaying) stopBackingTrack(); }}
              disabled={isPlaying} />
          </div>
        </div>

        <div className="bt-toolbar">
          {[["+ Add Chord", addChord], ["− Remove Last", removeChord]].map(([label, fn]) => (
            <button key={label} className="bt-btn bt-btn-ghost" onClick={fn} disabled={isPlaying}>{label}</button>
          ))}
        </div>

        <div className="bt-progression-section">
          <div className="bt-section-label">
            {scaleType !== "custom" ? "Diatonic Chord Progression" : "Custom Chord Progression"}
          </div>
          {scaleType !== "custom" ? (
            <div className="progression-grid dynamic-grid">
              {progression.map((chord, i) => (
                <div key={`chord-${i}`} className="form-group">
                  <label>Chord {i+1}</label>
                  <select value={chord} onChange={e=>handleChordChange(i,e.target.value)} disabled={isPlaying}>
                    {availableChords.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <div className="custom-progression-grid">
              {customProgression.map((chord, i) => (
                <div key={`cc-${i}`} className="custom-chord-card">
                  <h3>Chord {i+1}</h3>
                  <div className="form-group">
                    <label>Root</label>
                    <select value={chord.root} onChange={e=>handleCustomRoot(i,e.target.value)} disabled={isPlaying}>
                      {availableKeys.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{marginTop:'10px'}}>
                    <label>Quality</label>
                    <select value={chord.type} onChange={e=>handleCustomType(i,e.target.value)} disabled={isPlaying}>
                      {customChordTypes.map(t => <option key={t||"maj"} value={t}>{t===''?'Major':t}</option>)}
                    </select>
                  </div>
                  <p className="custom-chord-preview">{chord.root}{chord.type||''}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="selection-preview">
          {[
            ["Mode", scaleType, false],
            ["Key", scaleType==="custom"?"Custom":selectedKey, false],
            ["Instrument", instrument, false],
            ["Tempo", `${bpm} BPM`, false],
            ["Progression", currentProg.join(" › "), true],
          ].map(([k,v,hl]) => (
            <div key={k} className="preview-item">
              <span className="preview-key">{k}</span>
              <span className={`preview-val${hl?" highlight":""}`}>{v}</span>
            </div>
          ))}
        </div>

        <div className="backtracking-actions">
          <button className="backtracking-button secondary-button" onClick={stopBackingTrack} disabled={!isPlaying}>■ Stop</button>
          <button className="backtracking-button primary-button" onClick={startBackingTrack} disabled={isPlaying}>▶ Play Backing Track</button>
        </div>
      </div>
    </div>
  );
}
