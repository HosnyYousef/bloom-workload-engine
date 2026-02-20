import { useState } from "react";
import Navbar from "./components/Navbar";
import TopPriorities from "./components/TopPriorities";
import ForTomorrow from "./components/ForTomorrow";
import DontForget from "./components/DontForget";
import DateDisplay from "./components/DateDisplay";
import NotesThoughts from "./components/NotesThoughts";


// SORTING ALGORITHM
const sortTasks = (tasks, energyLevel) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1)

  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);

  const urgent = tasks.filter(task => {
    if (!task.deadline) return task.importance === 'high';
    const deadline = new Date(task.deadline);
    return deadline <= tomorrow && task.importance !== 'low'
  })

  const soon = tasks.filter(task => {
    if (!task.deadline) return task.importance === 'medium';
    const deadline = new Date(task.deadline);
    return deadline > tomorrow && deadline <= threeDays;
  })

  const later = tasks.filter(task => {
    if (!task.deadline) return task.importance === 'low' || !task.importance;
    const deadline = new Date(task.deadline);
    return deadline > threeDays;
  })

  let priorities = [];
  let tomorrowTasks = [];
  let dontForget = [];

  if (energyLevel === 'early') {
    priorities = urgent.slice(0, 5);
    tomorrowTasks = soon.slice(0, 3);
    dontForget = later.slice(0, 2);
  } else if (energyLevel === 'typical') {
    priorities = urgent.slice(0, 3);
    tomorrowTasks = soon.slice(0, 3);
    dontForget = later.slice(0, 3);
  } else if (energyLevel === 'slow') {
    const quickTasks = urgent.filter(t => !t.hours || t.hours <= 1);
    priorities = quickTasks.slice(0, 2);
    tomorrowTasks = soon.slice(0, 2)
    dontForget = later.slice(0, 2)
  }
  return { priorities, tomorrowTasks, dontForget } 
};

const App = () => {
  const [energyLevel, setEnergyLevel] = useState('typical');

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Help friend apply for VISA', hours: 1, deadline: '', importance: 'high', completed: false },
    { id: 2, text: 'Work on project', hours: 2, deadline: '', importance: 'high', completed: false },
    { id: 3, text: 'Process Business Data', hours: 1, deadline: '', importance: 'medium', completed: false },
    { id: 4, text: 'Continue VISA APP', hours: 1, deadline: '', importance: 'medium', completed: false },
    { id: 5, text: 'Drive to the company', hours: 0.5, deadline: '', importance: 'low', completed: false },
    { id: 6, text: 'Dentist', hours: 1, deadline: '', importance: 'low', completed: false },
  ])

  // DERIVED STATE - algorithm sorts tasks into categories
  const { priorities, tomorrowTasks, dontForget } = sortTasks(tasks, energyLevel)

  // Function passed DOWN to components
  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const addTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: Date.now(), completed: false }])
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Stats */}
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

        {/* Date Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-blue-200 border-2 border-black rounded-full px-6 py-2">
            <span className="font-bold">TODAY ×</span>
          </div>
          <DateDisplay />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left Side - Parking Lot */}
          <div className="col-span-2 bg-pink-300 border-2 border-black rounded-lg p-6 min-h-96">
            <p className="font-bold text-2xl">PARKING LOT</p>
            {/* ParkingLot component coming next! */}
          </div>

          {/* Right Side - Task Lists (display only, fed from algorithm) */}
          <div className="space-y-4">
            <TopPriorities
              tasks={priorities}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onAdd={addTask}
            />
            <ForTomorrow
              tasks={tomorrowTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onAdd={addTask}
            />
            <DontForget
              tasks={dontForget}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onAdd={addTask}
            />
            <NotesThoughts />
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
  );
}

export default App