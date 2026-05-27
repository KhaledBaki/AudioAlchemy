import React from "react";
import{useNavigate}from"react-router-dom";
import Mascot from"../components/Mascot";
import"../styles/MainMenu.css";

const NAV_CARDS=[
  {path:"/freeform",     title:"Freeform Play",       desc:"Live keyboard chord performance — hold roots, layer variations.",        icon:"🎹", cls:"mm-card-icon-violet",  badge:null,         arrow:true},
  {path:"/ai-assisted",  title:"AI Composer",          desc:"Describe your vision and get a full musical blueprint instantly.",        icon:"🤖", cls:"mm-card-icon-crimson", badge:"AI",         arrow:true},
  {path:"/backtracking", title:"Backing Track",         desc:"Build diatonic progressions and improvise over a live backing track.",   icon:"🎸", cls:"mm-card-icon-teal",    badge:null,         arrow:true},
  {path:"/metronome",    title:"Metronome",             desc:"Precision tempo with custom time signatures and beat visualizer.",       icon:"🥁", cls:"mm-card-icon-gold",    badge:null,         arrow:true},
  {path:"/song-lab",     title:"Song Lab",              desc:"Build verse/chorus/bridge structures with chord progressions & playback.",icon:"🎼", cls:"mm-card-icon-green",  badge:"NEW",        arrow:true},
  {path:"/ear-trainer",  title:"Ear Trainer",           desc:"Train your musical ear — identify chords, intervals & melodies.",        icon:"👂", cls:"mm-card-icon-pink",    badge:"NEW",        arrow:true},
];

const THEMES=[
  {id:"rustic",  label:"Rustic",  swatch:"#9D2F38"},
  {id:"concert", label:"Concert", swatch:"#2E2A26"},
  {id:"beach",   label:"Beach",   swatch:"#6A4A2F"},
];

export default function MainMenu({selectedTheme,setSelectedTheme}){
  const navigate=useNavigate();
  return(
      <div className="main-menu-page">
        <div className="mm-blob mm-blob-1"/><div className="mm-blob mm-blob-2"/><div className="mm-blob mm-blob-3"/>
        <div className="mm-layout">
          <aside className="mm-sidebar">
            <div className="mm-brand">
              <div className="mm-brand-symbol">𝅘𝅥𝅮</div>
              <div className="mm-brand-name">AudioAlchemy</div>
              <div className="mm-brand-tag">music creation platform</div>
            </div>
            <div className="mm-mascot-wrap"><Mascot label="Your musical companion"/></div>
            <div className="mm-sidebar-footer"><div className="mm-version">v2.0.0 · light edition</div></div>
          </aside>

          <main className="mm-content">
            <div className="mm-header">
              <div className="mm-greeting">Studio Dashboard</div>
              <h1 className="mm-title">What will you<br/><span>create today?</span></h1>
              <p className="mm-subtitle">Six tools, one canvas. Choose your creative mode and start making music.</p>
            </div>

            <div className="mm-nav-grid">
              {NAV_CARDS.map(c=>(
                  <button key={c.path} className="mm-nav-card" onClick={()=>navigate(c.path)}>
                    <div className={`mm-card-icon-wrap ${c.cls}`}>{c.icon}</div>
                    <div className="mm-card-body">
                      <div className="mm-card-title">{c.title}</div>
                      <div className="mm-card-desc">{c.desc}</div>
                    </div>
                    {c.badge&&<span className="mm-card-badge badge badge-violet">{c.badge}</span>}
                    <span className="mm-card-arrow">↗</span>
                  </button>
              ))}
            </div>

            <div className="mm-theme-section">
              <div className="mm-theme-label">Visual theme</div>
              <div className="mm-theme-pills">
                {THEMES.map(t=>(
                    <button key={t.id} className={`mm-theme-pill${selectedTheme===t.id?" active":""}`} onClick={()=>setSelectedTheme(t.id)}>
                      <span className="mm-theme-swatch" style={{background:t.swatch}}/>
                      {t.label}
                    </button>
                ))}
              </div>
            </div>

            <div className="mm-status-bar">
              <div className="mm-status-item"><div className="mm-status-dot"/>Engine online</div>
              <div className="mm-status-item">⚡ 6 modules loaded</div>
              <div className="mm-status-item">🎵 Web Audio API ready</div>
            </div>
          </main>
        </div>
      </div>
  );
}