import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoadingScreen.css";

function LoadingScreen() {
    const navigate = useNavigate();
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        const loadingTimer = setInterval(() => {
            setLoadingProgress((currentProgress) => {
                if (currentProgress >= 100) {
                    clearInterval(loadingTimer);
                    return 100;
                }

                return currentProgress + 2;
            });
        }, 30);

        return () => clearInterval(loadingTimer);
    }, []);

    useEffect(() => {
        if (loadingProgress >= 100) {
            navigate("/menu");
        }
    }, [loadingProgress, navigate]);

    return (
        <div className="loading-screen-container">
            <h1 className="loading-title">AudioAlchemy</h1>
            <p className="loading-subtitle">— compose your world —</p>

            <div className="loading-mascot">𝅘𝅥𝅮</div>

            <div className="loading-bar-track">
                <div
                    className="loading-bar-fill"
                    style={{ width: loadingProgress + "%" }}
                ></div>
            </div>

            <p className="loading-text">Loading...</p>
        </div>
    );
}

export default LoadingScreen;