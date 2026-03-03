import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1 className="bg-green-500 p-10 text-2xl">Tailwind is Working</h1>
       <div className="m-10 p-10 bg-yellow-300 border-4 border-black shadow-xl">
  <h1 className="text-3xl font-bold text-red-600 underline">
    GABAY Styling Test
  </h1>
  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition duration-300">
  Hospital Appointment
</button>
  <p className="mt-4 text-gray-700">If you see a yellow box with a black border, Tailwind is fully active.</p>
</div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
  <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-blue-600 max-w-md w-full">
    <h1 className="text-3xl font-bold text-gray-800 mb-2">GABAY</h1>
    <p className="text-blue-600 font-medium mb-6">Hospital Appointment System</p>
    
    <div className="space-y-4">
      <div className="h-2 bg-gray-200 rounded-full w-full"></div>
      <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
    </div>
    
    <button className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
      Get Started
    </button>
  </div>
</div>
    </>
  )
}

export default App
