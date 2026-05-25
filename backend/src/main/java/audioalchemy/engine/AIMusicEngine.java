package audioalchemy.engine;

import audioalchemy.model.AIMusicRequest;
import audioalchemy.model.AIMusicResponse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class AIMusicEngine {

    public static AIMusicResponse analyze(AIMusicRequest request) {
        String combined = (
                safe(request.getPrompt()) + " " +
                        safe(request.getGenre()) + " " +
                        safe(request.getMood())
        ).toLowerCase();

        String mood = "neutral";
        String scale = "major";
        int tempo = request.getBpm() > 0 ? request.getBpm() : 100;
        String instrument = "piano";
        String chordProgression = "C - G - Am - F";
        List<String> melodyNotes = new ArrayList<>(Arrays.asList("C4", "E4", "G4", "A4", "G4", "E4", "C4"));

        if (combined.contains("sad") || combined.contains("melancholic") || combined.contains("emotional")) {
            mood = "sad";
            scale = "minor";
            tempo = Math.max(60, tempo - 20);
            instrument = "piano";
            chordProgression = "Am - F - C - G";
            melodyNotes = new ArrayList<>(Arrays.asList("A4", "C5", "E5", "D5", "C5", "A4", "G4"));
        }

        if (combined.contains("happy") || combined.contains("joyful") || combined.contains("bright")) {
            mood = "happy";
            scale = "major";
            tempo = Math.min(160, tempo + 15);
            instrument = "piano";
            chordProgression = "C - G - Am - F";
            melodyNotes = new ArrayList<>(Arrays.asList("C4", "D4", "E4", "G4", "A4", "G4", "E4"));
        }

        if (combined.contains("calm") || combined.contains("relaxing") || combined.contains("ambient")) {
            mood = "calm";
            scale = "major";
            tempo = Math.min(90, tempo);
            instrument = "piano";
            chordProgression = "C - F - Am - G";
            melodyNotes = new ArrayList<>(Arrays.asList("C4", "E4", "G4", "E4", "D4", "C4"));
        }

        if (combined.contains("heroic") || combined.contains("cinematic") || combined.contains("epic")) {
            mood = "heroic";
            scale = "major";
            tempo = Math.max(110, tempo);
            instrument = "orchestral piano";
            chordProgression = "C - Am - F - G";
            melodyNotes = new ArrayList<>(Arrays.asList("C4", "G4", "A4", "C5", "G4", "E4", "C4"));
        }

        if (combined.contains("eerie") || combined.contains("dark") || combined.contains("mysterious")) {
            mood = "eerie";
            scale = "minor";
            tempo = Math.min(85, tempo);
            instrument = "soft piano";
            chordProgression = "Dm - Bb - F - C";
            melodyNotes = new ArrayList<>(Arrays.asList("D4", "F4", "Ab4", "C5", "Ab4", "F4", "D4"));
        }

        if (combined.contains("electronic")) {
            instrument = "synth";
        } else if (combined.contains("fantasy")) {
            instrument = "bells";
        } else if (combined.contains("lo-fi")) {
            instrument = "electric piano";
        } else if (combined.contains("pop")) {
            instrument = "keyboard";
        }

        String title = buildTitle(request.getGenre(), mood);
        String description = buildDescription(request, mood, scale, tempo, instrument, chordProgression);

        return new AIMusicResponse(
                title,
                description,
                mood,
                scale,
                tempo,
                instrument,
                chordProgression,
                melodyNotes,
                "generated"
        );
    }

    private static String buildTitle(String genre, String mood) {
        String safeGenre = safe(genre).isBlank() ? "Custom" : capitalize(genre);
        String safeMood = mood.isBlank() ? "Track" : capitalize(mood);
        return "AI Track - " + safeGenre + " " + safeMood;
    }

    private static String buildDescription(AIMusicRequest request, String mood, String scale,
                                           int tempo, String instrument, String chordProgression) {
        return "Prompt: " + safe(request.getPrompt()) +
                " | Genre: " + safe(request.getGenre()) +
                " | Mood: " + mood +
                " | Scale: " + scale +
                " | Tempo: " + tempo +
                " BPM | Instrument: " + instrument +
                " | Chords: " + chordProgression +
                " | Duration: " + request.getDuration() + " sec" +
                " | " + (request.isInstrumentalOnly() ? "Instrumental only" : "Vocals allowed");
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    private static String capitalize(String value) {
        if (value == null || value.isBlank()) return "";
        return value.substring(0, 1).toUpperCase() + value.substring(1).toLowerCase();
    }
}