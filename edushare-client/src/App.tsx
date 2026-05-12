import React from 'react'
import LandingPage from './pages/Landingpage'
import { BrowserRouter, Router } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
   
  )
}
