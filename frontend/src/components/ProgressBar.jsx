// Indeterminate progress bar: we don't know how long a request will take,
// so a bar that sweeps back and forth beats a static spinner at reassuring
// someone the app hasn't frozen. Calm motion, not a percentage guess.
const ProgressBar = ({ label }) => (
    <div className="w-full">
        {label && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        )}
        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-blue-500 dark:bg-blue-400 animate-progress-sweep" />
        </div>
    </div>
);

export default ProgressBar;
