import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Backtracking.css";
import {
    getAvailableKeys,
    getCustomChordTypes,
    getDiatonicChords,
    getInstrumentOptions
} from "../utils/musicTheory";

function Backtracking() {
    const [scaleType, setScaleType] = useState("major");
    const [selectedKey, setSelectedKey] = useState("C");
    const [bpm, setBpm] = useState(100);
    const [instrument, setInstrument] = useState("Warm Pad");
    const [progression, setProgression] = useState(["C", "F", "G", "C"]);
    const [customProgression, setCustomProgression] = useState([
        { root: "C", type: "" },
        { root: "F", type: "" },
        { root: "G", type: "7" },
        { root: "C", type: "" }
    ]);
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);

    const audioContextRef = useRef(null);
    const playbackIntervalRef = useRef(null);
    const activeNodesRef = useRef([]);

    const availableKeys = useMemo(() => getAvailableKeys(), []);
    const customChordTypes = useMemo(() => getCustomChordTypes(), []);
    const instrumentOptions = useMemo(() => getInstrumentOptions(), []);
    const availableChords = useMemo(() => {
        if (scaleType === "custom") {
            return [];
        }

        return getDiatonicChords(selectedKey, scaleType);
    }, [selectedKey, scaleType]);

    useEffect(() => {
        if (scaleType !== "custom") {
            setProgression(getDiatonicChords(selectedKey, scaleType).slice(0, 4));
        }
    }, [selectedKey, scaleType]);

    useEffect(() => {
        return () => {
            stopBackingTrack();
        };
    }, []);

    const handleChordChange = (index, value) => {
        const updatedProgression = [...progression];
        updatedProgression[index] = value;
        setProgression(updatedProgression);
    };

    const handleCustomChordRootChange = (index, value) => {
        const updatedCustomProgression = [...customProgression];
        updatedCustomProgression[index].root = value;
        setCustomProgression(updatedCustomProgression);
    };

    const handleCustomChordTypeChange = (index, value) => {
        const updatedCustomProgression = [...customProgression];
        updatedCustomProgression[index].type = value;
        setCustomProgression(updatedCustomProgression);
    };

    const addChordToProgression = () => {
        if (scaleType === "custom") {
            setCustomProgression([
                ...customProgression,
                { root: "C", type: "" }
            ]);
            return;
        }

        const fallbackChord = availableChords[0] || "C";
        setProgression([...progression, fallbackChord]);
    };

    const removeChordFromProgression = () => {
        if (scaleType === "custom") {
            if (customProgression.length > 1) {
                setCustomProgression(customProgression.slice(0, -1));
            }
            return;
        }

        if (progression.length > 1) {
            setProgression(progression.slice(0, -1));
        }
    };

    const handleBpmChange = (event) => {
        setBpm(Number(event.target.value));
    };

    const getChromaticNotes = () => {
        return [
            "C", "C#", "D", "D#", "E", "F",
            "F#", "G", "G#", "A", "A#", "B"
        ];
    };

    const getNoteAtInterval = (startNote, semitoneOffset) => {
        const chromaticNotes = getChromaticNotes();
        const startIndex = chromaticNotes.indexOf(startNote);
        return chromaticNotes[(startIndex + semitoneOffset) % chromaticNotes.length];
    };

    const getChordNotes = (chordName) => {
        const rootNote = chordName.replace("maj7", "")
            .replace("sus2", "")
            .replace("sus4", "")
            .replace("aug", "")
            .replace("dim", "")
            .replace("m7", "")
            .replace("7", "")
            .replace("m", "");

        if (chordName.endsWith("maj7")) {
            return [
                rootNote,
                getNoteAtInterval(rootNote, 4),
                getNoteAtInterval(rootNote, 7),
                getNoteAtInterval(rootNote, 11)
            ];
        }

        if (chordName.endsWith("m7")) {
            return [
                rootNote,
                getNoteAtInterval(rootNote, 3),
                getNoteAtInterval(rootNote, 7),
                getNoteAtInterval(rootNote, 10)
            ];
        }

        if (chordName.endsWith("7")) {
            return [
                rootNote,
                getNoteAtInterval(rootNote, 4),
                getNoteAtInterval(rootNote, 7),
                getNoteAtInterval(rootNote, 10)
            ];
        }

        if (chordName.endsWith("sus2")) {
            return [
                rootNote,
                getNoteAtInterval(rootNote, 2),
                getNoteAtInterval(rootNote, 7)
            ];
        }

        if (chordName.endsWith("sus4")) {
            return [
                rootNote,
                getNoteAtInterval(rootNote, 5),
                getNoteAtInterval(rootNote, 7)
            ];
        }

        if (chordName.endsWith("aug")) {
            return [
                rootNote,
                getNoteAtInterval(rootNote, 4),
                getNoteAtInterval(rootNote, 8)
            ];
        }

        if (chordName.endsWith("dim")) {
            return [
                rootNote,
                getNoteAtInterval(rootNote, 3),
                getNoteAtInterval(rootNote, 6)
            ];
        }

        if (chordName.endsWith("m")) {
            return [
                rootNote,
                getNoteAtInterval(rootNote, 3),
                getNoteAtInterval(rootNote, 7)
            ];
        }

        return [
            rootNote,
            getNoteAtInterval(rootNote, 4),
            getNoteAtInterval(rootNote, 7)
        ];
    };

    const getFrequencyForNote = (noteName, octave = 4) => {
        const noteNumbers = {
            C: 0,
            "C#": 1,
            D: 2,
            "D#": 3,
            E: 4,
            F: 5,
            "F#": 6,
            G: 7,
            "G#": 8,
            A: 9,
            "A#": 10,
            B: 11
        };

        const midiNumber = (octave + 1) * 12 + noteNumbers[noteName];
        return 440 * Math.pow(2, (midiNumber - 69) / 12);
    };

    const createEnvelope = (gainNode, now, duration, instrumentName) => {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(0.0001, now);

        if (instrumentName === "Bell Tone") {
            gainNode.gain.linearRampToValueAtTime(0.16, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.2, duration * 0.8));
            return;
        }

        if (instrumentName === "Orchestral") {
            gainNode.gain.linearRampToValueAtTime(0.16, now + 0.18);
            gainNode.gain.linearRampToValueAtTime(0.12, now + duration * 0.75);
            gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);
            return;
        }

        if (instrumentName === "Woodwind") {
            gainNode.gain.linearRampToValueAtTime(0.18, now + 0.08);
            gainNode.gain.linearRampToValueAtTime(0.11, now + duration * 0.75);
            gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);
            return;
        }

        gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.0001, now + duration - 0.05);
    };

    const buildVoice = (audioContext, frequency, instrumentName, noteIndex) => {
        const oscillator = audioContext.createOscillator();
        const filterNode = audioContext.createBiquadFilter();

        if (instrumentName === "Orchestral") {
            oscillator.type = "sawtooth";
            filterNode.type = "lowpass";
            filterNode.frequency.setValueAtTime(1200, audioContext.currentTime);
        } else if (instrumentName === "Woodwind") {
            oscillator.type = "triangle";
            filterNode.type = "lowpass";
            filterNode.frequency.setValueAtTime(1400, audioContext.currentTime);
        } else if (instrumentName === "Soft Organ") {
            oscillator.type = "square";
            filterNode.type = "lowpass";
            filterNode.frequency.setValueAtTime(1300, audioContext.currentTime);
        } else if (instrumentName === "Bell Tone") {
            oscillator.type = "triangle";
            filterNode.type = "highpass";
            filterNode.frequency.setValueAtTime(500, audioContext.currentTime);
        } else {
            oscillator.type = "sine";
            filterNode.type = "lowpass";
            filterNode.frequency.setValueAtTime(1600, audioContext.currentTime);
        }

        if (instrumentName === "Orchestral" && noteIndex > 0) {
            oscillator.detune.setValueAtTime(noteIndex * 4, audioContext.currentTime);
        }


        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(filterNode);

        return { oscillator, filterNode };
    };

    const getCurrentProgression = () => {
        if (scaleType === "custom") {
            return customProgression.map((chord) => chord.root + chord.type);
        }

        return progression;
    };

    const clearActiveNodes = () => {
        activeNodesRef.current.forEach((nodeGroup) => {
            nodeGroup.oscillators.forEach((oscillator) => {
                try {
                    oscillator.stop();
                } catch (error) {
                    // already stopped
                }
            });
        });

        activeNodesRef.current = [];
    };

    const playChord = (chordName, durationInSeconds) => {
        if (!audioContextRef.current) {
            return;
        }

        const audioContext = audioContextRef.current;
        const now = audioContext.currentTime;
        const chordNotes = getChordNotes(chordName);
        const masterGain = audioContext.createGain();

        masterGain.connect(audioContext.destination);
        createEnvelope(masterGain, now, durationInSeconds, instrument);

        const oscillators = chordNotes.map((noteName, index) => {
            let octave = 4;

            if (index === 0) {
                octave = 3;
            }

            const frequency = getFrequencyForNote(noteName, octave);
            const voice = buildVoice(audioContext, frequency, instrument, index);

            voice.filterNode.connect(masterGain);
            voice.oscillator.start(now);
            voice.oscillator.stop(now + durationInSeconds);

            return voice.oscillator;
        });

        activeNodesRef.current.push({
            oscillators,
            gainNode: masterGain
        });
    };

    const startBackingTrack = async () => {
        if (isPlaying) {
            return;
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new window.AudioContext();
        }

        if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume();
        }

        const currentProgression = getCurrentProgression();

        setIsPlaying(true);

        const chordDurationInSeconds = (60 / bpm) * 4;
        let currentChordIndex = 0;

        playChord(currentProgression[currentChordIndex], chordDurationInSeconds);

        playbackIntervalRef.current = setInterval(() => {
            currentChordIndex = (currentChordIndex + 1) % currentProgression.length;
            playChord(currentProgression[currentChordIndex], chordDurationInSeconds);
        }, chordDurationInSeconds * 1000);
    };

    const stopBackingTrack = () => {
        if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
            playbackIntervalRef.current = null;
        }

        clearActiveNodes();
        setIsPlaying(false);
    };

    return (
        <div className="backtracking-page">
            <div className="backtracking-card">
                <div className="backtracking-topbar">
                    <button
                        className="backtracking-button menu-button"
                        type="button"
                        onClick={() => navigate("/")}
                    >
                        Back to Main Menu
                    </button>
                </div>
                <h1 className="backtracking-title">Backtracking Generator</h1>
                <p className="backtracking-subtitle">
                    Build a custom backing track with expandable chord progressions,
                    broader instrument colors, and full chord control.
                </p>

                <div className="backtracking-grid">
                    <div className="form-group">
                        <label htmlFor="scaleType">Mode</label>
                        <select
                            id="scaleType"
                            value={scaleType}
                            onChange={(event) => setScaleType(event.target.value)}
                            disabled={isPlaying}
                        >
                            <option value="major">Major</option>
                            <option value="minor">Minor</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="selectedKey">Key</label>
                        <select
                            id="selectedKey"
                            value={selectedKey}
                            onChange={(event) => setSelectedKey(event.target.value)}
                            disabled={isPlaying || scaleType === "custom"}
                        >
                            {availableKeys.map((note) => (
                                <option key={note} value={note}>
                                    {note}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="instrument">
                            Instrument ({instrumentOptions.length} choices)
                        </label>
                        <select
                            id="instrument"
                            value={instrument}
                            onChange={(event) => setInstrument(event.target.value)}
                            disabled={isPlaying}
                        >
                            {instrumentOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bpm">BPM: {bpm}</label>
                        <input
                            id="bpm"
                            type="range"
                            min="60"
                            max="240"
                            value={bpm}
                            onChange={handleBpmChange}
                            disabled={isPlaying}
                        />
                    </div>
                </div>

                <div className="progression-toolbar">
                    <button
                        className="backtracking-button toolbar-button"
                        type="button"
                        onClick={addChordToProgression}
                        disabled={isPlaying}
                    >
                        Add Chord
                    </button>
                    <button
                        className="backtracking-button toolbar-button"
                        type="button"
                        onClick={removeChordFromProgression}
                        disabled={isPlaying}
                    >
                        Remove Last Chord
                    </button>
                </div>

                {scaleType !== "custom" ? (
                    <div className="progression-section">
                        <h2>Diatonic Chord Progression</h2>
                        <div className="progression-grid dynamic-grid">
                            {progression.map((chord, index) => (
                                <div className="form-group" key={`chord-${index}`}>
                                    <label htmlFor={`chord-${index}`}>Chord {index + 1}</label>
                                    <select
                                        id={`chord-${index}`}
                                        value={chord}
                                        onChange={(event) => handleChordChange(index, event.target.value)}
                                        disabled={isPlaying}
                                    >
                                        {availableChords.map((availableChord) => (
                                            <option key={availableChord} value={availableChord}>
                                                {availableChord}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="progression-section">
                        <h2>Custom Chord Progression</h2>
                        <div className="custom-progression-grid">
                            {customProgression.map((chord, index) => (
                                <div className="custom-chord-card" key={`custom-chord-${index}`}>
                                    <h3>Chord {index + 1}</h3>

                                    <div className="form-group">
                                        <label htmlFor={`custom-root-${index}`}>Root</label>
                                        <select
                                            id={`custom-root-${index}`}
                                            value={chord.root}
                                            onChange={(event) =>
                                                handleCustomChordRootChange(index, event.target.value)
                                            }
                                            disabled={isPlaying}
                                        >
                                            {availableKeys.map((note) => (
                                                <option key={note} value={note}>
                                                    {note}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor={`custom-type-${index}`}>Variation</label>
                                        <select
                                            id={`custom-type-${index}`}
                                            value={chord.type}
                                            onChange={(event) =>
                                                handleCustomChordTypeChange(index, event.target.value)
                                            }
                                            disabled={isPlaying}
                                        >
                                            {customChordTypes.map((typeOption) => (
                                                <option key={typeOption || "major"} value={typeOption}>
                                                    {typeOption === "" ? "Major" : typeOption}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <p className="custom-chord-preview">
                                        Result: {chord.root}{chord.type === "" ? "" : chord.type}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="selection-preview">
                    <h2>Current Setup</h2>
                    <p><strong>Mode:</strong> {scaleType}</p>
                    <p><strong>Key:</strong> {scaleType === "custom" ? "Custom" : selectedKey}</p>
                    <p><strong>Instrument:</strong> {instrument}</p>
                    <p><strong>Tempo:</strong> {bpm} BPM</p>
                    <p><strong>Progression:</strong> {getCurrentProgression().join(" - ")}</p>
                </div>

                <div className="backtracking-actions">
                    <button
                        className="backtracking-button secondary-button"
                        type="button"
                        onClick={stopBackingTrack}
                        disabled={!isPlaying}
                    >
                        Stop
                    </button>
                    <button
                        className="backtracking-button primary-button"
                        type="button"
                        onClick={startBackingTrack}
                        disabled={isPlaying}
                    >
                        Play Backing Track
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Backtracking;