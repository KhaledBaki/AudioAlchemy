import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import LoadingScreen from "./pages/LoadingScreen";
import MainMenu     from "./pages/MainMenu";
import Freeform     from "./pages/Freeform";
import AIGenerator  from "./pages/AIGenerator";
import Backtracking from "./pages/Backtracking";
import Metronome    from "./pages/Metronome";
import MusicEditor  from "./pages/MusicEditor";

export default function App() {
  const [selectedTheme, setSelectedTheme] = useState("rustic");

  useEffect(() => {
    document.body.setAttribute("data-theme", selectedTheme);
  }, [selectedTheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<LoadingScreen />} />
        <Route path="/menu"        element={<MainMenu selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} />} />
        <Route path="/freeform"    element={<Freeform />} />
        <Route path="/ai-assisted" element={<AIGenerator />} />
        <Route path="/backtracking"element={<Backtracking />} />
        <Route path="/metronome"   element={<Metronome />} />
        <Route path="/editor"      element={<MusicEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
