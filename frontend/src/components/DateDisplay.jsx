const DateDisplay = () => {
    // get the current date once when the component mounts
    const today = new Date()

    // Format: "2 SEPTEMBER, 2030"
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'long' }).toUpperCase()
    const year = today.getFullYear()

    return (
        <div className="font-bold dark:text-gray-100 text-sm sm:text-base">
            DATE: {day} {month}, {year}
        </div>
    )
}

export default DateDisplay