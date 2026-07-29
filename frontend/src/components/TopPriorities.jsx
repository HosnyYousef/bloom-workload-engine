import { useState } from 'react'

const TopPriorities = ({ tasks, onToggle, onDelete, onAdd, onUpdate }) => {
    const [newTask, setNewTask] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editSteps, setEditSteps] = useState([]);

    const handleAdd = () => {
        if (newTask.trim() === '') return;
        onAdd({
            text: newTask,
            hours: 1,
            deadline: '',
            importance: 'high',
            sorted: true,
            sortedCategory: 'priorities'
        })
        setNewTask('');
    }

    const startEditing = (task) => {
        setEditingTaskId(task._id);
        setEditText(task.text);
        setEditSteps((task.steps || []).map(step => ({ ...step })));
    }

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditText('');
        setEditSteps([]);
    }

    const saveEditing = async () => {
        const text = editText.trim();
        if (!text) return;
        const steps = editSteps
            .map(step => ({ ...step, text: step.text.trim() }))
            .filter(step => step.text);
        await onUpdate(editingTaskId, { text, steps });
        cancelEditing();
    }

    const updateStep = (index, text) => {
        setEditSteps(editSteps.map((step, stepIndex) => stepIndex === index ? { ...step, text } : step));
    }

    const moveStep = (index, offset) => {
        const destination = index + offset;
        if (destination < 0 || destination >= editSteps.length) return;
        const reordered = [...editSteps];
        [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
        setEditSteps(reordered);
    }

    const handleEditorKeyDown = (event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            saveEditing();
        }
    }

    return (
        <div className='card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-2xl p-4 h-auto min-h-44 transition-colors'>
            {/* Header */}
            <div className='flex justify-between items-start border-b-2 border-black dark:border-gray-600 pb-2 mb-3'>
                <div>
                    <p className='font-bold dark:text-gray-100'>Top Priorities</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>Your focus for today</p>
                </div>
                <button className='text-sm underline dark:text-gray-400'>See all...</button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task._id}>
                        {editingTaskId === task._id ? (
                            <div onKeyDown={handleEditorKeyDown} className='ml-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 p-3 space-y-2'>
                                <label className='block text-xs font-semibold text-gray-600 dark:text-gray-300'>Task name</label>
                                <input
                                    value={editText}
                                    onChange={(event) => setEditText(event.target.value)}
                                    className='w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm dark:text-gray-100'
                                    aria-label='Task name'
                                />
                                <p className='text-xs font-semibold text-gray-600 dark:text-gray-300'>Small steps</p>
                                {editSteps.map((step, index) => (
                                    <div key={step._id || index} className='flex items-center gap-1'>
                                        <input
                                            value={step.text}
                                            onChange={(event) => updateStep(index, event.target.value)}
                                            aria-label={`Small step ${index + 1}`}
                                            className='min-w-0 flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs dark:text-gray-100'
                                        />
                                        <button type='button' onClick={() => moveStep(index, -1)} disabled={index === 0} aria-label={`Move step ${index + 1} up`} className='px-1 disabled:opacity-30'>↑</button>
                                        <button type='button' onClick={() => moveStep(index, 1)} disabled={index === editSteps.length - 1} aria-label={`Move step ${index + 1} down`} className='px-1 disabled:opacity-30'>↓</button>
                                        <button type='button' onClick={() => setEditSteps(editSteps.filter((_, stepIndex) => stepIndex !== index))} aria-label={`Remove step ${index + 1}`} className='px-1 text-red-500'>×</button>
                                    </div>
                                ))}
                                <button type='button' onClick={() => setEditSteps([...editSteps, { text: '', done: false }])} className='text-xs text-blue-600 dark:text-blue-400'>+ Add small step</button>
                                <div className='flex justify-end gap-2 pt-1'>
                                    <button type='button' onClick={cancelEditing} className='rounded px-2 py-1 text-xs dark:text-gray-300'>Cancel</button>
                                    <button type='button' onClick={saveEditing} disabled={!editText.trim()} title='Save (Ctrl/Cmd+Enter)' className='rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-40'>Save</button>
                                </div>
                            </div>
                        ) : (<>
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
                                type='button'
                                onClick={() => startEditing(task)}
                                className='text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'
                            >
                                Edit
                            </button>
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
                        </>)}
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
