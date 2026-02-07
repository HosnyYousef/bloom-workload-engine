import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="min-h-screen bg gray-100">
      {/* Navigation */}
      <Navbar />

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-2 border-black rounded-lg p-4 h-40">
            <p className="font-bold">DONE VS TO-DO</p>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4 h-40">
            <p className="font-bold">TASK COMPLETION</p>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4 h-40">
            <p className="font-bold">GOALS DISTRIBUTION</p>
          </div>
        </div>

        {/* Date Dection */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-blue-200 border-2 border-black rounded-full px-6 py-2">
            <span className="font-bold">TODAY ×</span>
          </div>
          <div className="font-bold">DATE: 2 SEPTEMBER, 2030</div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left Side - Parking Lod (spans 2 columns) */}
          <div className="col-span-2 bg-pink-300 border-2 border-black rounded-lg p-6 h-96">
            <p className="font-bold text-2xl">PARKING LOT</p>
          </div>

          {/* Right Side - Tasks Lists */}
          <div className="space-y-4">
            <div className="bg-white border-2 border-black rounded-lg p-4 h-44">
              <p className="font-bold border-b-2 border-black pb-2">Top Priorities</p>
            </div>
            <div className="bg-orange-100 border-2 border-black rounded-lg p-4 h-44">
              <p className="font-bold border-b-2 border-black pb-2">For Tomorrow</p>
            </div>
            <div className="bg-green-200 border-2 border-black rounded-lg p-4 h-44">
              <p className="font-bold border-b-2 border-black pb-2">Don't Forget</p>
            </div>
            <div className="bg-yellow-100 border-2 border-black rounded-lg p-4 h-32">
              <p className="font-bold border-b-2 border-black pb-2">Notes/thoughts</p>
            </div>
          </div>
        </div>

        {/* Daily Motivation */}
        <div className="mt-6">
          <p className="font-bold mb-4"> ♥ DAILY MOTIVATION</p>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-300 border-2 border-black rounded-lg h-48"></div>
            <div className="bg-gray-300 border-2 border-black rounded-lg h-48"></div>
            <div className="bg-gray-300 border-2 border-black rounded-lg h-48"></div>
            <div className="bg-gray-300 border-2 border-black rounded-lg h-48"></div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App