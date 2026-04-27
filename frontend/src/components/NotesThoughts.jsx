import { useState } from 'react';

const NotesThoughts = () => {
    const [notes, setNotes] = useState('');

    return (
        <div className="bg-yellow-100 dark:bg-[#15110a] border-2 border-black dark:border-gray-700 rounded-lg p-4 h-auto min-h-32 transition-colors">
            <div className="flex justify-between items-center border-b-2 border-black dark:border-yellow-900 pb-2 mb-3">
                <p className="dark:text-yellow-100">Notes/Thoughts</p>
            </div>

            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Random thoughts, ideas, reminders... (auto-saves)'
                className='w-full h-32 p-2 border border-gray-300 dark:border-yellow-900/50 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-700 bg-white dark:bg-yellow-950/30 text-gray-900 dark:text-yellow-100 placeholder-gray-400 dark:placeholder-yellow-900/80'
                style={{ fontFamily: 'Comic Sans MS, cursive' }}
            />

            <p className='text-xs text-gray-500 dark:text-yellow-900 mt-1'>
                💡 Tip: Jot down anything. Organize into tasks later.
            </p>
        </div>
    )
}

export default NotesThoughts
