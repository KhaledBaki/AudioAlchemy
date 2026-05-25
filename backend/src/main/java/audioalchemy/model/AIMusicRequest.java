package audioalchemy.model;

public class AIMusicRequest {
    private String prompt;
    private String genre;
    private String mood;
    private int bpm;
    private int duration;
    private boolean instrumentalOnly;

    public AIMusicRequest() {
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public int getBpm() {
        return bpm;
    }

    public void setBpm(int bpm) {
        this.bpm = bpm;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public boolean isInstrumentalOnly() {
        return instrumentalOnly;
    }

    public void setInstrumentalOnly(boolean instrumentalOnly) {
        this.instrumentalOnly = instrumentalOnly;
    }
}