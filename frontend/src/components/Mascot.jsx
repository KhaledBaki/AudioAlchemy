import React from "react";
import "../styles/Mascot.css";

function Mascot({ isBopping = false, label = "Your musical companion" }) {
    const mascotClassName = isBopping ? "mascot mascot-bopping" : "mascot";

    return (
        <div className="mascot-wrapper">
            <div className={mascotClassName}>
                {/* Music note body */}
                <div className="mascot-note-body">
                    <div className="mascot-eye left-eye">
                        <div className="eye-highlight"></div>
                    </div>
                    <div className="mascot-eye right-eye">
                        <div className="eye-highlight"></div>
                    </div>
                    <div className="mascot-mouth"></div>
                </div>

                {/* Note stem and flag */}
                <div className="mascot-note-stem"></div>
                <div className="mascot-note-flag"></div>

                {/* Legs */}
                <div className="mascot-leg mascot-left-leg"></div>
                <div className="mascot-leg mascot-right-leg"></div>

                {/* Shoes */}
                <div className="mascot-shoe mascot-left-shoe"></div>
                <div className="mascot-shoe mascot-right-shoe"></div>
            </div>

            <p className="mascot-label">{label}</p>
        </div>
    );
}

export default Mascot;