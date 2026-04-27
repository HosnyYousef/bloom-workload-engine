import { useState } from "react";

const DEFAULT_GOALS = ['Health', 'Career', 'Finance', 'Personal', 'Social'];

const GoalSelect = ({ value, onChange, showCustom, setShowCustom, customValue, setCustomValue }) => (
    <div className="flex flex-col gap-1">
        <select
            value={showCustom ? 'custom' : value}
            onChange={(e) => {
                if (e.target.value === 'custom') {
                    setShowCustom(true);
                } else {
                    setShowCustom(false);
                    onChange(e.target.value);
                }
            }}
            className="w-full p-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400"
        >
            {DEFAULT_GOALS.map(g => (
                <option key={g} value={g}>{g}</option>
            ))}
            <option value="custom">+ Custom...</option>
        </select>
        {showCustom && (
            <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Type goal..."
                className="w-full p-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400"
                autoFocus
            />
        )}
    </div>
);

const editInputCls = "w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";

const importanceDot = (importance) => {
    if (importance === 'high') return 'bg-red-400';
    if (importance === 'medium') return 'bg-yellow-400';
    return 'bg-emerald-400';
};

const ParkingLot = ({ tasks, onAdd, onUpdate, onDelete, onOrganize, onSelect, selectedTaskId }) => {
    const [editingId, setEditingId] = useState(null);
    const [showSorted, setShowSorted] = useState(false);
    const [customGoal, setCustomGoal] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [editCustomGoal, setEditCustomGoal] = useState('');
    const [editShowCustomInput, setEditShowCustomInput] = useState(false);

    const [newTaskForm, setNewTaskForm] = useState({
        text: '',
        hours: '',
        deadline: '',
        importance: 'medium',
        goal: 'Personal'
    });

    const [editForm, setEditForm] = useState({
        text: '',
        hours: '',
        deadline: '',
        importance: 'medium',
        goal: 'Personal'
    });

    const unsortedTasks = tasks.filter(t => !t.sorted);
    const sortedTasks = tasks.filter(t => t.sorted);

    const handleAddNew = () => {
        if (newTaskForm.text.trim() === '') return;
        onAdd({
            text: newTaskForm.text,
            hours: parseFloat(newTaskForm.hours) || 0,
            deadline: newTaskForm.deadline,
            importance: newTaskForm.importance,
            goal: showCustomInput ? customGoal || 'Personal' : newTaskForm.goal
        });
        setNewTaskForm({ text: '', hours: '', deadline: '', importance: 'medium', goal: 'Personal' });
        setCustomGoal('');
        setShowCustomInput(false);
    };

    const handleEdit = (task) => {
        setEditingId(task._id);
        setEditForm({
            text: task.text,
            hours: task.hours,
            deadline: task.deadline,
            importance: task.importance,
            goal: task.goal || 'Personal'
        });
        setEditShowCustomInput(false);
        setEditCustomGoal('');
    };

    const handleSaveEdit = (id) => {
        onUpdate(id, {
            text: editForm.text,
            hours: parseFloat(editForm.hours) || 0,
            deadline: editForm.deadline,
            importance: editForm.importance,
            goal: editShowCustomInput ? editCustomGoal || 'Personal' : editForm.goal
        });
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ text: '', hours: '', deadline: '', importance: 'medium', goal: 'Personal' });
        setEditShowCustomInput(false);
        setEditCustomGoal('');
    };

    return (
        <div className="parking-lot-card bg-[#EDECEA] dark:bg-[#1A1A1E] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 flex flex-col transition-colors">

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="font-bold text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Brain Dump</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Get it out of your head</p>
                </div>
                <button
                    onClick={onOrganize}
                    className="btn px-3 py-1.5 bg-yellow-400 border-2 border-black dark:border-yellow-600 rounded-xl font-bold hover:bg-yellow-500 text-xs flex items-center gap-1 dark:text-gray-900 flex-shrink-0 ml-2"
                >
                    <span>📝</span>
                    Organize
                </button>
            </div>

            {/* Quick-add form */}
            <div className="mb-4">
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newTaskForm.text}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, text: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                        placeholder="What's on your mind?"
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                    />
                    <button
                        onClick={handleAddNew}
                        className="px-3 py-2 bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 font-bold text-sm transition-colors"
                    >
                        +
                    </button>
                </div>
                {/* Detail fields */}
                <div className="grid grid-cols-2 gap-1.5">
                    <input
                        type="number" step="0.5"
                        value={newTaskForm.hours}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, hours: e.target.value })}
                        placeholder="Hours"
                        className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-600"
                    />
                    <input
                        type="date"
                        value={newTaskForm.deadline}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
                        className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400"
                    />
                    <select
                        value={newTaskForm.importance}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, importance: e.target.value })}
                        className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white/50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400"
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <GoalSelect
                        value={newTaskForm.goal}
                        onChange={(val) => setNewTaskForm({ ...newTaskForm, goal: val })}
                        showCustom={showCustomInput}
                        setShowCustom={setShowCustomInput}
                        customValue={customGoal}
                        setCustomValue={setCustomGoal}
                    />
                </div>
            </div>

            {/* Task list */}
            <div className="flex-1 space-y-1.5">
                {unsortedTasks.length === 0 && sortedTasks.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-600">Nothing here yet.</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Type above — we'll sort it for you.</p>
                    </div>
                )}

                {unsortedTasks.map(task => (
                    editingId === task._id ? (
                        <div key={task._id} className="bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 space-y-1.5">
                            <input
                                type="text"
                                value={editForm.text}
                                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                                className={editInputCls}
                                autoFocus
                            />
                            <div className="grid grid-cols-2 gap-1">
                                <input
                                    type="number" step="0.5"
                                    value={editForm.hours}
                                    onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                                    placeholder="Hours"
                                    className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                />
                                <input
                                    type="date"
                                    value={editForm.deadline}
                                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                    className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                />
                                <select
                                    value={editForm.importance}
                                    onChange={(e) => setEditForm({ ...editForm, importance: e.target.value })}
                                    className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                                <GoalSelect
                                    value={editForm.goal}
                                    onChange={(val) => setEditForm({ ...editForm, goal: val })}
                                    showCustom={editShowCustomInput}
                                    setShowCustom={setEditShowCustomInput}
                                    customValue={editCustomGoal}
                                    setCustomValue={setEditCustomGoal}
                                />
                            </div>
                            <div className="flex gap-1 justify-end pt-0.5">
                                <button onClick={() => handleSaveEdit(task._id)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600">Save</button>
                                <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={task._id}
                            className={`border rounded-xl px-3 py-2 flex items-center gap-2 group cursor-pointer transition-colors ${
                                selectedTaskId === task._id
                                    ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50/80 dark:bg-yellow-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10'
                            }`}
                            onClick={() => onSelect(task)}
                        >
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${importanceDot(task.importance)}`} />
                            <span className="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate">{task.text}</span>
                            {task.deadline && (
                                <span className="text-xs text-gray-400 dark:text-gray-600 flex-shrink-0">
                                    {task.deadline.slice(5)}
                                </span>
                            )}
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                <button onClick={() => handleEdit(task)} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 text-xs">✎</button>
                                <button onClick={() => onDelete(task._id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xs">✕</button>
                            </div>
                        </div>
                    )
                ))}

                {/* Sorted tasks */}
                {sortedTasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setShowSorted(!showSorted)}
                            className="w-full text-left text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5 hover:text-gray-500 dark:hover:text-gray-500 transition-colors mb-1.5"
                        >
                            <span>{showSorted ? '▲' : '▼'}</span>
                            {sortedTasks.length} already organized
                        </button>

                        {showSorted && sortedTasks.map(task => (
                            <div
                                key={task._id}
                                className={`border border-dashed rounded-xl px-3 py-2 flex items-center gap-2 group cursor-pointer opacity-50 hover:opacity-70 mb-1.5 transition-opacity ${
                                    selectedTaskId === task._id
                                        ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/10 opacity-80'
                                        : 'border-gray-200 dark:border-gray-800 bg-transparent'
                                }`}
                                onClick={() => onSelect(task)}
                            >
                                <span className="text-xs text-gray-400 dark:text-gray-600">✓</span>
                                <span className="flex-1 text-xs text-gray-500 dark:text-gray-500 truncate">{task.text}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-600 flex-shrink-0">
                                    → {task.sortedCategory === 'priorities' ? 'Today' :
                                        task.sortedCategory === 'tomorrow' ? 'Tomorrow' : "Don't Forget"}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => handleEdit(task)} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 text-xs">✎</button>
                                    <button onClick={() => onDelete(task._id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xs">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParkingLot;
