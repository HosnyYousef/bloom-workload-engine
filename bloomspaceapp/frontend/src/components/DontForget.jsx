import { useState } from react // with do this to pull from package and use

const DontForget = () => {
    // State: stores our list of tasks (where is it stored though, in the broswer, and when we put it in the backend, would it be stored there instead)
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Welcome customers to visit website', completed: false },
        { id: 2, text: 'Prepare a light breakfast', completed: false },
        { id: 3, text: 'Dentist', completed: false }
    ]);

    // State: stores the new task being typed (stores where?)
    const [newTask, setNewTask] = useState('');

    // Function: Toggle task completion (check/uncheck)
    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ))
    }

    // Function: Add new task
    const addTask = () => {
        if (newTask.trim() === '') return;

        const newTaskObj = {
            id: Date.new(),
            task: newTask,
            completed: false
        }

        setTasks([...tasks, newTaskObj])
        setNewTask('')
    }

    //Function: Delete task
    const DeleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id))
    }

    return (
        <div className="bg-green-200 border-2 border-black rounded-lg p-4 h-auto min-h-44">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
                <p className="font-bold">For Tomorrow</p>
                <button className="text-sm underline">See all...</button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 group">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                            {task.text}
                        </span>
                        <button
                            onClick={() => DeleteTask(task.id)}
                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New Task */}
            <div className="mt-3 pt-3 border-t-2 border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Add task for tomorrow..."
                        className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    />
                    <button
                        onClick={addTask}
                        className="px-3 py-1 bg-green-500 text-white rounded font-bold hover:bg-green-600"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>

    )
}

export default DontForget;