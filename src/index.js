import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ensureAuth } from "./firebase/authBootstrap";

// HashRouter: GitHub Pages sub-path refresh stays working.
// Kick off anonymous sign-in so Firestore Azure key is readable.
ensureAuth();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
