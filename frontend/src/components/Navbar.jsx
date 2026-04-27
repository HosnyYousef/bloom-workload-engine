import React from 'react'

const Navbar = ({ energyLevel, onEnergyChange, onLogout, darkMode, onToggleDark }) => {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b-2 border-black dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 border-2 border-black dark:border-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
            <span className="font-bold text-xl dark:text-white">BLOOM SPACE</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder='Search thoughts...'
              className='w-full px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none'
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEnergyChange('early')}
              className={`px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold transition-colors ${
                energyLevel === 'early'
                ? 'bg-gray-700 text-white dark:bg-gray-500 dark:border-gray-400'
                : 'bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
              Early Start
            </button>
            <button
              onClick={() => onEnergyChange('typical')}
              className={`px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold transition-colors ${
                energyLevel === 'typical'
                  ? 'bg-green-500 text-white dark:border-green-400'
                  : 'bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Typical Day
            </button>
            <button
              onClick={() => onEnergyChange('slow')}
              className={`px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold transition-colors ${
                energyLevel === 'slow'
                  ? 'bg-blue-500 text-white dark:border-blue-400'
                  : 'bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Slow Day
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={onToggleDark}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 flex items-center justify-center border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button onClick={onLogout} className='text-sm text-red-500 dark:text-red-400 hover:underline'>
               Log out
            </button>
            <div className="w-10 h-10 bg-green-600 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white">👤</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
