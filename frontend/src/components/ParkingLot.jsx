import { useRef, useState } from "react";
import { editorTextFromElement, sanitizeEditorHtml, splitEntries } from "../utils/splitParkingLotEntries";

const DRAFT_KEY = 'bloomspace.parkingLotDraft';

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
    // Restore once. Re-reading this after every input makes React replace the
    // editable HTML and resets the caret, which causes new text to appear backwards.
    const [initialDraft] = useState(() => sanitizeEditorHtml(localStorage.getItem(DRAFT_KEY) || ''));
    const editorRef = useRef(null);
    const [draftText, setDraftText] = useState(() => {
        const holder = document.createElement('div');
        holder.innerHTML = initialDraft;
        return holder.textContent || '';
    });
    const [executedDraft, setExecutedDraft] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isUndoing, setIsUndoing] = useState(false);
    const [error, setError] = useState('');

    const saveDraft = () => {
        const editor = editorRef.current;
        if (!editor) return;
        const cleanHtml = sanitizeEditorHtml(editor.innerHTML);
        localStorage.setItem(DRAFT_KEY, cleanHtml);
        setDraftText(editorTextFromElement(editor));
    };

    const formatDraft = (command) => {
        editorRef.current?.focus();
        document.execCommand(command, false);
        saveDraft();
    };

    const handlePaste = (event) => {
        event.preventDefault();
        document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
        saveDraft();
    };

    const handleKeyDown = (event) => {
        if (!(event.metaKey || event.ctrlKey) || event.altKey) return;

        const formattingCommands = {
            b: 'bold',
            i: 'italic',
        };
        const command = formattingCommands[event.key.toLowerCase()];
        if (!command) return;

        event.preventDefault();
        formatDraft(command);
    };

    const handleExecute = async () => {
        const editor = editorRef.current;
        const entries = splitEntries(editorTextFromElement(editor));
        if (entries.length === 0) return;

        setError('');
        setIsExecuting(true);
        const originalDraft = editor.innerHTML;
        const succeeded = await onExecute(entries);
        setIsExecuting(false);

        if (succeeded) {
            setExecutedDraft(originalDraft);
            editor.innerHTML = '';
            localStorage.setItem(DRAFT_KEY, '');
            setDraftText('');
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
            editorRef.current.innerHTML = executedDraft || '';
            localStorage.setItem(DRAFT_KEY, executedDraft || '');
            setDraftText(editorTextFromElement(editorRef.current));
            setExecutedDraft(null);
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
                        disabled={!draftText.trim() || isExecuting || isUndoing}
                        className="btn px-4 py-2 bg-yellow-400 border-2 border-black dark:border-yellow-600 rounded-xl font-bold hover:bg-yellow-500 disabled:opacity-60 dark:text-gray-900"
                    >
                        {isExecuting ? 'Organizing...' : 'Turn into tasks'}
                    </button>
                </div>
            </div>

            <div className="bg-pink-100 dark:bg-[#17080f] border-2 border-black dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-pink-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" aria-label="Parking Lot formatting">
                    <button type="button" onClick={() => formatDraft('bold')} aria-label="Bold" title="Bold (Ctrl/Cmd+B)" className="w-9 h-8 rounded font-bold hover:bg-pink-200 dark:hover:bg-gray-800">B</button>
                    <button type="button" onClick={() => formatDraft('italic')} aria-label="Italic" title="Italic (Ctrl/Cmd+I)" className="w-9 h-8 rounded italic hover:bg-pink-200 dark:hover:bg-gray-800">I</button>
                    <button type="button" onClick={() => formatDraft('insertUnorderedList')} aria-label="Bulleted list" className="px-3 h-8 rounded hover:bg-pink-200 dark:hover:bg-gray-800">• List</button>
                    <button type="button" onClick={() => formatDraft('insertOrderedList')} aria-label="Numbered list" className="px-3 h-8 rounded hover:bg-pink-200 dark:hover:bg-gray-800">1. List</button>
                </div>
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{ __html: initialDraft }}
                    onInput={saveDraft}
                    onBlur={saveDraft}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    dir="ltr"
                    data-placeholder={'Type anything here...\n\nCall the dentist\nMaybe look into that design course\nFinish the report by Friday'}
                    aria-label="Parking Lot notes"
                    className="parking-lot-editor w-full min-h-80 p-5 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none leading-7"
                />
                <div className="px-5 py-2 border-t border-pink-300 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                    Saved on this device · Ctrl/Cmd+Z undo · Shift+Ctrl/Cmd+Z redo · standard cut, copy, paste, and select-all shortcuts work
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

export default ParkingLot;
