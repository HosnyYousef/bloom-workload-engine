import { useState } from 'react';

const NotesThoughts = ({ onAdd }) => {
    const [notes, setNotes] = useState('');

    const handleSendToParking = () => {
        const lines = notes.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return;
        lines.forEach(line => {
            onAdd({
                text: line,
                hours: 0,
                deadline: '',
                importance: 'medium'
            });
        });
        setNotes('');
    };

    return (
        <div className="bg-yellow-100 dark:bg-[#15110a] border-2 border-black dark:border-gray-700 rounded-2xl p-4 h-auto min-h-32 transition-colors">
            <div className="flex justify-between items-center border-b-2 border-black dark:border-yellow-900 pb-2 mb-3">
                <p className="dark:text-yellow-100 font-semibold">Notes/Thoughts</p>
                <button
                    onClick={handleSendToParking}
                    disabled={!notes.trim()}
                    className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    → Parking Lot
                </button>
            </div>

            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Random thoughts, ideas, reminders...'
                className='w-full h-32 p-2 border border-gray-300 dark:border-yellow-800/40 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-600 bg-white dark:bg-black/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm leading-relaxed'
            />

            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                💡 Each line becomes a separate task in the Parking Lot.
            </p>
        </div>
    )
}

export default NotesThoughts
