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
        <div className='card bg-rose-50 dark:bg-[#1C0A10] border-2 border-black dark:border-gray-700 rounded-2xl p-4 h-auto transition-colors'>
            {/* Header */}
            <div className='flex justify-between items-center border-b-2 border-black dark:border-gray-600 pb-2 mb-3'>
                <div>
                    <p className='font-extrabold text-lg dark:text-gray-100'>Today's Focus</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>Your most important tasks — do these first</p>
                </div>
                {tasks.length > 0 && (
                    <span className='text-xs font-bold bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-full'>
                        {tasks.filter(t => !t.completed).length} left
                    </span>
                )}
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.length === 0 && (
                    <p className='text-sm text-gray-400 dark:text-gray-600 py-2'>Nothing here yet — hit Organize to fill this in.</p>
                )}
                {tasks.map(task => (
                    <div key={task._id} className='flex items-center gap-2 group'>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggle(task._id)}
                            className='cursor-pointer'
                        />
                        <span className={`flex-1 font-medium dark:text-gray-200 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                            {task.text}
                        </span>
                        <button
                            onClick={() => onDelete(task._id)}
                            className='text-red-400 dark:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs'
                        >
                            ✕
                        </button>
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
