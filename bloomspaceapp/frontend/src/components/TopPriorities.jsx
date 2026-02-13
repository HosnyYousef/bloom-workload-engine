import { useState } from 'react'

const TopPriorities = () => {
    // State: stores our list of tasks
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Help friend apply for vistor VISA', completed: false },
        { id: 2, text: 'Work on project', completed: false },
        { id: 3, text: 'Process Business Data', completed: false }
    ]);

    // State: stores the new task being typed
    const [newTask, setNewTask] = useState('');

    // Funtion: Toggle task completion (check/uncheck)
    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ))
    }

    // Function: Add new task
    const addTask = () => {
        if (newTask.trim() === '') return; // Don't add empty tasks

        const newTaskObj = {
            id: Date.now(), // Simple ID (use UUID in production)
            text: newTask,
            completed: false
        }

        setTasks([...tasks, newTaskObj]);
        setNewTask(''); //Clear input
    };

    // Function: Delete task
    const DeleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div className='bg-white border-2 border-black rounded-lg p-4 h-auto min-h-44'>
            {/* Header */}
            <div className='flex justify-between items-center border-b-2 border-black pb-2 mb-3'>
                <p className='font-bold'>Top Priorities</p>
                <button className='text-sm underline'>See all...</button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className='flex items-center gap-2 group'>
                        {/* Checkbox */}
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className='w-4 h-4 cursor-pointer'
                        />

                        {/* Task Text */}
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                            {task.text}
                        </span>

                        {/* Delete Button (shows on hover) */}
                        <button
                            onClick={() => DeleteTask(task.id)}
                            className='text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New Task */}
            <div className='mt-3 pt-3 border-t-2 border-gray-200'>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder='Add new task...'
                        className='flex-1 px-2 py-1 border border-gray-300 rounded'
                    />
                    <button
                        onClick={addTask}
                        className='px-3 py-1 bg-green-500 text-white rounded font-bold hover:bg-green-600'
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    )

}

export default TopPriorities