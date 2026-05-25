package audioalchemy.model;

import java.util.List;

public class AIMusicResponse {
    private String title;
    private String description;
    private String mood;
    private String scale;
    private int tempo;
    private String instrument;
    private String chordProgression;
    private List<String> melodyNotes;
    private String status;

    public AIMusicResponse() {
    }

    public AIMusicResponse(String title, String description, String mood, String scale, int tempo,
                           String instrument, String chordProgression, List<String> melodyNotes, String status) {
        this.title = title;
        this.description = description;
        this.mood = mood;
        this.scale = scale;
        this.tempo = tempo;
        this.instrument = instrument;
        this.chordProgression = chordProgression;
        this.melodyNotes = melodyNotes;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getMood() {
        return mood;
    }

    public String getScale() {
        return scale;
    }

    public int getTempo() {
        return tempo;
    }

    public String getInstrument() {
        return instrument;
    }

    public String getChordProgression() {
        return chordProgression;
    }

    public List<String> getMelodyNotes() {
        return melodyNotes;
    }

    public String getStatus() {
        return status;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }

    public void setTempo(int tempo) {
        this.tempo = tempo;
    }

    public void setInstrument(String instrument) {
        this.instrument = instrument;
    }

    public void setChordProgression(String chordProgression) {
        this.chordProgression = chordProgression;
    }

    public void setMelodyNotes(List<String> melodyNotes) {
        this.melodyNotes = melodyNotes;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}