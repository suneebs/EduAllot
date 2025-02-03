import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ExcelUploader from './components/viewDetails'

function App() {

  return (
    <>
      <header className="App-header">
        <h1 className="App-title">Student allotment details</h1>
      </header>
      <ExcelUploader />
    </>
  )
}

export default App
