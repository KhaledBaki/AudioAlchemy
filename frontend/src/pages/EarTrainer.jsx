import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EarTrainer.css";

// ── Music Data ──────────────────────────
const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

const INTERVALS = [
  { name: "Unison",         semitones: 0,  emoji: "🎵" },
  { name: "Minor 2nd",      semitones: 1,  emoji: "😬" },
  { name: "Major 2nd",      semitones: 2,  emoji: "🎶" },
  { name: "Minor 3rd",      semitones: 3,  emoji: "😢" },
  { name: "Major 3rd",      semitones: 4,  emoji: "☀️" },
  { name: "Perfect 4th",    semitones: 5,  emoji: "🏛️" },
  { name: "Tritone",        semitones: 6,  emoji: "😈" },
  { name: "Perfect 5th",    semitones: 7,  emoji: "💪" },
  { name: "Minor 6th",      semitones: 8,  emoji: "🌙" },
  { name: "Major 6th",      semitones: 9,  emoji: "🎸" },
  { name: "Minor 7th",      semitones: 10, emoji: "🎷" },
  { name: "Major 7th",      semitones: 11, emoji: "🤩" },
  { name: "Octave",         semitones: 12, emoji: "🎯" },
];

const CHORD_TYPES = [
  { name: "Major",         intervals: [0, 4, 7],       emoji: "😊" },
  { name: "Minor",         intervals: [0, 3, 7],       emoji: "😔" },
  { name: "Dominant 7th",  intervals: [0, 4, 7, 10],   emoji: "🎺" },
  { name: "Major 7th",     intervals: [0, 4, 7, 11],   emoji: "✨" },
  { name: "Minor 7th",     intervals: [0, 3, 7, 10],   emoji: "🌧️" },
  { name: "Diminished",    intervals: [0, 3, 6],       emoji: "😰" },
  { name: "Augmented",     intervals: [0, 4, 8],       emoji: "🚀" },
  { name: "Sus2",          intervals: [0, 2, 7],       emoji: "🌬️" },
  { name: "Sus4",          intervals: [0, 5, 7],       emoji: "⛰️" },
];

const DIFFICULTIES = {
  beginner:     { label: "Beginner 🌱",     intervalCount: 6,  chordCount: 2, includeChords: false },
  intermediate: { label: "Intermediate 🎓", intervalCount: 10, chordCount: 4, includeChords: true  },
  advanced:     { label: "Advanced 🔥",     intervalCount: 13, chordCount: 9, includeChords: true  },
};

const MODES = [
  { id: "intervals", label: "Intervals" },
  { id: "chords",    label: "Chords" },
  { id: "mixed",     label: "Mixed" },
];

function midiFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

function rand(n) { return Math.floor(Math.random() * n); }

