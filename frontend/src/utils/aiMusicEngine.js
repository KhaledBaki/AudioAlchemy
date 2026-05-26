export function analyzeMusicRequest(input) {
  const prompt = (input.prompt || "").toLowerCase();
  const genre  = input.genre  || "cinematic";
  const moodIn = input.mood   || "neutral";
  const bpmIn  = Number(input.bpm) || 100;
  const dur    = Number(input.duration) || 20;
  const instOnly = !!input.instrumentalOnly;

  let mood = moodIn, scale = "major", tempo = bpmIn;
  let instrument = "piano", chordProg = "C - G - Am - F";
  let melodyNotes = ["C4","E4","G4","A4"];

  if (prompt.includes("sad") || moodIn.toLowerCase().includes("sad")) {
    mood="sad"; scale="minor"; tempo=Math.max(60,bpmIn-20);
    instrument="piano"; chordProg="Am - F - C - G"; melodyNotes=["A4","C5","E5","G5"];
  }
  if (prompt.includes("happy") || moodIn.toLowerCase().includes("happy")) {
    mood="happy"; scale="major"; tempo=Math.max(110,bpmIn);
    instrument="piano"; chordProg="C - G - Am - F"; melodyNotes=["C5","D5","E5","G5"];
  }
  if (prompt.includes("calm") || moodIn.toLowerCase().includes("calm")) {
    mood="calm"; scale="major"; tempo=Math.min(80,bpmIn||80);
    instrument="piano"; chordProg="C - Am - F - G"; melodyNotes=["C4","E4","G4","B4"];
  }
  if (prompt.includes("dark") || prompt.includes("tense") || moodIn.toLowerCase().includes("dark")) {
    mood="dark"; scale="minor"; tempo=Math.max(70,bpmIn);
    instrument="synth"; chordProg="Dm - Bb - F - C"; melodyNotes=["D4","F4","A4","C5"];
  }
  if (moodIn.toLowerCase().includes("heroic") || prompt.includes("epic") || prompt.includes("heroic")) {
    mood="heroic"; scale="major"; tempo=Math.max(110,bpmIn);
    instrument="orchestral strings"; chordProg="C - Am - F - G"; melodyNotes=["C4","G4","A4","C5","G4","E4"];
  }
  if (moodIn.toLowerCase().includes("mysterious") || prompt.includes("mysterious")) {
    mood="mysterious"; scale="minor"; tempo=Math.min(90,bpmIn||90);
    instrument="soft piano"; chordProg="Dm - Bb - F - C"; melodyNotes=["D4","F4","Ab4","C5","Ab4"];
  }
  if (moodIn.toLowerCase().includes("melancholic") || prompt.includes("melancholic")) {
    mood="melancholic"; scale="minor"; tempo=Math.max(58,bpmIn-25);
    instrument="strings"; chordProg="Am - G - F - E"; melodyNotes=["A3","C4","E4","G4","F4"];
  }

  // Genre overrides
  const g = genre.toLowerCase();
  if (g === "lofi")       { instrument="electric piano"; chordProg="Dm7 - G7 - Cmaj7 - Am7"; melodyNotes=["D4","F4","A4","C5"]; }
  else if (g === "cinematic") { instrument="orchestral strings"; chordProg="Am - F - C - G"; melodyNotes=["A3","C4","E4","G4"]; }
  else if (g === "electronic") { instrument="synth pad"; chordProg="Fm - Db - Ab - Eb"; melodyNotes=["F4","Ab4","C5","Eb5"]; }
  else if (g === "jazz")    { instrument="jazz piano"; chordProg="Dm7 - G7 - Cmaj7 - Am7"; melodyNotes=["D4","F4","A4","C5","B4"]; }
  else if (g === "ambient") { instrument="ambient pad"; chordProg="C - G - Am - F"; tempo=Math.min(70,tempo); }
  else if (g === "epic")    { instrument="full orchestra"; chordProg="Am - F - C - G"; tempo=Math.max(130,tempo); }
  else if (g === "classical") { instrument="grand piano"; chordProg="C - G7 - Am - F - G - C"; }
  else if (g === "pop")     { instrument="keyboard"; chordProg="C - G - Am - F"; }

  const title = `AI Track — ${capitalize(genre)} ${capitalize(mood)}`;
  const desc = `${input.prompt || "No prompt"} · ${genre} · ${mood} · ${tempo} BPM · ${dur}s · ${instOnly?"Instrumental":"Vocals"}`;

  return { title, description:desc, mood, scale, tempo, instrument, chordProgression:chordProg, melodyNotes, status:"generated" };
}

function capitalize(v) {
  if (!v) return "Custom";
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
}
