import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Metronome.css";
import Mascot from "../components/Mascot";

function Metronome() {
    const navigate = useNavigate();

    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0);
    const [isMascotBopping, setIsMascotBopping] = useState(false);
    const [timeSignature, setTimeSignature] = useState("4/4");

    const audioContextRef = useRef(null);
    const intervalRef = useRef(null);

    const timeSignatureOptions = [
        { label: "4/4", value: "4/4", beats: 4 },
        { label: "3/4", value: "3/4", beats: 3 },
        { label: "6/8", value: "6/8", beats: 6 },
        { label: "3/2", value: "3/2", beats: 3 },
        { label: "2/4", value: "2/4", beats: 2 },
        { label: "5/4", value: "5/4", beats: 5 },
    ];

    const selectedTimeSignature = timeSignatureOptions.find(
        (option) => option.value === timeSignature
    );

    function playClickSound(isAccented) {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }

        const audioCtx = audioContextRef.current;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = isAccented ? 1000 : 800;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioCtx.currentTime + 0.05
        );

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.05);
    }

    function startMetronome() {
        if (isPlaying) return;

        setIsPlaying(true);
        setCurrentBeat(0);

        const millisecondsPerBeat = (60 / bpm) * 1000;
        let beatCount = 0;

        intervalRef.current = setInterval(() => {
            const isFirstBeat = beatCount % selectedTimeSignature.beats === 0;

            playClickSound(isFirstBeat);
            setCurrentBeat(beatCount % selectedTimeSignature.beats);

            setIsMascotBopping(true);
            setTimeout(() => setIsMascotBopping(false), 100);

            beatCount++;
        }, millisecondsPerBeat);
    }

    function stopMetronome() {
        setIsPlaying(false);
        setCurrentBeat(0);
        setIsMascotBopping(false);
        clearInterval(intervalRef.current);
    }

    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div className="metronome-page">
            <button
                className="back-button"
                onClick={() => {
                    stopMetronome();
                    navigate("/menu");
                }}
            >
                ← Back to Menu
            </button>

            <div className="metronome-card">
                <h1 className="metronome-title">Metronome</h1>
                <p className="metronome-subtitle">Set your rhythm and tempo</p>

                <Mascot isBopping={isMascotBopping} label="Keeping the beat!" />

                <div className="bpm-display">{bpm}</div>
                <div className="bpm-label">BPM</div>

                <input
                    type="range"
                    className="bpm-slider"
                    min="40"
                    max="240"
                    value={bpm}
                    onChange={(e) => {
                        setBpm(Number(e.target.value));
                        if (isPlaying) {
                            stopMetronome();
                        }
                    }}
                />

                <label className="time-sig-label">Time Signature</label>
                <select
                    className="time-sig-select"
                    value={timeSignature}
                    onChange={(e) => {
                        setTimeSignature(e.target.value);
                        if (isPlaying) {
                            stopMetronome();
                        }
                    }}
                >
                    {timeSignatureOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="metronome-controls">
                    <button className="start-button" onClick={startMetronome}>
                        ▶ Start
                    </button>
                    <button className="stop-button" onClick={stopMetronome}>
                        ■ Stop
                    </button>
                </div>

                <div className="beat-dots">
                    {Array.from({ length: selectedTimeSignature.beats }).map((_, index) => (
                        <div
                            key={index}
                            className={
                                isPlaying && currentBeat === index
                                    ? "beat-dot active-dot"
                                    : "beat-dot"
                            }
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Metronome;