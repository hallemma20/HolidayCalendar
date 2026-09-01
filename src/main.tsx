import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ConfigTab from './ConfigTab.tsx'

const Root = window.location.pathname === '/config' ? ConfigTab : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
