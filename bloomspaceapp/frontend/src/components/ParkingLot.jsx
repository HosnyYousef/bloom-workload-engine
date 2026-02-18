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

    </table>


    </div>

}