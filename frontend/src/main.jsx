import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import './styles.css'

// Dark is the default theme.
const storedTheme = localStorage.getItem('notesapp.theme')
const isDark = storedTheme ? storedTheme === 'dark' : true
document.documentElement.classList.toggle('dark', isDark)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
