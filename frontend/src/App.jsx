import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/header.jsx';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="bg-white min-h-screen">
      <Header />
      <main className="p-10 text-center">
        <h2 className="text-gabay-blue">Welcome to the Hospital Appointment System</h2>
        <p className="text-gray-600 mt-2">Efficient healthcare at your fingertips.</p>
      </main>
    </div>
    </>
  )
}

export default App
