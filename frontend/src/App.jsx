import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import LoginPage from './components/login'
import HazardDashboard from './components/HazardDashboard';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LoginPage/>
    </>
  )
  return (
      <div>
        <HazardDashboard />
      </div>
    );
}

export default App
