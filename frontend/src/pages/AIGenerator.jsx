import React, { useState } from "react";
import "./AIGenerator.css";
import { useNavigate } from "react-router-dom";
import { analyzeMusicRequest } from "../utils/aiMusicEngine";

const GENRES = ["Cinematic","Lofi","Electronic","Jazz","Classical","R&B","Ambient","Rock"];
const MOODS  = ["Heroic","Happy","Calm","Sad","Dark","Energetic","Romantic","Mysterious"];

function AIGenerator() {
    const [prompt, setPrompt] = useState("");
    const [genre, setGenre] = useState("Cinematic");
    const [mood, setMood] = useState("Heroic");
    const [bpm, setBpm] = useState(120);
    const [duration, setDuration] = useState(20);
    const [instrumentalOnly, setInstrumentalOnly] = useState(true);
    const [generatedTrack, setGeneratedTrack] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();

    const handleGenerate = () => {
        setIsGenerating(true);
        try {
            const result = analyzeMusicRequest({ prompt, genre, mood, bpm, duration, instrumentalOnly });
            setTimeout(() => {
                setGeneratedTrack(result);
                setIsGenerating(false);
            }, 900);
        } catch (e) {
            console.error(e);
            setIsGenerating(false);
        }
    };

    return (
        <div className="ai-generator-page">
            <div className="ai-generator-card">
                <div className="ai-generator-topbar">
                    <button className="back-button" onClick={() => navigate("/menu")}>← Menu</button>
                </div>

                <div className="ai-generator-header">
                    <h2>✨ Assisted Music Generator</h2>
                    <p>Describe your music idea and get a full blueprint with chords, melody & tempo.</p>
                </div>

                <div className="ai-generator-form">
                    <div>
                        <label>Your idea or vibe</label>
                        <textarea
                            className="form-textarea"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g. A rainy afternoon in a jazz café, melancholic but warm..."
                        />
                    </div>

                    <div className="ai-form-row">
                        <div>
                            <label>Genre</label>
                            <select className="form-select" value={genre} onChange={e => setGenre(e.target.value)}>
                                {GENRES.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Mood</label>
                            <select className="form-select" value={mood} onChange={e => setMood(e.target.value)}>
                                {MOODS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="ai-form-row">
                        <div>
                            <label>BPM</label>
                            <input type="number" className="form-input" value={bpm} onChange={e => setBpm(+e.target.value)} min="40" max="220" />
                        </div>
                        <div>
                            <label>Duration (sec)</label>
                            <input type="number" className="form-input" value={duration} onChange={e => setDuration(+e.target.value)} min="5" max="300" />
                        </div>
                    </div>

                    <label className="checkbox-row">
                        <input type="checkbox" checked={instrumentalOnly} onChange={e => setInstrumentalOnly(e.target.checked)} />
                        Instrumental only (no vocals)
                    </label>

                    <button
                        className={`generate-button${isGenerating ? " loading" : ""}`}
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Generating your blueprint..." : "✨ Generate Track Blueprint"}
                    </button>
                </div>

                {generatedTrack && (
                    <div className="generated-result">
                        <h3>{generatedTrack.title}</h3>
                        <div className="result-grid">
                            {[
                                { label: "Mood",       value: generatedTrack.mood },
                                { label: "Scale",      value: generatedTrack.scale },
                                { label: "Tempo",      value: `${generatedTrack.tempo} BPM` },
                                { label: "Instrument", value: generatedTrack.instrument },
                            ].map(item => (
                                <div key={item.label} className="result-item">
                                    <div className="result-item-label">{item.label}</div>
                                    <div className="result-item-value">{item.value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="result-progression">
                            🎵 {generatedTrack.chordProgression}
                        </div>
                        <div className="result-notes">
                            {generatedTrack.melodyNotes.map((n, i) => (
                                <span key={i} className="note-chip">{n}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AIGenerator;
