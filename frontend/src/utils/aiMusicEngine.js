export function analyzeMusicRequest(input) {
    const prompt = (input.prompt || "").toLowerCase();
    const genre = input.genre || "cinematic";
    const moodInput = input.mood || "neutral";
    const bpmInput = Number(input.bpm) || 100;
    const duration = Number(input.duration) || 20;
    const instrumentalOnly = !!input.instrumentalOnly;

    let mood = moodInput;
    let scale = "major";
    let tempo = bpmInput;
    let instrument = "piano";
    let chordProgression = "C - G - Am - F";
    let melodyNotes = ["C4", "E4", "G4", "A4"];

    if (prompt.includes("sad") || moodInput.toLowerCase().includes("sad")) {
        mood = "sad";
        scale = "minor";
        tempo = Math.max(60, bpmInput - 20);
        instrument = "piano";
        chordProgression = "Am - F - C - G";
        melodyNotes = ["A4", "C5", "E5", "G5"];
    }

    if (prompt.includes("happy") || moodInput.toLowerCase().includes("happy")) {
        mood = "happy";
        scale = "major";
        tempo = Math.max(110, bpmInput);
        instrument = "piano";
        chordProgression = "C - G - Am - F";
        melodyNotes = ["C5", "D5", "E5", "G5"];
    }

    if (prompt.includes("calm") || moodInput.toLowerCase().includes("calm")) {
        mood = "calm";
        scale = "major";
        tempo = Math.min(80, bpmInput || 80);
        instrument = "piano";
        chordProgression = "C - Am - F - G";
        melodyNotes = ["C4", "E4", "G4", "B4"];
    }

    if (prompt.includes("dark") || prompt.includes("tense")) {
        mood = "dark";
        scale = "minor";
        tempo = Math.max(70, bpmInput);
        instrument = "synth";
        chordProgression = "Dm - Bb - F - C";
        melodyNotes = ["D4", "F4", "A4", "C5"];
    }

    if (genre.toLowerCase() === "lofi") {
        instrument = "electric piano";
        chordProgression = "Dm7 - G7 - Cmaj7 - Am7";
        melodyNotes = ["D4", "F4", "A4", "C5"];
    } else if (genre.toLowerCase() === "cinematic") {
        instrument = "strings";
        chordProgression = "Am - F - C - G";
        melodyNotes = ["A3", "C4", "E4", "G4"];
    } else if (genre.toLowerCase() === "electronic") {
        instrument = "synth";
        chordProgression = "Fm - Db - Ab - Eb";
        melodyNotes = ["F4", "Ab4", "C5", "Eb5"];
    }

    const title = `Generated Track - ${capitalize(genre)} ${capitalize(mood)}`;
    const description =
        `Prompt: ${input.prompt || ""} | Genre: ${genre} | Mood: ${mood} | BPM: ${tempo} | Duration: ${duration} sec | ` +
        (instrumentalOnly ? "Instrumental only" : "Vocals allowed");

    return {
        title,
        description,
        mood,
        scale,
        tempo,
        instrument,
        chordProgression,
        melodyNotes,
        status: "generated"
    };
}

function capitalize(value) {
    if (!value) return "Custom";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}