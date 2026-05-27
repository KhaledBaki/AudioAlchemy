import React,{useState,useEffect,useRef} from "react";
import{useNavigate}from"react-router-dom";
import"../styles/LoadingScreen.css";
const MSGS=["Calibrating alchemical constants...","Tuning harmonic frequencies...","Loading chord progressions...","Preparing your studio...","Warming up instruments..."];
const HINTS=[{icon:"🎹",label:"Freeform"},{icon:"🤖",label:"AI Music"},{icon:"🥁",label:"Metronome"},{icon:"🎸",label:"Backtrack"},{icon:"👂",label:"Ear Train"},{icon:"🎼",label:"Song Lab"}];
export default function LoadingScreen(){
  const nav=useNavigate();
  const[p,setP]=useState(0);
  const[mi,setMi]=useState(0);
  const raf=useRef(null);const t0=useRef(null);
  useEffect(()=>{
    t0.current=performance.now();
    const tick=now=>{const el=now-t0.current;const np=Math.min((el/2400)*100,100);setP(Math.floor(np));if(np<100)raf.current=requestAnimationFrame(tick);else setTimeout(()=>nav("/menu"),250);};
    raf.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf.current);
  },[nav]);
  useEffect(()=>{const t=setInterval(()=>setMi(i=>(i+1)%MSGS.length),600);return()=>clearInterval(t);},[]);
  return(
      <div className="loading-screen-container">
        <div className="ls-blob ls-blob-1"/><div className="ls-blob ls-blob-2"/><div className="ls-blob ls-blob-3"/>
        <div className="ls-dots"/>
        <div className="ls-logo-wrap">
          <div className="ls-rings">
            <div className="ls-ring ls-ring-1"/><div className="ls-ring ls-ring-2"/>
            <div className="ls-ring ls-ring-3"/><span className="ls-sym">𝅘𝅥𝅮</span>
          </div>
          <h1 className="ls-title">AudioAlchemy</h1>
          <p className="ls-tagline">— compose your world —</p>
          <div className="ls-progress-wrap">
            <div className="ls-progress-header">
              <span className="ls-progress-msg">{MSGS[mi]}</span>
              <span className="ls-progress-pct">{p}%</span>
            </div>
            <div className="ls-track"><div className="ls-fill" style={{width:p+"%"}}/></div>
          </div>
        </div>
        <div className="ls-hints">{HINTS.map(h=>(
            <div key={h.label} className="ls-hint">
              <div className="ls-hint-icon">{h.icon}</div>
              <div className="ls-hint-text">{h.label}</div>
            </div>))}
        </div>
      </div>
  );
}