function pickQuestion(difficulty, mode) {
  const diff = DIFFICULTIES[difficulty];
  const intervals = INTERVALS.slice(0, diff.intervalCount);
  const chords = CHORD_TYPES.slice(0, diff.chordCount);

  let type;
  if (mode === "intervals") type = "interval";
  else if (mode === "chords") type = "chord";
  else type = diff.includeChords && Math.random() > 0.5 ? "chord" : "interval";

  const rootMidi = 60 + rand(12);

  if (type === "interval") {
    const correct = intervals[rand(intervals.length)];
    const distractors = intervals
      .filter(i => i.name !== correct.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [...distractors, correct].sort(() => Math.random() - 0.5);
    return { type: "interval", correct, rootMidi, options };
  } else {
    const correct = chords[rand(chords.length)];
    const distractors = chords
      .filter(c => c.name !== correct.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [...distractors, correct].sort(() => Math.random() - 0.5);
    return { type: "chord", correct, rootMidi, options };
  }
}

export default function EarTrainer() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("beginner");
  const [mode, setMode] = useState("intervals");
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState(null); // null | "correct" | "wrong"
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]);

  const audioCtxRef = useRef(null);

  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playNote = (ctx, midi, startTime, duration = 0.8) => {
    const freq = midiFreq(midi);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 2200;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const playQuestion = useCallback(async (q) => {
    if (!q) return;
    setIsPlaying(true);
    const ctx = getCtx();
    const now = ctx.currentTime + 0.05;

    if (q.type === "interval") {
      const { rootMidi, correct } = q;
      playNote(ctx, rootMidi, now, 1.0);
      playNote(ctx, rootMidi + correct.semitones, now + 0.7, 1.0);
    } else {
      const { rootMidi, correct } = q;
      // Arpeggiate then strum
      correct.intervals.forEach((interval, i) => {
        playNote(ctx, rootMidi + interval, now + i * 0.12, 1.5);
      });
      setTimeout(() => {
        const ctx2 = getCtx();
        const t = ctx2.currentTime + 0.05;
        correct.intervals.forEach(interval => {
          playNote(ctx2, rootMidi + interval, t, 1.8);
        });
      }, correct.intervals.length * 120 + 300);
    }

    const dur = q.type === "interval" ? 2200 : 2800;
    setTimeout(() => setIsPlaying(false), dur);
  }, []);

  const newQuestion = useCallback(() => {
    const q = pickQuestion(difficulty, mode);
    setQuestion(q);
    setAnswered(null);
    setChosen(null);
    setTimeout(() => playQuestion(q), 100);
  }, [difficulty, mode, playQuestion]);

  const handleAnswer = (option) => {
    if (answered) return;
    setChosen(option.name);
    const isCorrect = option.name === question.correct.name;
    setAnswered(isCorrect ? "correct" : "wrong");
    setTotal(t => t + 1);

    if (isCorrect) {
      const newStreak = streak + 1;
      setScore(s => s + 1);
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
    } else {
      setStreak(0);
    }

    setHistory(h => [
      { question: question.correct.name, correct: isCorrect },
      ...h.slice(0, 19)
    ]);
  };

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="ear-trainer-page">
      <div className="ear-trainer-card">
        {/* Top Bar */}
        <div className="et-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
            <button className="back-btn" onClick={() => navigate("/menu")}>← Menu</button>
            <h1 className="et-title">👂 Ear Trainer</h1>
          </div>
          <div className="et-score-bar">
            <div className="et-score-chip">
              <span className="et-score-val">{score}/{total}</span>
              <span className="et-score-label">Score</span>
            </div>
            <div className="et-score-chip">
              <span className="et-score-val">{accuracy}%</span>
              <span className="et-score-label">Accuracy</span>
            </div>
            <div className="et-score-chip">
              <span className="et-score-val streak">{streak}</span>
              <span className="et-score-label">Streak 🔥</span>
            </div>
            <div className="et-score-chip">
              <span className="et-score-val streak">{bestStreak}</span>
              <span className="et-score-label">Best</span>
            </div>
          </div>
        </div>

        {/* Mode Row */}
        <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-3)", background: "var(--surface-offset)", border: "2px solid var(--border-color)", borderRadius: "var(--r-lg)", padding: "var(--sp-2)" }}>
          {MODES.map(m => (
            <button
              key={m.id}
              className={`et-diff-btn${mode === m.id ? " active" : ""}`}
              onClick={() => { setMode(m.id); setQuestion(null); setAnswered(null); }}
            >{m.label}</button>
          ))}
        </div>

        {/* Difficulty Row */}
        <div className="et-difficulty-row">
          {Object.entries(DIFFICULTIES).map(([key, val]) => (
            <button
              key={key}
              className={`et-diff-btn${difficulty === key ? " active" : ""}`}
              onClick={() => { setDifficulty(key); setQuestion(null); setAnswered(null); }}
            >{val.label}</button>
          ))}
        </div>

        {/* Play Zone */}
        <div className={`et-play-zone${answered ? ` ${answered}` : ""}`}>
          {!question && (
            <>
              <div className="et-question-label">Ready to train your ear?</div>
              <div style={{ fontSize: "4rem" }}>👂</div>
              <button className="et-listen-btn" onClick={newQuestion}>
                <span className="et-listen-icon">▶</span>
                Start Training
              </button>
            </>
          )}

          {question && !answered && (
            <>
              <div className="et-mode-badge">
                {question.type === "interval" ? "🎵 What interval is this?" : "🎸 What chord is this?"}
              </div>
              <button
                className={`et-listen-btn${isPlaying ? " playing" : ""}`}
                onClick={() => playQuestion(question)}
                disabled={isPlaying}
              >
                <span className="et-listen-icon">🔊</span>
                {isPlaying ? "Listening..." : "Play Again"}
              </button>
            </>
          )}

          {answered && (
            <>
              <div className={`et-feedback ${answered}`}>
                {answered === "correct" ? "✅ Correct!" : "❌ Not quite"}
              </div>
              {answered === "wrong" && (
                <div className="et-answer-reveal">
                  The answer was <strong>{question.correct.emoji} {question.correct.name}</strong>
                </div>
              )}
              {answered === "correct" && streak > 1 && (
                <div className="et-answer-reveal" style={{ color: "var(--secondary-color)", fontWeight: "700" }}>
                  🔥 {streak} in a row!
                </div>
              )}
            </>
          )}
        </div>

        {/* Answer Buttons */}
        {question && (
          <div className="et-answers-grid">
            {question.options.map(opt => {
              let cls = "et-answer-btn";
              if (answered) {
                if (opt.name === question.correct.name) cls += " correct-answer";
                else if (opt.name === chosen) cls += " wrong-answer";
              }
              return (
                <button
                  key={opt.name}
                  className={cls}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!answered}
                >
                  {opt.emoji} {opt.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Row */}
        <div className="et-action-row">
          {!question && (
            <button className="btn-secondary" onClick={() => { setScore(0); setTotal(0); setStreak(0); setHistory([]); }}>
              Reset Score
            </button>
          )}
          {question && answered && (
            <button className="btn-primary" onClick={newQuestion}>
              Next Question →
            </button>
          )}
          {question && answered && (
            <button className="btn-secondary" onClick={() => playQuestion(question)}>
              🔊 Replay Answer
            </button>
          )}
          {question && !answered && (
            <button className="btn-secondary" onClick={() => { setQuestion(null); setAnswered(null); }}>
              Skip
            </button>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="et-history">
            <div className="et-history-title">Recent Answers</div>
            <div className="et-history-list">
              {history.map((item, i) => (
                <div key={i} className={`et-history-item ${item.correct ? "correct" : "wrong"}`}>
                  {item.correct ? "✓" : "✗"} {item.question}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
