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

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task._id === id ? { ...task, completed: !task.completed } : task
    ))
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
    <div className="min-h-screen bg-gray-100">
      <Navbar
        energyLevel={energyLevel}
        onEnergyChange={setEnergyLevel}
        onLogout={handleLogout}
      />

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

        <div className="flex justify-between items-center mb-6">
          <div className="bg-blue-200 border-2 border-black rounded-full px-6 py-2">
            <span className="font-bold">TODAY ×</span>
          </div>
          <DateDisplay />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
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