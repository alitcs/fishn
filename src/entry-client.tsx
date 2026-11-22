import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { captureAttribution } from "./services/analytics";
import "./styles.css";
import "./journey.css";
import "./conversion.css";
import "./glass.css";
captureAttribution();
const root = document.getElementById("root")!;
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
if (root.querySelector("main")) hydrateRoot(root, app);
else createRoot(root).render(app);
