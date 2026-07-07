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
import { sortTasks } from "./utils/sortTasks";
import { applyRecommendations } from "./utils/applyRecommendations";

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
      try {
        const response = await api.get('/tasks')
        setTasks(response.data)
        console.log('✅ Tasks loaded:', response.data.length, 'tasks')
      } catch (err) {
        console.error('❌ Failed to load tasks:', err)
      }
    }

    fetchTasks()
  }, [user])

  // DERIVED STATE - show SORTED tasks in the right panels
  const sortedTasksOnly = tasks.filter(t => t.sorted)

  const allPriorities = sortedTasksOnly.filter(t => t.sortedCategory === 'priorities')
  const allTomorrowTasks = sortedTasksOnly.filter(t => t.sortedCategory === 'tomorrow');
  const allDontForget = sortedTasksOnly.filter(t => t.sortedCategory === 'dontForget');

  // The engine already picks exactly 3 for today (energy level changes
  // which 3 via scoring), so no extra slicing here.
  const priorities = allPriorities

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
      let taskData = { ...newTask };

      if (taskData.deadline) {
        taskData.deadlineSource = 'user';
      } else if (taskData.text) {
        // No deadline given: ask the engine to structure the entry.
        // Best effort only; if parse fails the task saves as typed.
        try {
          const { data: parsed } = await api.post('/tasks/parse', { text: taskData.text });
          taskData = {
            ...taskData,
            deadline: parsed.deadline,
            deadlineSource: parsed.deadlineSource,
            hours: taskData.hours || parsed.hours,
            energyRequired: parsed.energyRequired,
            steps: parsed.steps.map(text => ({ text, done: false })),
            // Keep the user's pick when they changed it off the default
            importance: taskData.importance && taskData.importance !== 'medium'
              ? taskData.importance
              : parsed.importance,
          };
        } catch {
          // Parse endpoint unavailable, keep the raw entry
        }
      }

      const response = await api.post('/tasks', {
        ...taskData,
        completed: false,
        sorted: false,
        sortedCategory: null,
        sortedAt: null
      })
      setTasks(prev => [...prev, response.data])
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
    try {
      // The engine scores every open task (urgency, goal alignment, energy
      // fit, time left today) and returns the top 3 plus the other buckets.
      // persist: true writes the categories server-side in the same call.
      const { data } = await api.post('/tasks/recommend', {
        energyLevel,
        persist: true
      });
      setTasks(prev => applyRecommendations(prev, data));
      return;
    } catch (err) {
      console.error('❌ Recommend endpoint failed, using local sort:', err);
    }

    // Fallback: the old client-side threshold sort, so ORGANIZE still
    // works if the engine endpoint is unreachable
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors">
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
            <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl p-3 h-14 sm:h-40 flex items-start">
              <p className="font-bold dark:text-gray-100 text-xs sm:text-sm leading-tight">DONE VS TO-DO</p>
            </div>
            <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl p-3 h-14 sm:h-40 flex items-start">
              <p className="font-bold dark:text-gray-100 text-xs sm:text-sm leading-tight">TASK COMPLETION</p>
            </div>
            <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl p-3 h-14 sm:h-40 flex items-start">
              <p className="font-bold dark:text-gray-100 text-xs sm:text-sm leading-tight">GOALS DISTRIBUTION</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-5">
          <div className="btn bg-blue-200 dark:bg-blue-900 border-2 border-black dark:border-blue-700 rounded-full px-5 py-2 cursor-default">
            <span className="font-extrabold dark:text-blue-100 text-sm">TODAY ×</span>
          </div>
          <DateDisplay />
        </div>

        {/* Main layout — checklist first, parking lot second, notes last on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sidebar: checklist panels + Notes on desktop */}
          <div className="space-y-4 order-1 lg:order-2">
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
            {/* Notes visible in sidebar on desktop only */}
            <div className="hidden lg:block">
              <NotesThoughts onAdd={addTask} />
            </div>
          </div>

          {/* Parking Lot */}
          <div className="lg:col-span-2 order-2 lg:order-1">
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

          {/* Notes below Parking Lot on mobile only */}
          <div className="order-3 lg:hidden">
            <NotesThoughts onAdd={addTask} />
          </div>
        </div>

        <div className="mt-6">
          <p className="font-bold mb-4 dark:text-gray-100"> ♥ DAILY MOTIVATION</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-300 dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl h-48"></div>
            <div className="bg-gray-300 dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl h-48"></div>
            <div className="bg-gray-300 dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl h-48"></div>
            <div className="bg-gray-300 dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl h-48"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
