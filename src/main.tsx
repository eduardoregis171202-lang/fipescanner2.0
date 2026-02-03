import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker (PWA)
// In DEV, a SW can cache Vite scripts and break React (hooks dispatcher becomes null).
// So: unregister + clear caches in DEV; register only in PROD.
if ("serviceWorker" in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  }

  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
