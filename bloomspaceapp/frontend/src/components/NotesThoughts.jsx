import { useState } from 'react';

const NotesThoughts = () => {
    const [notes, setNotes] = useState('');

    return (
        <div className="bg-yellow-100 border-2 border-black rounded-lg p-4 h-auto min-h-32">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
                <p>Notes/Thoughts</p>
                {/* Future: add "send to parking lot" Button here */}
            </div>

            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Random thoughts, ideas, reminders... (auto-saves)'
                className='w-full h-32 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono'
                style={{ fontFamily: 'Comic Sans MS, cursive' }} // Casual, handwritten feel
            />

            <p className='text-xs text-gray-500 mt-1'>
                💡 Tip: Jot down anything. Organize into tasks later.
            </p>
        </div>
    )
}

export default NotesThoughts