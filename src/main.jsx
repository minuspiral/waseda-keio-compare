import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Reactマウント後、SEO用静的テキストを非表示化
const seoEl = document.getElementById('seo-content')
if (seoEl) seoEl.style.display = 'none'
