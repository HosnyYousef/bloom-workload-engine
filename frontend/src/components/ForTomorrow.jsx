import { useState } from 'react'

const ForTomorrow = ({ tasks, onToggle, onDelete, onAdd }) => {
    const [newTask, setNewTask] = useState('');

    const handleAdd = () => {
        if (newTask.trim() === '') return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        onAdd({
            text: newTask,
            hours: 1,
            deadline: tomorrow.toISOString().split('T')[0],
            importance: 'medium'
        })
        setNewTask('')
    };

    return (
        <div className="bg-orange-100 dark:bg-[#1c0d00] border-2 border-black dark:border-gray-700 rounded-lg p-4 h-auto min-h-44 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-black dark:border-orange-900 pb-2 mb-3">
                <p className="font-bold dark:text-orange-100">For Tomorrow</p>
                <button className="text-sm underline dark:text-orange-300/60">See all...</button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task._id} className="flex items-center gap-2 group">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggle(task._id)}
                            className="w-5 h-5 cursor-pointer flex-shrink-0 accent-orange-500"
                        />
                        <span className={`flex-1 dark:text-orange-100 ${task.completed ? 'line-through text-gray-400 dark:text-orange-900' : ''}`}>
                            {task.text}
                        </span>
                        <button
                            onClick={() => onDelete(task._id)}
                            className="text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New Task */}
            <div className="mt-3 pt-3 border-t-2 border-gray-200 dark:border-orange-900/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder="Add task for tomorrow..."
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-orange-900 rounded bg-white dark:bg-orange-950/50 text-gray-900 dark:text-orange-100 placeholder-gray-400 dark:placeholder-orange-900"
                    />
                    <button
                        onClick={handleAdd}
                        className="px-3 py-1 bg-green-500 text-white rounded font-bold hover:bg-green-600"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ForTomorrow;
