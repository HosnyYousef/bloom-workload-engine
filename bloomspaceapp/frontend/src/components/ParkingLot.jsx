import { useState } from "react";

const ParkingLot = ({ tasks, onAdd, onUpdate, onDelete }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    //Form state for new/editing task

    const [formData, setFormData] = useState({
        text: '',
        hours: '',
        deadline: '',
        importance: 'medium'
    })

    const handleAddClick = () => {
        setIsAdding(true);
        setFormData({ text: '', hours: '', deadline: '', importance: 'medium' });
    }

    const handleSaveNew = () => {
        if (formData.text.trim() === '') return;

        onAdd({
            text: formData.text,
            hours: parseFloat(formData.hours) || 0,
            deadline: formData.deadline,
            importance: formData.importance
        })

        setIsAdding(false);

        setFormData({ text: '', hours: '', deadline: '', importance: 'medium' })
    };

    const handleEdit = (task) => {
        setEditingId(task.id);

        setFormData({
            text: task.text,
            hours: task.hours,
            deadline: task.deadline,
            importance: task.importance
        })
    }

    const handleSaveEdit = (id) => {
        onUpdate(id, {
            text: formData.text,
            hours: parseFloat(formData.hours) || 0,
            deadline: formData.deadline,
            importance: formData.importance
        })
        setEditingId(null)
    }

    const handleCancel = () => {
        setIsAdding(false);

        setEditingId(null);

        setFormData({ text: '', hours: '', deadline: '', importance: 'medium' })
    }

    // Table header:

    <div className="bg-pink-300 border-2 border-black rounded-lg p-6 min-h-96">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-2xl">PARKING LOT</h2>
            <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-yellow-400 border-2 border-black rounded-lg font-bold hover:bg-yellow-500 flex items-center gap-2"
            >
                <span className="text-xl">📝</span>
                ORGANIZE!
            </button>
        </div>

        {/* Table Structure */}
        <table className="w-full">
            <thead className="bg-pink-400 border-b-2 border-black">
                <tr>
                    <th className="border-r-2 border-black p-3 text-left font-bold">ITEM</th>
                    <th className="border-r-2 border-black p-3 text-left font-bold w-32">LENGTH - HOURS</th>
                    <th className="border-r-2 border-black p-3 text-left font-bold w-40">DATE DUE/DAILY TIME</th>
                    <th className="border-r-2 border-black p-3 text-left font-bold w-36">IMPORTANCE LEVEL</th>
                    <th className="p-3 w-20"></th>
                </tr>
            </thead>

            <tbody>
                {tasks.map(task => (
                    <tr key={task.id} className="border-b-2 border-black hover:bg-pink-300">
                        {editingId === task.id ? (


                            <>

                                <td className="border-r-2 border-black p-2">
                                    <input
                                        type="text"
                                        value={formData.text}
                                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                        className="w-full p-1 border border-black rounded"
                                        autoFocus
                                    />
                                </td>

                                <td className="border-r-2 border-black p-2">
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={formData.hours}
                                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                        className="w-full p-1 border border-black rounded"
                                        placeholder="Optional"
                                    />
                                </td>

                                <td className="border-r-2 border-black p-2">
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full p-1 border border-black rounded"
                                    />
                                </td>

                                <td className="border-r-2 border-black p-2">
                                    <select
                                        value={formData.importance}
                                        onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                                        className="w-full p-1 border border-black rounded"
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Med</option>
                                        <option value="low">Low</option>
                                    </select>
                                </td>

                                <td className="p-2 flex gap-1">

                                    <button
                                        onClick={() => handleSaveEdit(task.id)}
                                        className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </>

                            // View Mode (else part of ternary)
                        ) : (
                            <>
                                <td className="border-r-2 border-black p-3">{task.text}</td>

                                <td className="border-r-2 border-black p-3 text-center">
                                    {task.hours || '-'}
                                </td>

                                <td className="border-r-2 border-black p-3">
                                    {task.deadline || '-'}
                                </td>

                                <td className="border-r-2 border-black p-3 capitalize">
                                    <span className={`px-2 py-1 rounded ${task.importance === 'high' ? 'bg-red-200' :
                                        task.importance === 'medium' ? 'bg-yellow-200' :
                                            'bg-green-200'
                                        }`}>
                                        {task.importance || 'Med'}
                                    </span>
                                </td>

                                <td className="p-3 flex gap-1">
                                    <button
                                        onClick={() => handleEdit(task)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ✎
                                    </button>
                                    <button
                                        onClick={() => onDelete(task.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ✕
                                    </button>
                                </td>

                            </>
                        )}
                    </tr>
                ))}

                {isAdding && (
                    <tr className="border-b-2 border-black bg-yellow-100">

                    </tr>
                )}
            </tbody>
        </table>
        {tasks.length === 0 && !isAdding && (
            <div className="p-8 text-center text-gray-600">
                <p className="mb-2">No tasks yet. Click "ORGANIZE!" to add your first task.</p>
                <p className="text-sm">Tip: Brain dump everything here, the app will organize it for you!</p>
            </div>
        )}
    </div>

}