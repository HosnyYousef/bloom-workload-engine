import { useEffect, useState } from "react";

const DRAFT_KEY = 'bloomspace.parkingLotDraft';

const splitEntries = (draft) => draft
    .split(/\n+/)
    .map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

const ParkingLot = ({
    tasks,
    onUpdate,
    onDelete,
    onExecute,
    onUndo,
    canUndo,
    onSelect,
    selectedTaskId,
}) => {
    const [draft, setDraft] = useState(() => localStorage.getItem(DRAFT_KEY) || '');
    const [executedDraft, setExecutedDraft] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [isUndoing, setIsUndoing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        localStorage.setItem(DRAFT_KEY, draft);
    }, [draft]);

    const handleExecute = async () => {
        const entries = splitEntries(draft);
        if (entries.length === 0) return;

        setError('');
        setIsExecuting(true);
        const originalDraft = draft;
        const succeeded = await onExecute(entries);
        setIsExecuting(false);

        if (succeeded) {
            setExecutedDraft(originalDraft);
            setDraft('');
        } else {
            setError('Nothing changed. Your notes are still here.');
        }
    };

    const handleUndo = async () => {
        setError('');
        setIsUndoing(true);
        const succeeded = await onUndo();
        setIsUndoing(false);

        if (succeeded) {
            setDraft(executedDraft);
            setExecutedDraft('');
        } else {
            setError('Undo did not finish. Your organized tasks are still safe.');
        }
    };

    const unsortedTasks = tasks.filter(task => !task.sorted);

    return (
        <section className="card bg-pink-300 dark:bg-[#200a12] border-2 border-black dark:border-gray-700 rounded-2xl p-6 min-h-150 flex flex-col transition-colors">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                    <h2 className="font-bold text-2xl dark:text-gray-100">PARKING LOT</h2>
                    <p className="text-sm text-gray-700 dark:text-gray-400">Write it down however it comes to you. It saves as you type.</p>
                </div>
                <div className="flex gap-2">
                    {canUndo && (
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={isUndoing || isExecuting}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-xl font-bold disabled:opacity-60"
                        >
                            {isUndoing ? 'Undoing...' : 'Undo'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleExecute}
                        disabled={!draft.trim() || isExecuting || isUndoing}
                        className="btn px-4 py-2 bg-yellow-400 border-2 border-black dark:border-yellow-600 rounded-xl font-bold hover:bg-yellow-500 disabled:opacity-60 dark:text-gray-900"
                    >
                        {isExecuting ? 'Organizing...' : 'Turn into tasks'}
                    </button>
                </div>
            </div>

            <div className="bg-pink-100 dark:bg-[#17080f] border-2 border-black dark:border-gray-700 rounded-2xl overflow-hidden">
                <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={'Type anything here...\n\nCall the dentist\nMaybe look into that design course\nFinish the report by Friday'}
                    aria-label="Parking Lot notes"
                    className="w-full min-h-80 resize-y p-5 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none leading-7"
                />
                <div className="px-5 py-2 border-t border-pink-300 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                    Saved on this device
                </div>
            </div>

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>
            )}

            {unsortedTasks.length > 0 && (
                <div className="mt-5">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">Waiting to be organized</h3>
                    <ul className="space-y-2">
                        {unsortedTasks.map(task => (
                            <li
                                key={task._id}
                                onClick={() => onSelect(task)}
                                className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer bg-white/60 dark:bg-gray-900/60 ${selectedTaskId === task._id ? 'border-yellow-500' : 'border-pink-400 dark:border-gray-700'}`}
                            >
                                <input
                                    value={task.text}
                                    onClick={event => event.stopPropagation()}
                                    onChange={event => onUpdate(task._id, { text: event.target.value })}
                                    aria-label={`Edit ${task.text}`}
                                    className="flex-1 bg-transparent focus:outline-none dark:text-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onDelete(task._id);
                                    }}
                                    aria-label={`Delete ${task.text}`}
                                    className="text-red-600 dark:text-red-400 px-2"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};

export { splitEntries };
export default ParkingLot;
