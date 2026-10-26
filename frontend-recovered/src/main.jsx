import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'

// Adopt the static crawler fallback tags so Helmet replaces them rather than
// leaving duplicate homepage previews ahead of article-specific metadata.
document.head.querySelectorAll('title, link[rel="canonical"], meta[name="title"], meta[name="description"], meta[name="keywords"], meta[name="author"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"]').forEach(node => node.setAttribute('data-rh', 'true'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
) 
