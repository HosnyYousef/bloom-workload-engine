import { useState } from 'react'

const SECTION_CONFIG = {
    priorities: { title: 'Top Priorities', subtitle: 'Your focus for today', placeholder: 'Add priority task...', defaults: { hours: 1, deadline: '', importance: 'high' }, card: 'bg-white dark:bg-gray-800', text: 'dark:text-gray-200' },
    tomorrow: { title: 'For Tomorrow', subtitle: 'Important, but not needed today', placeholder: 'Add task for tomorrow...', defaults: { hours: 1, importance: 'medium' }, card: 'bg-orange-100 dark:bg-[#1c0d00]', text: 'dark:text-orange-100' },
    dontForget: { title: "Don't Forget", subtitle: 'Saved safely for later', placeholder: 'Add reminder...', defaults: { hours: 0.5, deadline: '', importance: 'low' }, card: 'bg-green-200 dark:bg-[#072010]', text: 'dark:text-green-100' },
};

const TopPriorities = ({ tasks, onToggle, onDelete, onAdd, onUpdate, category = 'priorities', onMove, onMoveSection, onMoveToParking }) => {
    const [newTask, setNewTask] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editSteps, setEditSteps] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const config = SECTION_CONFIG[category];
    const isSecondarySection = category !== 'priorities';
    const visibleTasks = isSecondarySection && !showAll ? tasks.slice(0, 3) : tasks;

    const handleAdd = () => {
        if (newTask.trim() === '') return;
        const defaults = { ...config.defaults };
        if (category === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            defaults.deadline = tomorrow.toISOString().split('T')[0];
        }
        onAdd({
            text: newTask,
            ...defaults,
            sorted: true,
            sortedCategory: category,
            sectionOrder: tasks.length,
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

    const toggleStep = (task, stepIndex) => {
        const steps = task.steps.map((step, index) => index === stepIndex
            ? { ...step, done: !step.done }
            : step);
        onUpdate(task._id, { steps });
    }

    return (
        <div
            className={`card ${config.card} border-2 border-black dark:border-gray-700 rounded-2xl p-4 h-auto min-h-44 transition-colors`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData('application/x-bloomspace-task');
                if (taskId) onMove?.(taskId, category, tasks.length);
            }}
        >
            {/* Header */}
            <div className='flex justify-between items-start border-b-2 border-black dark:border-gray-600 pb-2 mb-3'>
                <div>
                    <p className='font-bold dark:text-gray-100'>{config.title}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>{config.subtitle}</p>
                </div>
                {isSecondarySection && tasks.length > 3 ? (
                    <button type='button' onClick={() => setShowAll(!showAll)} className='text-sm underline dark:text-gray-400'>
                        {showAll ? 'Show less' : `See all (${tasks.length})`}
                    </button>
                ) : null}
            </div>

            {/* Task List */}
            <div className={`space-y-2 transition-opacity ${isSecondarySection ? 'opacity-60 hover:opacity-100 focus-within:opacity-100' : ''}`}>
                {visibleTasks.map(task => (
                    <div
                        key={task._id}
                        draggable={editingTaskId !== task._id}
                        onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData('application/x-bloomspace-task', task._id);
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            const taskId = event.dataTransfer.getData('application/x-bloomspace-task');
                            if (taskId) onMove?.(taskId, category, tasks.findIndex(item => item._id === task._id));
                        }}
                    >
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
                            <span aria-label={`Drag ${task.text}`} title='Drag to reorder or move' className='cursor-grab select-none text-gray-400'>⋮⋮</span>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => onToggle(task._id)}
                                className='cursor-pointer'
                            />
                            <span className={`flex-1 ${config.text} ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                {task.text}
                            </span>
                            <button
                                type='button'
                                onClick={() => startEditing(task)}
                                className='text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'
                            >
                                Edit
                            </button>
                            <button type='button' onClick={() => onMoveSection?.(task._id, -1)} disabled={category === 'priorities'} aria-label={`Move ${task.text} up a section`} title='Move up a section' className='text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:hidden'>▲</button>
                            <button type='button' onClick={() => onMoveSection?.(task._id, 1)} disabled={category === 'dontForget'} aria-label={`Move ${task.text} down a section`} title='Move down a section' className='text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:hidden'>▼</button>
                            <button type='button' onClick={() => onMoveToParking?.(task._id)} aria-label={`Move ${task.text} to Parking Lot`} title='Move to Parking Lot' className='text-xs text-gray-500 hover:text-pink-600'>↩</button>
                            <button
                                onClick={() => onDelete(task._id)}
                                className='text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'
                            >
                                x
                            </button>
                        </div>
                        {/* Sub-steps suggested by the engine, collapsed by default */}
                        {task.steps?.length > 0 && (
                            <details className='ml-6 mt-1'>
                                <summary className='text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none'>
                                    {task.steps.filter(step => step.done).length} of {task.steps.length} small steps complete
                                </summary>
                                <ul className='mt-1 space-y-1'>
                                    {task.steps.map((step, i) => (
                                        <li key={step._id || i} className='text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2'>
                                            <input
                                                type='checkbox'
                                                checked={Boolean(step.done)}
                                                onChange={() => toggleStep(task, i)}
                                                aria-label={`Complete step: ${step.text}`}
                                                className='mt-0.5 cursor-pointer'
                                            />
                                            <span className={step.done ? 'line-through text-gray-400 dark:text-gray-500' : ''}>{step.text}</span>
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
                        placeholder={config.placeholder}
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
