import React from "react";
import { useNavigate } from "react-router-dom";

function MusicEditor() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", background:"var(--void)",
      fontFamily:"var(--font-heading)", color:"var(--text-primary)", gap:"24px"
    }}>
      <div style={{fontSize:"3rem"}}>🎛️</div>
      <h1 style={{fontFamily:"var(--font-heading)",fontSize:"2rem",color:"var(--text-bright)"}}>Music Editor</h1>
      <p style={{color:"var(--text-secondary)",fontFamily:"var(--font-mono)",fontSize:"0.8rem",letterSpacing:"0.1em"}}>COMING SOON</p>
      <button onClick={() => navigate("/menu")} style={{
        marginTop:"16px", padding:"12px 24px", borderRadius:"12px",
        background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
        color:"var(--text-primary)", cursor:"pointer", fontFamily:"var(--font-body)",
        fontSize:"0.9rem", fontWeight:"500"
      }}>← Back to Menu</button>
    </div>
  );
}

export default MusicEditor;
