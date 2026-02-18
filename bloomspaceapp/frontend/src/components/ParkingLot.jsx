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

    


}