import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./components/App.tsx";
import "@assets/styles/globals.scss";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
