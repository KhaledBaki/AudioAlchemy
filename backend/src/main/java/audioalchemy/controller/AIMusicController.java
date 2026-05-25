package audioalchemy.controller;

import audioalchemy.engine.AIMusicEngine;
import audioalchemy.model.AIMusicRequest;
import audioalchemy.model.AIMusicResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-music")
@CrossOrigin(origins = "http://localhost:5173")
public class AIMusicController {

    @PostMapping("/generate")
    public AIMusicResponse generateTrack(@RequestBody AIMusicRequest request) {
        return AIMusicEngine.analyze(request);
    }
}