import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import TopPriorities from "./components/TopPriorities";
import ForTomorrow from "./components/ForTomorrow";
import DontForget from "./components/DontForget";
import DateDisplay from "./components/DateDisplay";
import NotesThoughts from "./components/NotesThoughts";
import ParkingLot from "./components/ParkingLot";
import Login from "./components/Login"
import Register from "./components/Register"

import api from "./services/api";

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
  const [statsOpen, setStatsOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') !== 'false');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('userName')
    return token && name ? { token, name } : null
  })

  const [authScreen, setAuthScreen] = useState('login')

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const handleSelectTask = (task) => {
    setSelectedTask(task);
  };

  const handleLogin = ({ name, token }) => {
    localStorage.setItem('userName', name)
    setUser({ name, token })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    setUser(null)
    setTasks([])
  }

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setLoading(true)
      try {
        const response = await api.get('/tasks')
        setTasks(response.data)
        console.log('✅ Tasks loaded:', response.data.length, 'tasks')
      } catch (err) {
        console.error('❌ Failed to load tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [user])

  // DERIVED STATE - show SORTED tasks in the right panels
  const sortedTasksOnly = tasks.filter(t => t.sorted)

  const allPriorities = sortedTasksOnly.filter(t => t.sortedCategory === 'priorities')
  const allTomorrowTasks = sortedTasksOnly.filter(t => t.sortedCategory === 'tomorrow');
  const allDontForget = sortedTasksOnly.filter(t => t.sortedCategory === 'dontForget');

  let priorities = []
  if (energyLevel === 'early') {
    priorities = allPriorities.slice(0, 4);
  } else if (energyLevel === 'typical') {
    priorities = allPriorities.slice(0, 3);
  } else if (energyLevel === 'slow') {
    const quickTasks = allPriorities.filter(t => !t.hours || t.hours <= 1)
    priorities = quickTasks.slice(0, 2)
  }

  const tomorrowTasks = allTomorrowTasks
  const dontForget = allDontForget

  const toggleTask = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    try {
      const response = await api.put(`/tasks/${id}`, { completed: !task.completed });
      setTasks(tasks.map(t => t._id === id ? response.data : t));
    } catch (err) {
      console.error('❌ Failed to toggle task:', err);
    }
  }

  const addTask = async (newTask) => {
    try {
      const response = await api.post('/tasks', {
        ...newTask,
        completed: false,
        sorted: false,
        sortedCategory: null,
        sortedAt: null
      })
      setTasks([...tasks, response.data])
    } catch (err) {
      console.error('❌ Failed to add task:', err)
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter(task => task._id !== id))
    } catch (err) {
      console.error('❌ Failed to delete task:', err)
    }
  }

  const updateTask = async (id, updates) => {
    try {
      const response = await api.put(`/tasks/${id}`, updates)
      setTasks(tasks.map(task => task._id === id ? response.data : task))
    } catch (err) {
      console.error('❌ Failed to update task:', err)
    }
  };

  const handleOrganize = async () => {
    const unsortedTasks = tasks.filter(t => !t.sorted);

    const { priorities, tomorrowTasks, dontForget } = sortTasks(unsortedTasks, energyLevel);

    const sortedResults = [
      ...priorities.map(t => ({ id: t._id, category: 'priorities' })),
      ...tomorrowTasks.map(t => ({ id: t._id, category: 'tomorrow' })),
      ...dontForget.map(t => ({ id: t._id, category: 'dontForget' })),
    ];

    await Promise.all(
      sortedResults.map(({ id, category }) =>
        api.put(`/tasks/${id}`, {
          sorted: true,
          sortedCategory: category,
          sortedAt: Date.now()
        })
      )
    );

    setTasks(tasks.map(task => {
      const result = sortedResults.find(r => r.id === task._id);
      if (result) {
        return { ...task, sorted: true, sortedCategory: result.category, sortedAt: Date.now() };
      }
      return task;
    }));
  };

  if (!user) {
    return (
      <>
        {authScreen === 'login' ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Register onLogin={handleLogin} />
        )}

        <div className="text-center mt-4">
          {authScreen === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setAuthScreen('register')} className="text-blue-500 underline">
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setAuthScreen('login')} className="text-blue-500 underline">
                Log in
              </button>
            </p>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] dark:bg-[#111113] transition-colors">
      <Navbar
        energyLevel={energyLevel}
        onEnergyChange={setEnergyLevel}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Stats — always visible on desktop, collapsible on mobile */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2 sm:hidden">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">📊 Stats</span>
            <button
              onClick={() => setStatsOpen(o => !o)}
              className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
            >
              {statsOpen ? 'Hide ▲' : 'Show ▼'}
            </button>
          </div>
          <div className={`grid grid-cols-3 gap-3 ${statsOpen ? 'grid' : 'hidden sm:grid'}`}>
            <div className="bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-3 h-14 sm:h-40 flex items-start">
              <p className="font-bold text-gray-400 dark:text-gray-600 text-xs sm:text-sm leading-tight">DONE VS TO-DO</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-3 h-14 sm:h-40 flex items-start">
              <p className="font-bold text-gray-400 dark:text-gray-600 text-xs sm:text-sm leading-tight">TASK COMPLETION</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-3 h-14 sm:h-40 flex items-start">
              <p className="font-bold text-gray-400 dark:text-gray-600 text-xs sm:text-sm leading-tight">GOALS DISTRIBUTION</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-5">
          <div className="btn bg-blue-200 dark:bg-blue-900 border-2 border-black dark:border-blue-700 rounded-full px-5 py-2 cursor-default">
            <span className="font-extrabold dark:text-blue-100 text-sm">TODAY ×</span>
          </div>
          <DateDisplay />
        </div>

        {/* Main layout — action area is the focal point, brain dump is secondary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Action area — 2/3 width, what to work on today */}
          <div className="lg:col-span-2 space-y-4 order-1">
            <TopPriorities
              tasks={priorities}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onAdd={addTask}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            <div className="hidden lg:block">
              <NotesThoughts onAdd={addTask} />
            </div>
          </div>

          {/* Brain dump — 1/3 width, secondary capture tool */}
          <div className="order-2">
            <div className="lg:sticky lg:top-6">
              <ParkingLot
                tasks={tasks}
                onAdd={addTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onOrganize={handleOrganize}
                onSelect={handleSelectTask}
                selectedTaskId={selectedTask?._id}
              />
            </div>
          </div>

          {/* Notes on mobile only */}
          <div className="order-3 lg:hidden">
            <NotesThoughts onAdd={addTask} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App