import React from 'react'

const Navbar = () => {
  return (
    <nav className="bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 border-2 border-black rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
            <span className="font-bold text-xl">BLOOM SPACE</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder='Search thoughts...'
              className='w-full px-4 py-2 border-2 border-black rounded-lg'
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-700 text-white border-2 border-black rounded-lg font-bold">
              Early Start
            </button>
            <button className="px-4 py-2 bg-green-500 text-white border-2 border-black rounded-lg font-bold">
              Typical Day
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white border-2 border-black rounded-lg font-bold">
              Slow Day
            </button>
            <div className="w-10 h-10 bg-green-600 border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-white">👤</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar