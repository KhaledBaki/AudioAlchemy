import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Freeform from "./pages/Freeform";
import MainMenu from "./pages/MainMenu";
import Metronome from "./pages/Metronome";
import Backtracking from "./pages/Backtracking";
import AIGenerator from "./pages/AIGenerator.jsx";
import LoadingScreen from "./pages/LoadingScreen";
import SongLab from "./pages/SongLab";
import EarTrainer from "./pages/EarTrainer";

function App() {
    const [selectedTheme, setSelectedTheme] = useState("rustic");

    useEffect(() => {
        document.body.setAttribute("data-theme", selectedTheme);
    }, [selectedTheme]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoadingScreen />} />
                <Route path="/menu" element={<MainMenu selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} />} />
                <Route path="/freeform" element={<Freeform />} />
                <Route path="/Freeform" element={<Freeform />} />
                <Route path="/metronome" element={<Metronome />} />
                <Route path="/editor" element={<SongLab />} />
                <Route path="/backtracking" element={<Backtracking />} />
                <Route path="/ai-assisted" element={<AIGenerator />} />
                <Route path="/songlab" element={<SongLab />} />
                <Route path="/ear-trainer" element={<EarTrainer />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
