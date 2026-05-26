const chromatic = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const majorPat = [0,2,4,5,7,9,11];
const minorPat = [0,2,3,5,7,8,10];
const majorQ = ["","m","m","","","m","dim"];
const minorQ = ["m","dim","","m","m","",""];

export function getScaleNotes(root, type) {
  const si = chromatic.indexOf(root);
  const pat = type==="major" ? majorPat : minorPat;
  return pat.map(i => chromatic[(si+i)%12]);
}

export function getDiatonicChords(root, type) {
  const notes = getScaleNotes(root, type);
  const q = type==="major" ? majorQ : minorQ;
  return notes.map((n,i) => n+q[i]);
}

export function getAvailableKeys() { return [...chromatic]; }

export function getCustomChordTypes() {
  return ["","m","dim","aug","sus2","sus4","7","maj7","m7"];
}

export function getInstrumentOptions() {
  return ["Warm Pad","Soft Organ","Bell Tone","Orchestral","Woodwind"];
}
