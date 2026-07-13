import { useNavigate } from "react-router-dom";
import "./Home.css";

const GAMES = [
  { path: "/sound-board", emoji: "🎵", title: "톡톡 사운드", color: "#ff7b7b", ready: true },
  { path: "/sketch", emoji: "✏️", title: "손가락 그리기", color: "#6ec6ff", ready: false },
  { path: "/shout", emoji: "🐣", title: "소리 마법", color: "#a0e57a", ready: false },
  { path: "/hide-and-seek", emoji: "🔍", title: "숨은 글자", color: "#ffb84d", ready: false },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1 className="home-title">
        <span role="img" aria-label="star">⭐</span> 무엇을 하고 놀까요?{" "}
        <span role="img" aria-label="star">⭐</span>
      </h1>
      <div className="home-grid">
        {GAMES.map((g) => (
          <button
            key={g.path}
            className="game-card"
            style={{ background: g.color }}
            onClick={() => navigate(g.path)}
          >
            <span className="game-emoji" role="img" aria-label={g.title}>
              {g.emoji}
            </span>
            <span className="game-name">{g.title}</span>
            {!g.ready && <span className="game-badge">곧 나와요</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
