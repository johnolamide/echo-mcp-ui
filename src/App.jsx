import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            <a href="https://vite.dev" target="_blank" className="hover:opacity-80">
              <img src={viteLogo} className="h-24 w-auto" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" className="hover:opacity-80">
              <img src={reactLogo} className="h-24 w-auto animate-spin-slow" alt="React logo" />
            </a>
          </div>
          <h1 className="mt-8 text-4xl font-bold text-center text-gray-800">Echo MCP UI</h1>
          <div className="mt-12 bg-white shadow rounded-lg p-8">
            <div className="flex justify-center">
              <button 
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                onClick={() => setCount((count) => count + 1)}
              >
                Count is {count}
              </button>
            </div>
            <p className="mt-6 text-center text-gray-600">
              Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
            </p>
          </div>
          <p className="mt-8 text-center text-gray-500">
            Click on the Vite and React logos to learn more
          </p>
        </div>
      </div>
    </>
  )
}

export default App
