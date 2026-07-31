import { useState } from 'react'

const SECTION_CONFIG = {
    priorities: { title: 'Top Priorities', subtitle: 'Your focus for today', placeholder: 'Add priority task...', defaults: { hours: 1, deadline: '', importance: 'high' }, card: 'bg-white dark:bg-gray-800', text: 'dark:text-gray-200' },
    tomorrow: { title: 'For Tomorrow', subtitle: 'Important, but not needed today', placeholder: 'Add task for tomorrow...', defaults: { hours: 1, importance: 'medium' }, card: 'bg-orange-100 dark:bg-[#1c0d00]', text: 'dark:text-orange-100' },
    dontForget: { title: "Don't Forget", subtitle: 'Saved safely for later', placeholder: 'Add reminder...', defaults: { hours: 0.5, deadline: '', importance: 'low' }, card: 'bg-green-200 dark:bg-[#072010]', text: 'dark:text-green-100' },
};

const TopPriorities = ({ tasks, onToggle, onDelete, onAdd, onUpdate, category = 'priorities', onMove, onMoveSection, onMoveToParking, energyLevel, candidateTasks = [], onChoosePriority }) => {
    const [newTask, setNewTask] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editSteps, setEditSteps] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [showChoices, setShowChoices] = useState(false);
    const [isDragTarget, setIsDragTarget] = useState(false);
    const [dropIndex, setDropIndex] = useState(null);
    const config = SECTION_CONFIG[category];
    const isSecondarySection = category !== 'priorities';
    const collapseKey = `bloomspace.sectionCollapsed.${category}`;
    const [isCollapsed, setIsCollapsed] = useState(() => isSecondarySection && localStorage.getItem(collapseKey) === 'true');
    const visibleTasks = isSecondarySection && !showAll ? tasks.slice(0, 3) : tasks;
    const canChooseAlternative = category === 'priorities'
        && ['typical', 'slow'].includes(energyLevel)
        && candidateTasks.length > 0;

    const toggleCollapsed = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem(collapseKey, String(next));
    };

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

    const clearDropCue = () => {
        setIsDragTarget(false);
        setDropIndex(null);
    };

    const beginDragging = (event, task) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/x-bloomspace-task', task._id);

        // Use a compact one-line preview instead of a browser snapshot of the
        // entire task, including its expanded small steps.
        const preview = document.createElement('div');
        preview.textContent = task.text;
        preview.className = 'fixed -left-[9999px] top-0 max-w-xs truncate rounded-lg border-2 border-blue-500 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xl dark:bg-gray-800 dark:text-gray-100';
        document.body.appendChild(preview);
        event.dataTransfer.setDragImage(preview, 16, 16);
        setTimeout(() => preview.remove(), 0);
    };

    const updateDropIndex = (event, index) => {
        event.preventDefault();
        event.stopPropagation();
        const bounds = event.currentTarget.getBoundingClientRect();
        setDropIndex(index + (event.clientY > bounds.top + bounds.height / 2 ? 1 : 0));
        setIsDragTarget(true);
        event.dataTransfer.dropEffect = 'move';
    };

    const dropTask = (event, index = tasks.length) => {
        event.preventDefault();
        event.stopPropagation();
        const taskId = event.dataTransfer.getData('application/x-bloomspace-task');
        if (taskId) onMove?.(taskId, category, index);
        clearDropCue();
    };

    return (
        <div
            className={`card ${config.card} border-2 rounded-2xl p-4 h-auto min-h-44 transition-all ${isDragTarget ? 'border-blue-500 ring-4 ring-blue-400/35 bg-blue-50 dark:bg-blue-950/30' : 'border-black dark:border-gray-700'}`}
            onDragEnter={() => setIsDragTarget(true)}
            onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) clearDropCue();
            }}
            onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => dropTask(event, dropIndex ?? tasks.length)}
        >
            {/* Header */}
            <div className='flex justify-between items-start border-b-2 border-black dark:border-gray-600 pb-2 mb-3'>
                <div>
                    <p className='font-bold dark:text-gray-100'>{config.title}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>{config.subtitle}</p>
                </div>
                <div className='flex items-center gap-2'>
                    {isSecondarySection && tasks.length > 3 && !isCollapsed ? (
                        <button type='button' onClick={() => setShowAll(!showAll)} className='text-sm underline dark:text-gray-400'>
                            {showAll ? 'Show less' : `See all (${tasks.length})`}
                        </button>
                    ) : null}
                    {isSecondarySection ? (
                        <button type='button' onClick={toggleCollapsed} aria-expanded={!isCollapsed} aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${config.title}`} className='px-2 text-gray-500 dark:text-gray-400'>
                            {isCollapsed ? '▸' : '▾'}
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Task List */}
            {!isCollapsed && <div
                className={`space-y-2 transition-opacity ${isSecondarySection ? 'opacity-60 hover:opacity-100 focus-within:opacity-100' : ''}`}
                onDragOver={(event) => {
                    if (event.target === event.currentTarget) {
                        event.preventDefault();
                        setDropIndex(visibleTasks.length);
                        setIsDragTarget(true);
                    }
                }}
            >
                {visibleTasks.map((task, taskIndex) => (
                    <div
                        key={task._id}
                        onDragOver={(event) => updateDropIndex(event, taskIndex)}
                        onDrop={(event) => dropTask(event, dropIndex ?? taskIndex)}
                    >
                        {dropIndex === taskIndex && <div aria-hidden='true' className='mb-2 h-1 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' />}
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
                            <span
                                draggable
                                onDragStart={(event) => beginDragging(event, task)}
                                onDragEnd={clearDropCue}
                                aria-label={`Drag ${task.text}`}
                                title='Drag to reorder or move'
                                className='cursor-grab select-none text-gray-400 active:cursor-grabbing'
                            >⋮⋮</span>
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
                {dropIndex === visibleTasks.length && <div aria-hidden='true' className='h-1 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' />}
            </div>}

            {canChooseAlternative && (
                <div className='mt-3 border-t border-gray-300 dark:border-gray-600 pt-2'>
                    <button type='button' onClick={() => setShowChoices(!showChoices)} aria-expanded={showChoices} className='text-xs font-semibold text-blue-600 dark:text-blue-400'>
                        {showChoices ? 'Hide other available tasks' : 'Choose a different task'}
                    </button>
                    {showChoices && (
                        <div className='mt-2 max-h-48 overflow-y-auto rounded-lg bg-gray-100 dark:bg-gray-900/50 p-2 space-y-1'>
                            {candidateTasks.map(task => (
                                <div key={task._id} className='flex items-center gap-2 text-xs'>
                                    <span className='min-w-0 flex-1 truncate dark:text-gray-300'>{task.text}</span>
                                    <button type='button' onClick={() => onChoosePriority?.(task._id)} className='rounded bg-blue-600 px-2 py-1 font-semibold text-white'>Choose</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add New Task */}
            {!isCollapsed && <div className='mt-3 pt-3 border-t-2 border-gray-200 dark:border-gray-600'>
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
            </div>}
        </div>
    )
}

export default TopPriorities
