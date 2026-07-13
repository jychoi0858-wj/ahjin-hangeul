import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LetterCard from "./LetterCard";
import { ALPHABET, HANGEUL } from "../../data/letters";
import { speak, stopSpeaking } from "../../services/azureTts";
import "./SoundBoard.css";

function SoundBoard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("en"); // "en" | "ko"
  const [popup, setPopup] = useState(null); // { emoji, word }
  const popupTimer = useRef(null);

  const letters = mode === "en" ? ALPHABET : HANGEUL;

  const handleActivate = useCallback(
    (item) => {
      setPopup({ emoji: item.emoji, word: item.word });
      speak(item.say, { lang: mode, cacheKey: `${mode}:${item.char}` });
      // 2.4초 뒤 자동으로 사라짐 (아이가 닫을 필요 없음)
      if (popupTimer.current) clearTimeout(popupTimer.current);
      popupTimer.current = setTimeout(() => setPopup(null), 2400);
    },
    [mode]
  );

  useEffect(() => () => clearTimeout(popupTimer.current), []);

  const switchMode = (next) => {
    if (next === mode) return;
    stopSpeaking();
    setPopup(null);
    setMode(next);
  };

  return (
    <div className="sound-board">
      <button
        className="home-btn"
        onClick={() => {
          stopSpeaking();
          navigate("/");
        }}
      >
        🏠
      </button>

      <div className="mode-switch">
        <button
          className={`mode-pill ${mode === "en" ? "active" : ""}`}
          onClick={() => switchMode("en")}
        >
          ABC
        </button>
        <button
          className={`mode-pill ${mode === "ko" ? "active" : ""}`}
          onClick={() => switchMode("ko")}
        >
          가나다
        </button>
      </div>

      <div className={`board-grid ${mode}`}>
        {letters.map((item, i) => (
          <LetterCard
            key={item.char}
            item={item}
            index={i}
            onActivate={handleActivate}
          />
        ))}
      </div>

      {popup && (
        <div
          className="popup-overlay"
          key={popup.word + Math.random()}
          onClick={() => setPopup(null)}
        >
          <div className="popup-card">
            <span className="popup-emoji" role="img" aria-label={popup.word}>
              {popup.emoji}
            </span>
            <span className="popup-word">{popup.word}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SoundBoard;
