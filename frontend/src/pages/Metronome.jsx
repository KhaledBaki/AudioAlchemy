import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Metronome.css";
import Mascot from "../components/Mascot";

const TIME_SIGS = [
  { label:"4/4", value:"4/4", beats:4 },
  { label:"3/4", value:"3/4", beats:3 },
  { label:"6/8", value:"6/8", beats:6 },
  { label:"2/4", value:"2/4", beats:2 },
  { label:"5/4", value:"5/4", beats:5 },
  { label:"7/8", value:"7/8", beats:7 },
];

const PRESETS = [
  { label:"60",  sub:"Largo" },
  { label:"76",  sub:"Adagio" },
  { label:"100", sub:"Andante" },
  { label:"120", sub:"Moderato" },
  { label:"140", sub:"Allegro" },
  { label:"180", sub:"Presto" },
];

export default function Metronome() {
  const navigate = useNavigate();
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isBopping, setIsBopping] = useState(false);
  const [pendulumSide, setPendulumSide] = useState("left");
  const [timeSig, setTimeSig] = useState("4/4");

  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  const selectedTS = TIME_SIGS.find(t => t.value === timeSig);

  const playClick = (accented) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = accented ? 1200 : 880;
    osc.type = "triangle";
    gain.gain.setValueAtTime(accented ? 0.7 : 0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.06);
  };

  const startMetronome = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setCurrentBeat(0);
    const ms = (60/bpm)*1000;
    let beat = 0;
    intervalRef.current = setInterval(() => {
      const isFirst = beat % selectedTS.beats === 0;
      playClick(isFirst);
      setCurrentBeat(beat % selectedTS.beats);
      setPendulumSide(s => s === "left" ? "right" : "left");
      setIsBopping(true);
      setTimeout(() => setIsBopping(false), 100);
      beat++;
    }, ms);
  };

  const stopMetronome = () => {
    setIsPlaying(false); setCurrentBeat(0); setIsBopping(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="metronome-page">
      <div className="metro-bg-orb-1" /><div className="metro-bg-orb-2" />

      <div className="metro-topbar">
        <button className="metro-back-btn" onClick={() => { stopMetronome(); navigate("/menu"); }}>← Menu</button>
        <span className="metro-topbar-title">Metronome</span>
        {isPlaying && <span className="badge badge-gold" style={{marginLeft:"auto"}}>● {bpm} BPM</span>}
      </div>

      <div className="metronome-card">
        <div className="metro-card-inner">

          {/* Mascot */}
          <div className="metro-mascot-wrap">
            <Mascot isBopping={isBopping} label="Keeping the beat!" />
          </div>

          {/* BPM */}
          <div className="metro-bpm-display">
            <div className="bpm-display">{bpm}</div>
            <div className="bpm-label">Beats Per Minute</div>
          </div>

          {/* Slider */}
          <div className="metro-slider-wrap">
            <input
              type="range" className="bpm-slider" min="40" max="240" value={bpm}
              onChange={e => { setBpm(Number(e.target.value)); if (isPlaying) stopMetronome(); }}
            />
            <div className="metro-slider-labels"><span>40</span><span>120</span><span>240</span></div>
          </div>

          {/* Presets */}
          <div className="metro-presets">
            {PRESETS.map(p => (
              <button
                key={p.label}
                className={`metro-preset-btn${Number(p.label) === bpm ? " active" : ""}`}
                onClick={() => { setBpm(Number(p.label)); if (isPlaying) stopMetronome(); }}
              >
                <span>{p.label}</span>
                <span>{p.sub}</span>
              </button>
            ))}
          </div>

          {/* Time signature */}
          <div className="metro-timesig-row">
            <div className="metro-timesig-label">Time Signature</div>
            <select className="time-sig-select" value={timeSig}
              onChange={e => { setTimeSig(e.target.value); if (isPlaying) stopMetronome(); }}>
              {TIME_SIGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Controls */}
          <div className="metronome-controls">
            <button className="start-button" onClick={startMetronome} disabled={isPlaying}>▶ Start</button>
            <button className="stop-button" onClick={stopMetronome} disabled={!isPlaying}>■ Stop</button>
          </div>

          {/* Beat dots */}
          <div className="beat-dots">
            {Array.from({length: selectedTS.beats}).map((_, i) => (
              <div key={i} className={`beat-dot${isPlaying && currentBeat === i ? " active-dot" : ""}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
