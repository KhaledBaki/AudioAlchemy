import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Metronome.css";
import Mascot from "../components/Mascot";

const TIME_SIGS = [
    { label: "2/4", value: "2/4", beats: 2 },
    { label: "3/4", value: "3/4", beats: 3 },
    { label: "4/4", value: "4/4", beats: 4 },
    { label: "5/4", value: "5/4", beats: 5 },
    { label: "6/8", value: "6/8", beats: 6 },
    { label: "7/8", value: "7/8", beats: 7 },
];

function Metronome() {
    const navigate = useNavigate();
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(-1);
    const [isMascotBopping, setIsMascotBopping] = useState(false);
    const [timeSignature, setTimeSignature] = useState("4/4");

    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);
    const tapTimesRef = useRef([]);

    const sig = TIME_SIGS.find(t => t.value === timeSignature) || TIME_SIGS[2];

    function playClick(accented) {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = accented ? 1050 : 820;
        osc.type = "sine";
        gain.gain.setValueAtTime(accented ? 0.7 : 0.45, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
    }

    function startMetronome() {
        if (isPlaying) return;
        setIsPlaying(true);
        let beat = 0;
        setCurrentBeat(0);
        playClick(true);
        setIsMascotBopping(true);
        setTimeout(() => setIsMascotBopping(false), 100);
        intervalRef.current = setInterval(() => {
            beat = (beat + 1) % sig.beats;
            playClick(beat === 0);
            setCurrentBeat(beat);
            setIsMascotBopping(true);
            setTimeout(() => setIsMascotBopping(false), 80);
        }, (60 / bpm) * 1000);
    }

    function stopMetronome() {
        setIsPlaying(false);
        setCurrentBeat(-1);
        setIsMascotBopping(false);
        clearInterval(intervalRef.current);
    }

    function handleTap() {
        const now = Date.now();
        tapTimesRef.current = [...tapTimesRef.current.filter(t => now - t < 3000), now];
        if (tapTimesRef.current.length >= 2) {
            const gaps = tapTimesRef.current.slice(1).map((t, i) => t - tapTimesRef.current[i]);
            const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
            const newBpm = Math.round(60000 / avg);
            if (newBpm >= 40 && newBpm <= 240) {
                setBpm(newBpm);
                if (isPlaying) stopMetronome();
            }
        }
    }

    useEffect(() => () => clearInterval(intervalRef.current), []);

    const sliderPct = ((bpm - 40) / 200) * 100;

    return (
        <div className="metronome-page">
            <button className="back-button" onClick={() => { stopMetronome(); navigate("/menu"); }}>
                ← Back to Menu
            </button>

            <div className="metronome-card">
                <h1 className="metronome-title">🥁 Metronome</h1>
                <p className="metronome-subtitle">Set your tempo and keep perfect time</p>

                <Mascot isBopping={isMascotBopping} label="Keeping the beat!" />

                <div className="bpm-display">{bpm}</div>
                <div className="bpm-label">BPM</div>

                <input
                    type="range"
                    className="bpm-slider"
                    min="40"
                    max="240"
                    value={bpm}
                    style={{ "--pct": `${sliderPct}%` }}
                    onChange={e => { setBpm(+e.target.value); if (isPlaying) stopMetronome(); }}
                />

                <div className="beat-visualizer">
                    {Array.from({ length: sig.beats }, (_, i) => (
                        <div
                            key={i}
                            className={`beat-dot${i === 0 ? " beat-one" : ""}${currentBeat === i ? " active" : ""}`}
                        />
                    ))}
                </div>

                <label className="time-sig-label">Time Signature</label>
                <select
                    className="time-sig-select"
                    value={timeSignature}
                    onChange={e => { setTimeSignature(e.target.value); if (isPlaying) stopMetronome(); }}
                >
                    {TIME_SIGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                <div className="metronome-controls">
                    {!isPlaying
                        ? <button className="start-button" onClick={startMetronome}>▶ Start</button>
                        : <button className="stop-button" onClick={stopMetronome}>⏹ Stop</button>
                    }
                </div>

                <button className="metronome-tap-btn" onClick={handleTap}>
                    🎵 Tap Tempo
                </button>
            </div>
        </div>
    );
}

export default Metronome;
