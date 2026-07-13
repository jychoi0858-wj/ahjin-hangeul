import { useNavigate } from "react-router-dom";

function ComingSoon({ title }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "#fff8e7",
      }}
    >
      <button className="home-btn" onClick={() => navigate("/")}>
        🏠
      </button>
      <div style={{ fontSize: "5rem" }} role="img" aria-label="공사중">
        🚧
      </div>
      <h2 style={{ color: "#ff7b3d", fontSize: "2rem", textAlign: "center" }}>
        {title}
      </h2>
      <p style={{ color: "#a08a6f", fontSize: "1.2rem" }}>곧 만나요!</p>
    </div>
  );
}

export default ComingSoon;
