const chromaticNotes = [
    "C", "C#", "D", "D#", "E", "F",
    "F#", "G", "G#", "A", "A#", "B"
];

const majorScalePattern = [0, 2, 4, 5, 7, 9, 11];
const minorScalePattern = [0, 2, 3, 5, 7, 8, 10];

const majorChordQualities = ["", "m", "m", "", "", "m", "dim"];
const minorChordQualities = ["m", "dim", "", "m", "m", "", ""];

const customChordTypes = [
    "",
    "m",
    "dim",
    "aug",
    "sus2",
    "sus4",
    "7",
    "maj7",
    "m7"
];

function getScaleNotes(rootNote, scaleType) {
    const startIndex = chromaticNotes.indexOf(rootNote);
    const scalePattern = scaleType === "major" ? majorScalePattern : minorScalePattern;

    return scalePattern.map((interval) => {
        return chromaticNotes[(startIndex + interval) % chromaticNotes.length];
    });
}

function getDiatonicChords(rootNote, scaleType) {
    const scaleNotes = getScaleNotes(rootNote, scaleType);
    const chordQualities = scaleType === "major" ? majorChordQualities : minorChordQualities;

    return scaleNotes.map((note, index) => {
        return note + chordQualities[index];
    });
}

function getAvailableKeys() {
    return [...chromaticNotes];
}

function getCustomChordTypes() {
    return [...customChordTypes];
}

function getInstrumentOptions() {
    return [
        "Warm Pad",
        "Soft Organ",
        "Bell Tone",
        "Orchestral",
        "Woodwind"
    ];
}

export {
    getScaleNotes,
    getDiatonicChords,
    getAvailableKeys,
    getCustomChordTypes,
    getInstrumentOptions
};