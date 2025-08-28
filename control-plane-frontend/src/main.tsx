// import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"

import "./index.css"
import "./css/SFProDisplay.css"
import "./css/Rubik.css"
import "./css/style.scss"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Router>
    <App />
  </Router>,
  // </StrictMode>,
)
