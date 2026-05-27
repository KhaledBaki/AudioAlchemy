import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Freeform.css";

const FUNDAMENTAL_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];

/*
  Put your REAL 12 fundamental chords here in the exact order your project uses.
  Change these labels if your class/project uses a different exact set.
*/
const FUNDAMENTAL_CHORDS = [
    "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"
];

/*
  q to o = 9 variations
  Added base Major and Minor first, as requested.
  If your exact 9 variations differ, keep the same structure and just rename intervals/labels.
*/
const VARIATION_KEYS = ["q", "w", "e", "r", "t", "y", "u", "i", "o"];
const VARIATIONS = [
    { label: "Major", suffix: "", intervals: [0, 4, 7] },
    { label: "Minor", suffix: "m", intervals: [0, 3, 7] },
    { label: "maj7", suffix: "maj7", intervals: [0, 4, 7, 11] },
    { label: "m7", suffix: "m7", intervals: [0, 3, 7, 10] },
    { label: "sus2", suffix: "sus2", intervals: [0, 2, 7] },
    { label: "sus4", suffix: "sus4", intervals: [0, 5, 7] },
    { label: "dim", suffix: "dim", intervals: [0, 3, 6] },
    { label: "aug", suffix: "aug", intervals: [0, 4, 8] },
    { label: "7", suffix: "7", intervals: [0, 4, 7, 10] }
];

const MUSIC_CIRCLE = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];

const NOTE_TO_SEMITONE = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
};

function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

function getRootMidi(noteName) {
    const semitone = NOTE_TO_SEMITONE[noteName] ?? 0;
    return 60 + semitone;
}

function buildDisplayChord(root, variation) {
    if (!variation) return root;
    if (variation.label === "Major") return root;
    if (variation.label === "Minor") return `${root}m`;
    return `${root}${variation.suffix}`;
}

