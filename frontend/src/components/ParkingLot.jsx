import { useState } from "react";

const DEFAULT_GOALS = ['Health', 'Career', 'Finance', 'Personal', 'Social'];

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
                className="w-full p-1 border border-black rounded text-sm"
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
                    className="w-full p-1 border border-black rounded text-sm"
                    autoFocus
                />
            )}
        </div>
    );

    return (
        <div className="bg-pink-300 border-2 border-black rounded-lg p-6 min-h-150 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-bold text-2xl">PARKING LOT</h2>
                    <p className="text-sm text-gray-700">Brain dump everything here - we'll organize it for you!</p>
                </div>
                <button
                    onClick={onOrganize}
                    className="px-4 py-2 bg-yellow-400 border-2 border-black rounded-lg font-bold hover:bg-yellow-500 active:scale-95 transition-transform flex items-center gap-2"
                >
                    <span className="text-xl">📝</span>
                    ORGANIZE!
                </button>
            </div>

            <div className="bg-pink-200 border-2 border-black rounded-lg overflow-hidden flex-1 flex flex-col">
                <table className="w-full">
                    <thead className="bg-pink-400 border-b-2 border-black">
                        <tr>
                            <th className="border-r-2 border-black p-3 text-left font-bold">ITEM</th>
                            <th className="border-r-2 border-black p-3 text-left font-bold w-24">HOURS</th>
                            <th className="border-r-2 border-black p-3 text-left font-bold w-36">DUE DATE</th>
                            <th className="border-r-2 border-black p-3 text-left font-bold w-28">IMPORTANCE</th>
                            <th className="border-r-2 border-black p-3 text-left font-bold w-32">GOAL</th>
                            <th className="p-3 w-20"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* UNSORTED TASKS */}
                        {unsortedTasks.map(task => (
                            <tr
                                key={task._id}
                                className={`border-b-2 border-black cursor-pointer transition-colors ${
                                    selectedTaskId === task._id
                                        ? 'bg-yellow-200 border-l-4 border-l-yellow-500'
                                        : 'hover:bg-pink-300'
                                }`}
                                onClick={() => onSelect(task)}
                            >
                                {editingId === task._id ? (
                                    <>
                                        <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editForm.text}
                                                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                                                className="w-full p-1 border border-black rounded"
                                                autoFocus
                                            />
                                        </td>
                                        <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={editForm.hours}
                                                onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                                                className="w-full p-1 border border-black rounded"
                                                placeholder="Optional"
                                            />
                                        </td>
                                        <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="date"
                                                value={editForm.deadline}
                                                onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                                className="w-full p-1 border border-black rounded"
                                            />
                                        </td>
                                        <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                            <select
                                                value={editForm.importance}
                                                onChange={(e) => setEditForm({ ...editForm, importance: e.target.value })}
                                                className="w-full p-1 border border-black rounded"
                                            >
                                                <option value="high">High</option>
                                                <option value="medium">Med</option>
                                                <option value="low">Low</option>
                                            </select>
                                        </td>
                                        <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                            <GoalSelect
                                                value={editForm.goal}
                                                onChange={(val) => setEditForm({ ...editForm, goal: val })}
                                                showCustom={editShowCustomInput}
                                                setShowCustom={setEditShowCustomInput}
                                                customValue={editCustomGoal}
                                                setCustomValue={setEditCustomGoal}
                                            />
                                        </td>
                                        <td className="p-2 flex gap-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleSaveEdit(task._id)}
                                                className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                            >✓</button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                            >✕</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="border-r-2 border-black p-3">
                                            <span className="mr-2">🔴</span>
                                            {task.text}
                                        </td>
                                        <td className="border-r-2 border-black p-3 text-center">
                                            {task.hours || '-'}
                                        </td>
                                        <td className="border-r-2 border-black p-3">
                                            {task.deadline || '-'}
                                        </td>
                                        <td className="border-r-2 border-black p-3 capitalize">
                                            <span className={`px-2 py-1 rounded ${
                                                task.importance === 'high' ? 'bg-red-200' :
                                                task.importance === 'medium' ? 'bg-yellow-200' :
                                                'bg-green-200'
                                            }`}>
                                                {task.importance || 'Med'}
                                            </span>
                                        </td>
                                        <td className="border-r-2 border-black p-3 text-sm">
                                            {task.goal || 'Personal'}
                                        </td>
                                        <td className="p-3 flex gap-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleEdit(task)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >✎</button>
                                            <button
                                                onClick={() => onDelete(task._id)}
                                                className="text-red-600 hover:text-red-800"
                                            >✕</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}

                        {/* ADD FORM */}
                        <tr className="border-b-2 border-black bg-yellow-50">
                            <td className="border-r-2 border-black p-2">
                                <input
                                    type="text"
                                    value={newTaskForm.text}
                                    onChange={(e) => setNewTaskForm({ ...newTaskForm, text: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                                    className="w-full p-1 border border-black rounded"
                                    placeholder="Add task..."
                                />
                            </td>
                            <td className="border-r-2 border-black p-2">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={newTaskForm.hours}
                                    onChange={(e) => setNewTaskForm({ ...newTaskForm, hours: e.target.value })}
                                    className="w-full p-1 border border-black rounded"
                                    placeholder="Hours"
                                />
                            </td>
                            <td className="border-r-2 border-black p-2">
                                <input
                                    type="date"
                                    value={newTaskForm.deadline}
                                    onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
                                    className="w-full p-1 border border-black rounded"
                                />
                            </td>
                            <td className="border-r-2 border-black p-2">
                                <select
                                    value={newTaskForm.importance}
                                    onChange={(e) => setNewTaskForm({ ...newTaskForm, importance: e.target.value })}
                                    className="w-full p-1 border border-black rounded"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Med</option>
                                    <option value="low">Low</option>
                                </select>
                            </td>
                            <td className="border-r-2 border-black p-2">
                                <GoalSelect
                                    value={newTaskForm.goal}
                                    onChange={(val) => setNewTaskForm({ ...newTaskForm, goal: val })}
                                    showCustom={showCustomInput}
                                    setShowCustom={setShowCustomInput}
                                    customValue={customGoal}
                                    setCustomValue={setCustomGoal}
                                />
                            </td>
                            <td className="p-2">
                                <button
                                    onClick={handleAddNew}
                                    className="w-full px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >✓</button>
                            </td>
                        </tr>

                        {/* SORTED TASKS */}
                        {sortedTasks.length > 0 && (
                            <>
                                <tr className="bg-gray-200 border-b-2 border-black">
                                    <td colSpan="6" className="p-2">
                                        <button
                                            onClick={() => setShowSorted(!showSorted)}
                                            className="w-full text-left font-bold flex items-center gap-2"
                                        >
                                            {showSorted ? '▲' : '▼'}
                                            {showSorted ? 'Hide' : 'Show'} Sorted Tasks ({sortedTasks.length} organized)
                                        </button>
                                    </td>
                                </tr>

                                {showSorted && sortedTasks.map(task => (
                                    <tr
                                        key={task._id}
                                        className={`border-b-2 border-black bg-gray-100 opacity-60 cursor-pointer ${
                                            selectedTaskId === task._id ? 'bg-yellow-200 opacity-100' : 'hover:bg-gray-200'
                                        }`}
                                        onClick={() => onSelect(task)}
                                    >
                                        {editingId === task._id ? (
                                            <>
                                                <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={editForm.text}
                                                        onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                                                        className="w-full p-1 border border-black rounded"
                                                        autoFocus
                                                    />
                                                </td>
                                                <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        value={editForm.hours}
                                                        onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                                                        className="w-full p-1 border border-black rounded"
                                                    />
                                                </td>
                                                <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="date"
                                                        value={editForm.deadline}
                                                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                                        className="w-full p-1 border border-black rounded"
                                                    />
                                                </td>
                                                <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                                    <select
                                                        value={editForm.importance}
                                                        onChange={(e) => setEditForm({ ...editForm, importance: e.target.value })}
                                                        className="w-full p-1 border border-black rounded"
                                                    >
                                                        <option value="high">High</option>
                                                        <option value="medium">Med</option>
                                                        <option value="low">Low</option>
                                                    </select>
                                                </td>
                                                <td className="border-r-2 border-black p-2" onClick={e => e.stopPropagation()}>
                                                    <GoalSelect
                                                        value={editForm.goal}
                                                        onChange={(val) => setEditForm({ ...editForm, goal: val })}
                                                        showCustom={editShowCustomInput}
                                                        setShowCustom={setEditShowCustomInput}
                                                        customValue={editCustomGoal}
                                                        setCustomValue={setEditCustomGoal}
                                                    />
                                                </td>
                                                <td className="p-2 flex gap-1" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleSaveEdit(task._id)}
                                                        className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                                    >✓</button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                                    >✕</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="border-r-2 border-black p-3">
                                                    <span className="mr-2">✅</span>
                                                    {task.text}
                                                    <span className="ml-2 text-xs px-2 py-1 bg-blue-100 rounded">
                                                        → {task.sortedCategory === 'priorities' ? 'Top Priorities' :
                                                            task.sortedCategory === 'tomorrow' ? 'For Tomorrow' :
                                                            "Don't Forget"}
                                                    </span>
                                                </td>
                                                <td className="border-r-2 border-black p-3 text-center">
                                                    {task.hours || '-'}
                                                </td>
                                                <td className="border-r-2 border-black p-3">
                                                    {task.deadline || '-'}
                                                </td>
                                                <td className="border-r-2 border-black p-3 capitalize">
                                                    <span className={`px-2 py-1 rounded ${
                                                        task.importance === 'high' ? 'bg-red-200' :
                                                        task.importance === 'medium' ? 'bg-yellow-200' :
                                                        'bg-green-200'
                                                    }`}>
                                                        {task.importance || 'Med'}
                                                    </span>
                                                </td>
                                                <td className="border-r-2 border-black p-3 text-sm">
                                                    {task.goal || 'Personal'}
                                                </td>
                                                <td className="p-3 flex gap-1" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleEdit(task)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >✎</button>
                                                    <button
                                                        onClick={() => onDelete(task._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >✕</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>

                {unsortedTasks.length === 0 && sortedTasks.length === 0 && (
                    <div className="p-8 text-center text-gray-600">
                        <p className="mb-2">No tasks yet. Start by adding your first task below!</p>
                        <p className="text-sm">💡 Tip: Just brain dump - we'll organize it for you!</p>
                    </div>
                )}
            </div> 
        </div>
    );
};


export default ParkingLot;