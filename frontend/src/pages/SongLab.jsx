import React,{useState,useRef,useCallback,useMemo}from"react";
import{useNavigate}from"react-router-dom";
import"./SongLab.css";
import{getDiatonicChords,getAvailableKeys}from"../utils/musicTheory";

const SECTION_COLORS={Intro:"#7C3AED",Verse:"#0891B2",Chorus:"#DC2626",Bridge:"#D97706",Outro:"#059669",Solo:"#BE185D"};
const SECTION_TYPES=["Intro","Verse","Chorus","Bridge","Solo","Outro"];
const NOTE_SEMITONE={C:0,"C#":1,D:2,"D#":3,E:4,F:5,"F#":6,G:7,"G#":8,A:9,"A#":10,B:11};
const CHROMATIC=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const ROMAN_MAJOR=["I","II","III","IV","V","VI","VII"];
const ROMAN_MINOR=["i","ii°","III","iv","v","VI","VII"];
const QUALITY_MAP={"":"Maj","m":"min","dim":"dim","aug":"aug","7":"7","maj7":"maj7","m7":"min7","sus2":"sus2","sus4":"sus4"};

const TEMPLATES=[
    {name:"Pop Standard",    chords:["C","F","Am","G"],       desc:"I-IV-vi-V"},
    {name:"50s Doo-Wop",     chords:["C","Am","F","G"],       desc:"I-vi-IV-V"},
    {name:"Jazz ii-V-I",     chords:["Dm7","G7","Cmaj7","Am7"],desc:"ii7-V7-Imaj7"},
    {name:"Andalusian Cadence",chords:["Am","G","F","E"],     desc:"i-VII-VI-V"},
    {name:"Royal Road",      chords:["C","Em","F","G"],       desc:"I-iii-IV-V"},
    {name:"Minor Epic",      chords:["Am","F","C","G"],       desc:"vi-IV-I-V"},
    {name:"Creep Progression",chords:["C","E","F","Fm"],      desc:"I-III-IV-iv"},
];

function getFreq(note,octave=4){const m=(octave+1)*12+NOTE_SEMITONE[note];return 440*Math.pow(2,(m-69)/12);}
function getChordNotes(name){
    const root=name.replace(/maj7|sus2|sus4|aug|dim|m7|7|m$/g,"");
    if(name.endsWith("maj7"))return[root,CHROMATIC[(CHROMATIC.indexOf(root)+4)%12],CHROMATIC[(CHROMATIC.indexOf(root)+7)%12],CHROMATIC[(CHROMATIC.indexOf(root)+11)%12]];
    if(name.endsWith("m7"))return[root,CHROMATIC[(CHROMATIC.indexOf(root)+3)%12],CHROMATIC[(CHROMATIC.indexOf(root)+7)%12],CHROMATIC[(CHROMATIC.indexOf(root)+10)%12]];
    if(name.endsWith("7"))return[root,CHROMATIC[(CHROMATIC.indexOf(root)+4)%12],CHROMATIC[(CHROMATIC.indexOf(root)+7)%12],CHROMATIC[(CHROMATIC.indexOf(root)+10)%12]];
    if(name.endsWith("m"))return[root,CHROMATIC[(CHROMATIC.indexOf(root)+3)%12],CHROMATIC[(CHROMATIC.indexOf(root)+7)%12]];
    return[root,CHROMATIC[(CHROMATIC.indexOf(root)+4)%12],CHROMATIC[(CHROMATIC.indexOf(root)+7)%12]];
}

let audioCtx=null;
function playChord(name,dur=1.5,vol=0.12){
    if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==="suspended")audioCtx.resume();
    const notes=getChordNotes(name);
    const now=audioCtx.currentTime;
    notes.forEach((n,i)=>{
        const osc=audioCtx.createOscillator();
        const gain=audioCtx.createGain();
        const filt=audioCtx.createBiquadFilter();
        filt.type="lowpass";filt.frequency.value=1800;
        osc.type=i===0?"sawtooth":"triangle";
        osc.frequency.value=getFreq(n,i===0?3:4);
        gain.gain.setValueAtTime(0.0001,now);
        gain.gain.linearRampToValueAtTime(vol,now+0.05);
        gain.gain.linearRampToValueAtTime(0.0001,now+dur-0.05);
        osc.connect(filt);filt.connect(gain);gain.connect(audioCtx.destination);
        osc.start(now);osc.stop(now+dur);
    });
}

