import { useState } from "react";

const COLORS = [
  "#ff7b7b", "#ffa14d", "#ffd166", "#8ed17c",
  "#6ec6ff", "#b28dff", "#ff9ecb", "#5ecdc4",
];

function LetterCard({ item, index, onActivate }) {
  const [bouncing, setBouncing] = useState(false);
  const color = COLORS[index % COLORS.length];

  const handleTap = () => {
    // 애니메이션 재시작을 위해 클래스 토글
    setBouncing(false);
    requestAnimationFrame(() => setBouncing(true));
    onActivate(item);
  };

  return (
    <button
      className={`letter-card ${bouncing ? "bounce" : ""}`}
      style={{ background: color }}
      onClick={handleTap}
      onAnimationEnd={() => setBouncing(false)}
      aria-label={item.word}
    >
      <span className="letter-char">{item.char}</span>
    </button>
  );
}

export default LetterCard;
