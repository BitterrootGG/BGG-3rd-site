import React from 'react'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Services, Contact, Process, Hero, Navbar, ServiceArea } from './components'

function App() {
  return (
      <BrowserRouter>
        <div className='relative z-0 bg-forest-black text-stone-light min-h-screen'>
          <div className="bg-forest-black">
            <Navbar />
            <Hero />
          </div>
          <Services />
          <Process />
          <ServiceArea />
          <div className="relative z-0 bg-forest-dark">
            <Contact />
          </div>
        </div>
      </BrowserRouter>
  )
}

export default App
