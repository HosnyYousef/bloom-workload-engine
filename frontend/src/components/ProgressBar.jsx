const ProgressBar = ({ label, progress }) => {
    const isDeterminate = Number.isFinite(progress);
    const safeProgress = isDeterminate ? Math.min(100, Math.max(0, progress)) : null;

    return (
    <div className="w-full">
        {(label || isDeterminate) && (
            <div className="flex justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{label}</span>
                {isDeterminate && <span>{safeProgress}%</span>}
            </div>
        )}
        <div
            className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
            role="progressbar"
            aria-label={label || 'Loading'}
            aria-valuemin={isDeterminate ? 0 : undefined}
            aria-valuemax={isDeterminate ? 100 : undefined}
            aria-valuenow={isDeterminate ? safeProgress : undefined}
        >
            {isDeterminate ? (
                <div
                    className="h-full rounded-full bg-blue-500 dark:bg-blue-400 transition-[width] duration-300"
                    style={{ width: `${safeProgress}%` }}
                />
            ) : (
                <div className="h-full w-1/3 rounded-full bg-blue-500 dark:bg-blue-400 animate-progress-sweep" />
            )}
        </div>
    </div>
    );
};

export default ProgressBar;
