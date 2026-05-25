package audioalchemy.service;

import audioalchemy.model.AIMusicRequest;
import audioalchemy.model.AIMusicResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIMusicService {

    @Value("${freepik.api.key}")
    private String freepikApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public AIMusicResponse generateMusic(AIMusicRequest request) {
        String finalPrompt = buildPrompt(request);

        String taskId = createMusicTask(finalPrompt, request.getDuration());
        String audioUrl = pollForAudioUrl(taskId);

        String title = "AI Track - " + safeCap(request.getGenre()) + " " + safeCap(request.getMood());
        String description = "Prompt: " + nullSafe(request.getPrompt())
                + " | Genre: " + nullSafe(request.getGenre())
                + " | Mood: " + nullSafe(request.getMood())
                + " | BPM: " + request.getBpm()
                + " | Duration: " + request.getDuration() + " sec"
                + " | " + (request.isInstrumentalOnly() ? "Instrumental only" : "Vocals allowed");

        return new AIMusicResponse(
                title,
                description,
                request.getMood() == null || request.getMood().isBlank() ? "neutral" : request.getMood(),
                "major",
                request.getBpm() > 0 ? request.getBpm() : 100,
                request.isInstrumentalOnly() ? "instrumental" : "mixed",
                "N/A",
                java.util.Arrays.asList(),
                "completed"
        );
    }

    private String buildPrompt(AIMusicRequest request) {
        StringBuilder sb = new StringBuilder();

        if (request.getGenre() != null && !request.getGenre().isBlank()) {
            sb.append(request.getGenre()).append(" ");
        }

        if (request.getMood() != null && !request.getMood().isBlank()) {
            sb.append(request.getMood()).append(" ");
        }

        sb.append("music track, ");

        if (request.getBpm() > 0) {
            sb.append(request.getBpm()).append(" BPM, ");
        }

        if (request.isInstrumentalOnly()) {
            sb.append("instrumental only, ");
        }

        sb.append("high quality composition");

        if (request.getPrompt() != null && !request.getPrompt().isBlank()) {
            sb.append(", ").append(request.getPrompt());
        }

        return sb.toString();
    }

    private String createMusicTask(String prompt, int duration) {
        String url = "https://api.freepik.com/v1/ai/music-generation";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-freepik-api-key", freepikApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("prompt", prompt);
        body.put("music_length_seconds", Math.max(10, Math.min(duration, 240)));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Failed to create Freepik music task.");
        }

        Map responseBody = response.getBody();
        Object dataObj = responseBody.get("data");

        if (!(dataObj instanceof Map data)) {
            throw new RuntimeException("Invalid Freepik response: missing data.");
        }

        Object taskIdObj = data.get("task_id");
        if (taskIdObj == null) {
            throw new RuntimeException("Invalid Freepik response: missing task_id.");
        }

        return taskIdObj.toString();
    }

    private String pollForAudioUrl(String taskId) {
        String url = "https://api.freepik.com/v1/ai/music-generation/" + taskId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-freepik-api-key", freepikApiKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        for (int i = 0; i < 30; i++) {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();
                Object dataObj = responseBody.get("data");

                if (dataObj instanceof Map data) {
                    Object statusObj = data.get("status");
                    String status = statusObj != null ? statusObj.toString() : "";

                    if ("COMPLETED".equalsIgnoreCase(status) || "FINISHED".equalsIgnoreCase(status)) {
                        Object generatedObj = data.get("generated");

                        if (generatedObj instanceof List<?> generatedList && !generatedList.isEmpty()) {
                            Object firstItem = generatedList.get(0);

                            if (firstItem instanceof String) {
                                return firstItem.toString();
                            }

                            if (firstItem instanceof Map firstMap) {
                                Object urlObj = firstMap.get("url");
                                if (urlObj != null) {
                                    return urlObj.toString();
                                }
                            }
                        }

                        throw new RuntimeException("Music generated, but audio URL not found.");
                    }

                    if ("FAILED".equalsIgnoreCase(status) || "ERROR".equalsIgnoreCase(status)) {
                        throw new RuntimeException("Music generation failed at provider.");
                    }
                }
            }

            try {
                Thread.sleep(4000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Polling interrupted.");
            }
        }

        throw new RuntimeException("Timed out waiting for generated music.");
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private String safeCap(String value) {
        if (value == null || value.isBlank()) return "Custom";
        return value.substring(0, 1).toUpperCase() + value.substring(1).toLowerCase();
    }
}