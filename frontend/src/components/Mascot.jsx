import React from "react";
import "../styles/Mascot.css";

function Mascot({ isBopping = false, label = "Your musical companion" }) {
  return (
    <div className="mascot-wrapper">
      <div className={`mascot${isBopping ? " mascot-bopping" : ""}`}>
        <div className="mascot-note-body">
          <div className="mascot-eye left-eye"><div className="eye-highlight" /></div>
          <div className="mascot-eye right-eye"><div className="eye-highlight" /></div>
          <div className="mascot-mouth" />
        </div>
        <div className="mascot-note-stem" />
        <div className="mascot-note-flag" />
        <div className="mascot-leg mascot-left-leg" />
        <div className="mascot-leg mascot-right-leg" />
        <div className="mascot-shoe mascot-left-shoe" />
        <div className="mascot-shoe mascot-right-shoe" />
      </div>
      {label && <p className="mascot-label">{label}</p>}
    </div>
  );
}

export default Mascot;
