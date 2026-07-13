import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import SoundBoard from "./components/SoundBoard/SoundBoard";
import ComingSoon from "./components/ComingSoon";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sound-board" element={<SoundBoard />} />
        <Route path="/sketch" element={<ComingSoon title="마법의 손가락 스케치북" />} />
        <Route path="/shout" element={<ComingSoon title="소리 내어 마법 부리기" />} />
        <Route path="/hide-and-seek" element={<ComingSoon title="꼭꼭 숨어라 빙고" />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