function Freeform() {
    const navigate = useNavigate();
    const [activeRoot, setActiveRoot] = useState("C");
    const [activeVariationIndex, setActiveVariationIndex] = useState(0);
    const [history, setHistory] = useState([]);
    const [pressedKeys, setPressedKeys] = useState(new Set());

    const audioContextRef = useRef(null);
    const activeChordRef = useRef(null);
    const heldFundamentalRef = useRef(null);
    const heldVariationRef = useRef(null);

    const activeVariation = VARIATIONS[activeVariationIndex];

    const displayedChord = useMemo(() => {
        return buildDisplayChord(activeRoot, activeVariation);
    }, [activeRoot, activeVariation]);

    const ensureAudioContext = async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume();
        }

        return audioContextRef.current;
    };

    const stopCurrentChord = () => {
        const active = activeChordRef.current;
        if (!active) return;

        const { ctx, gainNodes, oscillators } = active;
        const now = ctx.currentTime;

        gainNodes.forEach((gain) => {
            try {
                gain.gain.cancelScheduledValues(now);
                gain.gain.setTargetAtTime(0.0001, now, 0.08);
            } catch (e) {
                console.error(e);
            }
        });

        oscillators.forEach((osc) => {
            try {
                osc.stop(now + 0.4);
            } catch (e) {
                console.error(e);
            }
        });

        activeChordRef.current = null;
    };

    const startChord = async (root, variation) => {
        const ctx = await ensureAudioContext();

        stopCurrentChord();

        const rootMidi = getRootMidi(root);
        const now = ctx.currentTime;
        const oscillators = [];
        const gainNodes = [];

        variation.intervals.forEach((interval, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = index % 2 === 0 ? "sawtooth" : "triangle";
            osc.frequency.setValueAtTime(midiToFreq(rootMidi + interval), now);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1800, now);
            filter.Q.setValueAtTime(1, now);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.045, now + 0.08);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);

            oscillators.push(osc);
            gainNodes.push(gain);
        });

        activeChordRef.current = { ctx, oscillators, gainNodes };
    };

    const refreshHeldChord = async (root, variationIndex) => {
        const variation = VARIATIONS[variationIndex];
        setActiveRoot(root);
        setActiveVariationIndex(variationIndex);

        const chordName = buildDisplayChord(root, variation);
        setHistory((prev) => [chordName, ...prev].slice(0, 12));

        await startChord(root, variation);
    };

    const maybeReleaseChord = () => {
        if (heldFundamentalRef.current === null && heldVariationRef.current === null) {
            stopCurrentChord();
        }
    };

    useEffect(() => {
        const handleKeyDown = async (event) => {
            const tag = event.target.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

            const key = event.key.toLowerCase();

            setPressedKeys((prev) => {
                if (prev.has(key)) return prev;
                const next = new Set(prev);
                next.add(key);
                return next;
            });

            const fundamentalIndex = FUNDAMENTAL_KEYS.indexOf(key);
            if (fundamentalIndex !== -1 && !event.repeat) {
                event.preventDefault();
                heldFundamentalRef.current = fundamentalIndex;
                const root = FUNDAMENTAL_CHORDS[fundamentalIndex];
                const variationIndex =
                    heldVariationRef.current !== null ? heldVariationRef.current : activeVariationIndex;
                await refreshHeldChord(root, variationIndex);
                return;
            }

            const variationIndex = VARIATION_KEYS.indexOf(key);
            if (variationIndex !== -1 && !event.repeat) {
                event.preventDefault();
                heldVariationRef.current = variationIndex;
                const root =
                    heldFundamentalRef.current !== null
                        ? FUNDAMENTAL_CHORDS[heldFundamentalRef.current]
                        : activeRoot;
                await refreshHeldChord(root, variationIndex);
            }
        };

        const handleKeyUp = (event) => {
            const key = event.key.toLowerCase();

            setPressedKeys((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });

            const fundamentalIndex = FUNDAMENTAL_KEYS.indexOf(key);
            if (fundamentalIndex !== -1) {
                if (heldFundamentalRef.current === fundamentalIndex) {
                    heldFundamentalRef.current = null;
                }
                maybeReleaseChord();
            }

            const variationIndex = VARIATION_KEYS.indexOf(key);
            if (variationIndex !== -1) {
                if (heldVariationRef.current === variationIndex) {
                    heldVariationRef.current = null;
                }
                maybeReleaseChord();
            }
        };

        const handleBlur = () => {
            heldFundamentalRef.current = null;
            heldVariationRef.current = null;
            setPressedKeys(new Set());
            stopCurrentChord();
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
            stopCurrentChord();
        };
    }, [activeRoot, activeVariationIndex]);

    const handleFundamentalMouseDown = async (index) => {
        heldFundamentalRef.current = index;
        await refreshHeldChord(
            FUNDAMENTAL_CHORDS[index],
            heldVariationRef.current !== null ? heldVariationRef.current : activeVariationIndex
        );
    };

    const handleVariationMouseDown = async (index) => {
        heldVariationRef.current = index;
        await refreshHeldChord(
            heldFundamentalRef.current !== null ? FUNDAMENTAL_CHORDS[heldFundamentalRef.current] : activeRoot,
            index
        );
    };

    const handleMouseUpAny = () => {
        heldFundamentalRef.current = null;
        heldVariationRef.current = null;
        stopCurrentChord();
    };

    return (
        <div className="freeform-page">
            <div className="freeform-card">
                <div className="freeform-topbar">
                    <button className="freeform-menu-button" onClick={() => navigate("/menu")}>
                        Back to Main Menu
                    </button>
                </div>

                <div className="freeform-header">
                    <h2>Freeform</h2>
                    <p>
                        Hold number keys for fundamental chords, then use q to o for chord types. The sound now sustains while held.
                    </p>
                </div>

                <div className="freeform-layout">
                    <div className="music-circle-panel">
                        <h3>Music Circle</h3>
                        <div className="music-circle">
                            {MUSIC_CIRCLE.map((chord, index) => {
                                const angle = (index / MUSIC_CIRCLE.length) * Math.PI * 2 - Math.PI / 2;
                                const radius = 145;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;
                                const isActive = chord === activeRoot;

                                return (
                                    <div
                                        key={chord}
                                        className={`circle-chord ${isActive ? "active" : ""}`}
                                        style={{ transform: `translate(${x}px, ${y}px)` }}
                                    >
                                        {chord}
                                    </div>
                                );
                            })}

                            <div className="circle-center">
                                <span>Live Chord</span>
                                <strong>{displayedChord}</strong>
                                <small>{pressedKeys.size > 0 ? "Holding input..." : "Press or hold to play"}</small>
                            </div>
                        </div>
                    </div>

                    <div className="freeform-side">
                        <div className="freeform-panel">
                            <h3>Fundamental Chords</h3>
                            <div className="key-grid fundamental-grid">
                                {FUNDAMENTAL_CHORDS.map((chord, index) => (
                                    <button
                                        key={`${chord}-${index}`}
                                        className={`key-button ${pressedKeys.has(FUNDAMENTAL_KEYS[index]) ? "pressed" : ""}`}
                                        type="button"
                                        onMouseDown={() => handleFundamentalMouseDown(index)}
                                        onMouseUp={handleMouseUpAny}
                                        onMouseLeave={handleMouseUpAny}
                                        onTouchStart={() => handleFundamentalMouseDown(index)}
                                        onTouchEnd={handleMouseUpAny}
                                    >
                                        <span className="keycap">{FUNDAMENTAL_KEYS[index]}</span>
                                        <span className="key-name">{chord}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="freeform-panel">
                            <h3>Variations</h3>
                            <div className="key-grid variation-grid">
                                {VARIATIONS.map((variation, index) => (
                                    <button
                                        key={variation.label}
                                        className={`key-button variation-button ${pressedKeys.has(VARIATION_KEYS[index]) ? "pressed" : ""}`}
                                        type="button"
                                        onMouseDown={() => handleVariationMouseDown(index)}
                                        onMouseUp={handleMouseUpAny}
                                        onMouseLeave={handleMouseUpAny}
                                        onTouchStart={() => handleVariationMouseDown(index)}
                                        onTouchEnd={handleMouseUpAny}
                                    >
                                        <span className="keycap">{VARIATION_KEYS[index]}</span>
                                        <span className="key-name">{variation.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="freeform-panel live-panel">
                            <h3>Live Status</h3>
                            <p><strong>Root:</strong> {activeRoot}</p>
                            <p><strong>Variation:</strong> {activeVariation.label}</p>
                            <p><strong>Chord:</strong> {displayedChord}</p>
                            <p><strong>Keyboard:</strong> 1 to = for roots, q to o for variations.</p>
                        </div>

                        <div className="freeform-panel history-panel">
                            <h3>Recent Chords</h3>
                            {history.length === 0 ? (
                                <p>Hold a root and variation to start playing.</p>
                            ) : (
                                history.map((item, index) => (
                                    <p key={`${item}-${index}`} className="history-item">
                                        {index + 1}. {item}
                                    </p>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Freeform;