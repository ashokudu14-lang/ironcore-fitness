import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './premium.css'
import ScrollProgress from './components/ScrollProgress.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScrollProgress />
    <App />
  </StrictMode>,
)
