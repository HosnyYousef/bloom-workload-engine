import { useState } from 'react'

const Navbar = ({ energyLevel, onEnergyChange, onLogout, darkMode, onToggleDark }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const energyButtons = [
    { key: 'early', label: 'Early Start', activeClass: 'bg-gray-700 text-white dark:bg-gray-500 dark:border-gray-400' },
    { key: 'typical', label: 'Typical Day', activeClass: 'bg-green-500 text-white dark:border-green-400' },
    { key: 'slow', label: 'Slow Day', activeClass: 'bg-blue-500 text-white dark:border-blue-400' },
  ];

  const inactiveBtn = 'bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';

  return (
    <nav className="bg-white dark:bg-gray-900 border-b-2 border-black dark:border-gray-700 transition-colors relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-green-500 border-2 border-black dark:border-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
            <span className="font-bold text-xl dark:text-white">BLOOM SPACE</span>
          </div>

          {/* Desktop: search + controls */}
          <div className="hidden md:flex items-center flex-1 gap-2 ml-8">
            <input
              type="text"
              placeholder="Search thoughts..."
              className="flex-1 max-w-md px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="hidden md:flex items-center gap-2 ml-2">
            {energyButtons.map(({ key, label, activeClass }) => (
              <button
                key={key}
                onClick={() => onEnergyChange(key)}
                className={`px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold transition-colors ${energyLevel === key ? activeClass : inactiveBtn}`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={onToggleDark}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 flex items-center justify-center border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={onLogout} className="text-sm text-red-500 dark:text-red-400 hover:underline">
              Log out
            </button>
            <div className="w-10 h-10 bg-green-600 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white">👤</span>
            </div>
          </div>

          {/* Mobile: dark toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleDark}
              className="w-10 h-10 flex items-center justify-center border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-lg"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-gray-900 dark:bg-gray-100 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-900 dark:bg-gray-100 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-900 dark:bg-gray-100 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t-2 border-black dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search thoughts..."
            className="w-full px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />

          {/* Energy level */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Energy Level</p>
            <div className="flex gap-2">
              {energyButtons.map(({ key, label, activeClass }) => (
                <button
                  key={key}
                  onClick={() => { onEnergyChange(key); setMenuOpen(false); }}
                  className={`flex-1 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm transition-colors ${energyLevel === key ? activeClass : inactiveBtn}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onLogout} className="text-sm text-red-500 dark:text-red-400 hover:underline">
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar
