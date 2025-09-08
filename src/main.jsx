import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

const root = createRoot(document.getElementById('root'))
root.render(<App />)

// Register SW (GitHub Pages path aware)
const base = import.meta.env.VITE_GH_PAGES_BASE || '/YOUR-REPO-NAME/';
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(base + 'public/sw.js').catch(console.warn);
  });
}
