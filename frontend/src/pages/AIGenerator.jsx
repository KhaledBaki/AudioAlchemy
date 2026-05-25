import React, { useState } from "react";
import "./AIGenerator.css";
import { useNavigate } from "react-router-dom";
import { analyzeMusicRequest } from "../utils/aiMusicEngine";

function AIGenerator({ onBack }) {
    const [prompt, setPrompt] = useState("");
    const [genre, setGenre] = useState("Cinematic");
    const [mood, setMood] = useState("Heroic");
    const [bpm, setBpm] = useState(120);
    const [duration, setDuration] = useState(20);
    const [instrumentalOnly, setInstrumentalOnly] = useState(true);
    const [generatedTrack, setGeneratedTrack] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();
    const handleGenerateTrack = () => {
        try {
            setIsGenerating(true);

            const result = analyzeMusicRequest({
                prompt,
                genre,
                mood,
                bpm,
                duration,
                instrumentalOnly
            });

            setTimeout(() => {
                setGeneratedTrack(result);
                setIsGenerating(false);
            }, 700);
        } catch (error) {
            console.error("Generation error:", error);
            alert("Generation failed.");
            setIsGenerating(false);
        }
    };

    return (
        <div className="ai-generator-page">
            <div className="ai-generator-topbar">
                <button
                    className="back-button ai-menu-button"
                    type="button"
                    onClick={() => navigate("/menu")}
                >
                    Back to Main Menu
                </button>
            </div>
            <div className="ai-generator-card">
                <div className="ai-generator-header">
                    <h2>AI Music Generator</h2>
                    <p>Create a local music idea with no backend.</p>
                </div>


                {onBack && (
                    <button className="back-button" onClick={onBack}>
                        Back to Main Menu
                    </button>
                )}

                <div className="ai-generator-form">
                    <label>Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the music you want..."
                    />

                    <label>Genre</label>
                    <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                        <option value="Cinematic">Cinematic</option>
                        <option value="Lofi">Lofi</option>
                        <option value="Electronic">Electronic</option>
                        <option value="Jazz">Jazz</option>
                    </select>

                    <label>Mood</label>
                    <select value={mood} onChange={(e) => setMood(e.target.value)}>
                        <option value="Heroic">Heroic</option>
                        <option value="Happy">Happy</option>
                        <option value="Calm">Calm</option>
                        <option value="Sad">Sad</option>
                        <option value="Dark">Dark</option>
                    </select>

                    <label>BPM</label>
                    <input
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(e.target.value)}
                        min="40"
                        max="220"
                    />

                    <label>Duration (seconds)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="5"
                        max="180"
                    />

                    <label className="checkbox-row">
                        <input
                            type="checkbox"
                            checked={instrumentalOnly}
                            onChange={(e) => setInstrumentalOnly(e.target.checked)}
                        />
                        Instrumental only
                    </label>

                    <button
                        className="generate-button"
                        onClick={handleGenerateTrack}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Generating..." : "Generate Track"}
                    </button>
                </div>

                {generatedTrack && (
                    <div className="generated-result">
                        <h3>{generatedTrack.title}</h3>
                        <p>{generatedTrack.description}</p>
                        <p><strong>Mood:</strong> {generatedTrack.mood}</p>
                        <p><strong>Scale:</strong> {generatedTrack.scale}</p>
                        <p><strong>Tempo:</strong> {generatedTrack.tempo}</p>
                        <p><strong>Instrument:</strong> {generatedTrack.instrument}</p>
                        <p><strong>Chord Progression:</strong> {generatedTrack.chordProgression}</p>
                        <p><strong>Melody Notes:</strong> {generatedTrack.melodyNotes.join(" - ")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AIGenerator;