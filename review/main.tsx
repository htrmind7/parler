import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/tokens.css'
import '../src/styles/global.css'
import './review.css'
import { ReviewApp } from './ReviewApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReviewApp />
  </StrictMode>,
)