export default function SongLab(){
    const navigate=useNavigate();
    const[key,setKey]=useState("C");
    const[scale,setScale]=useState("major");
    const[bpm,setBpm]=useState(100);
    const[sections,setSections]=useState([
        {id:1,type:"Verse",chords:["C","Am","F","G"]},
        {id:2,type:"Chorus",chords:["C","G","Am","F"]},
    ]);
    const[isPlaying,setIsPlaying]=useState(false);
    const[currentChord,setCurrentChord]=useState("");
    const[progress,setProgress]=useState(0);
    const[activeSection,setActiveSection]=useState(1);
    const timerRef=useRef(null);
    const idRef=useRef(10);

    const palette=useMemo(()=>getDiatonicChords(key,scale),[key,scale]);

    // Playback
    const stopPlay=useCallback(()=>{
        clearTimeout(timerRef.current);setIsPlaying(false);setCurrentChord("");setProgress(0);
    },[]);

    const startPlay=useCallback(()=>{
        const allChords=sections.flatMap(s=>s.chords);
        if(!allChords.length)return;
        setIsPlaying(true);
        const chordDur=(60/bpm)*2;
        let i=0;
        const step=()=>{
            if(i>=allChords.length){setIsPlaying(false);setCurrentChord("");setProgress(0);return;}
            const c=allChords[i];
            setCurrentChord(c);
            setProgress(Math.round((i/allChords.length)*100));
            playChord(c,chordDur-0.08);
            i++;
            timerRef.current=setTimeout(step,chordDur*1000);
        };
        step();
    },[sections,bpm]);

    const addSection=()=>{
        const type=SECTION_TYPES[sections.length%SECTION_TYPES.length]||"Verse";
        setSections(s=>[...s,{id:++idRef.current,type,chords:[]}]);
    };
    const removeSection=id=>setSections(s=>s.filter(x=>x.id!==id));
    const addChordToSection=(secId,chord)=>setSections(s=>s.map(x=>x.id===secId?{...x,chords:[...x.chords,chord]}:x));
    const removeChordFromSection=(secId,idx)=>setSections(s=>s.map(x=>x.id===secId?{...x,chords:x.chords.filter((_,i)=>i!==idx)}:x));
    const loadTemplate=t=>{
        const sec=sections.find(s=>s.id===activeSection)||sections[0];
        if(!sec)return;
        setSections(s=>s.map(x=>x.id===sec.id?{...x,chords:t.chords}:x));
    };
    const changeSectionType=(secId,type)=>setSections(s=>s.map(x=>x.id===secId?{...x,type}:x));
    const totalChords=sections.reduce((a,s)=>a+s.chords.length,0);
    const totalBars=Math.ceil(totalChords/4);

    return(
        <div className="sl-page">
            <div className="sl-topbar">
                <button className="sl-back-btn" onClick={()=>navigate("/menu")}>← Menu</button>
                <span className="sl-topbar-title">🎼 Song Lab</span>
                <span className="badge badge-violet" style={{marginLeft:8}}>NEW</span>
                <div className="sl-topbar-actions">
                    {isPlaying
                        ?<button className="btn btn-ghost" style={{fontSize:"0.82rem"}} onClick={stopPlay}>⏹ Stop</button>
                        :<button className="btn btn-primary" style={{fontSize:"0.82rem"}} onClick={startPlay} disabled={!totalChords}>▶ Play Song</button>
                    }
                </div>
            </div>

            <div className="sl-layout">
                {/* Settings */}
                <div className="sl-settings">
                    <div>
                        <div className="sl-panel-label">Key & Scale</div>
                        <div style={{display:"flex",gap:8}}>
                            <div className="sl-field" style={{flex:1}}>
                                <select className="sl-select" value={key} onChange={e=>setKey(e.target.value)}>
                                    {getAvailableKeys().map(k=><option key={k}>{k}</option>)}
                                </select>
                            </div>
                            <div className="sl-field" style={{flex:1}}>
                                <select className="sl-select" value={scale} onChange={e=>setScale(e.target.value)}>
                                    <option value="major">Major</option>
                                    <option value="minor">Minor</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="sl-panel-label">Tempo</div>
                        <div className="sl-bpm-row">
                            <input type="range" className="sl-range" min="50" max="200" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/>
                            <span className="sl-bpm-num">{bpm}</span>
                        </div>
                    </div>
                    <div>
                        <div className="sl-panel-label">Famous Progressions</div>
                        <div className="sl-templates">
                            {TEMPLATES.map(t=>(
                                <button key={t.name} className="sl-template-btn" onClick={()=>loadTemplate(t)}>
                                    <span className="sl-template-name">{t.name}</span>
                                    <span className="sl-template-chords">{t.chords.join(" – ")} · {t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Builder */}
                <div className="sl-builder">
                    {sections.map(sec=>(
                        <div key={sec.id} className="sl-section-block" onClick={()=>setActiveSection(sec.id)} style={{outline:activeSection===sec.id?`2px solid ${SECTION_COLORS[sec.type]||"#7C3AED"}`:"2px solid transparent",outlineOffset:"2px"}}>
                            <div className="sl-section-header" style={{borderLeft:`4px solid ${SECTION_COLORS[sec.type]||"#7C3AED"}`}}>
                                <select value={sec.type} onChange={e=>changeSectionType(sec.id,e.target.value)} style={{border:"none",background:"transparent",fontWeight:700,fontSize:"0.9rem",cursor:"pointer",color:SECTION_COLORS[sec.type]||"#7C3AED",outline:"none",fontFamily:"var(--font-body)"}}>
                                    {SECTION_TYPES.map(t=><option key={t}>{t}</option>)}
                                </select>
                                <span style={{fontFamily:"var(--font-mono)",fontSize:"0.65rem",color:"var(--text-muted)"}}>{sec.chords.length} chords</span>
                                <div className="sl-section-actions">
                                    <button className="sl-sec-btn danger" onClick={e=>{e.stopPropagation();removeSection(sec.id);}}>×</button>
                                </div>
                            </div>
                            <div className="sl-section-chords">
                                {sec.chords.length===0&&<span className="sl-chord-empty">Click chords below to add them here ↓</span>}
                                {sec.chords.map((c,i)=>(
                                    <div key={`${c}-${i}`} className="sl-chord-pill" onClick={e=>{e.stopPropagation();playChord(c,1);}}>
                                        {c}
                                        <button className="sl-chord-pill-remove" onClick={e=>{e.stopPropagation();removeChordFromSection(sec.id,i);}}>×</button>
                                    </div>
                                ))}
                            </div>
                            {activeSection===sec.id&&(
                                <div className="sl-palette">
                                    <div className="sl-palette-label">Diatonic chords for {key} {scale} — click to add</div>
                                    <div className="sl-palette-grid">
                                        {palette.map(c=>(
                                            <button key={c} className="sl-palette-chord" onClick={()=>{addChordToSection(sec.id,c);playChord(c,0.8);}}>
                                                {c}
                                            </button>
                                        ))}
                                        {["C","Cm","D","Dm","E","Em","F","Fm","G","Gm","A","Am","B","Bm"].filter(c=>!palette.includes(c)).slice(0,8).map(c=>(
                                            <button key={`ext-${c}`} className="sl-palette-chord" style={{opacity:0.55}} onClick={()=>{addChordToSection(sec.id,c);playChord(c,0.8);}}>
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <button className="sl-add-section-btn" onClick={addSection}>+ Add Section</button>
                </div>

                {/* Analysis */}
                <div className="sl-analysis">
                    <div className="sl-playback-card">
                        <div className="sl-playback-title">🎵 Playback</div>
                        <div className="sl-chord-now">{currentChord||"—"}</div>
                        <div className="sl-progress-bar"><div className="sl-progress-fill" style={{width:progress+"%"}}/></div>
                        <button className="sl-play-btn" onClick={isPlaying?stopPlay:startPlay} disabled={!totalChords}>
                            {isPlaying?"⏹ Stop":"▶ Play Full Song"}
                        </button>
                        {isPlaying&&<div className="sl-play-status">Playing… {currentChord}</div>}
                    </div>

                    <div className="sl-analysis-card">
                        <div className="sl-analysis-title">Song Overview</div>
                        <div className="sl-song-overview">
                            {[["Key",`${key} ${scale}`],["Tempo",`${bpm} BPM`],["Sections",sections.length],["Total Chords",totalChords],["Approx. Bars",totalBars]].map(([k,v])=>(
                                <div key={k} className="sl-overview-row">
                                    <span className="sl-overview-key">{k}</span>
                                    <span className="sl-overview-val">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {sections.map(sec=>(
                        <div key={sec.id} className="sl-analysis-card">
                            <div className="sl-analysis-title" style={{color:SECTION_COLORS[sec.type]||"#7C3AED"}}>{sec.type}</div>
                            <div className="sl-roman">
                                {sec.chords.map((c,i)=>{
                                    const idx=palette.indexOf(c);
                                    const roman=scale==="major"?ROMAN_MAJOR:ROMAN_MINOR;
                                    const label=idx>=0?roman[idx]:c;
                                    return<span key={i} className="sl-roman-chip">{label}</span>;
                                })}
                                {sec.chords.length===0&&<span style={{fontSize:"0.75rem",color:"var(--text-ghost)"}}>No chords yet</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}