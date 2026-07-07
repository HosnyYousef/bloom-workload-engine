import { useState } from 'react'

const TopPriorities = ({ tasks, onToggle, onDelete, onAdd}) => {
    const [newTask, setNewTask] = useState('');

    const handleAdd = () => {
        if (newTask.trim() === '') return;
        onAdd({
            text: newTask,
            hours: 1,
            deadline: '',
            importance: 'high'
        })
        setNewTask('');
    }

    return (
        <div className='card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl p-4 h-auto min-h-44 transition-colors'>
            {/* Header */}
            <div className='flex justify-between items-center border-b-2 border-black dark:border-gray-600 pb-2 mb-3'>
                <p className='font-bold dark:text-gray-100'>Top Priorities</p>
                <button className='text-sm underline dark:text-gray-400'>See all...</button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task._id}>
                        <div className='flex items-center gap-2 group'>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => onToggle(task._id)}
                                className='cursor-pointer'
                            />
                            <span className={`flex-1 dark:text-gray-200 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                {task.text}
                            </span>
                            <button
                                onClick={() => onDelete(task._id)}
                                className='text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'
                            >
                                x
                            </button>
                        </div>
                        {/* Sub-steps suggested by the engine, collapsed by default */}
                        {task.steps?.length > 0 && !task.completed && (
                            <details className='ml-6 mt-1'>
                                <summary className='text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none'>
                                    {task.steps.length} small steps
                                </summary>
                                <ul className='mt-1 space-y-1'>
                                    {task.steps.map((step, i) => (
                                        <li key={i} className='text-xs text-gray-600 dark:text-gray-300 flex gap-1'>
                                            <span className='text-gray-400'>{i + 1}.</span>
                                            <span>{step.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Task */}
            <div className='mt-3 pt-3 border-t-2 border-gray-200 dark:border-gray-600'>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder='Add priority task...'
                        className='flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'
                    />
                    <button
                        onClick={handleAdd}
                        className='btn px-3 py-1 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 border-2 border-black dark:border-gray-700'
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TopPriorities
