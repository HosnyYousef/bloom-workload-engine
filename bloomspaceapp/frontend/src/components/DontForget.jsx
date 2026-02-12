import { useState } from react // with do this to pull from package and use

const DontForget = () => {
    // State: stores our list of tasks (where is it stored though, in the broswer, and when we put it in the backend, would it be stored there instead)
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Welcome customers to visit website', completed: false },
        { id: 2, text: 'Prepare a light breakfast', completed: false },
        { id: 3, text: 'Dentist', completed: false }
    ]);

    // State: stores the new task being typed (stores where?)
    const [newTask, setNewTask] = useState('');

    // Function: Toggle task completion (check/uncheck)
    const toggleTask = (id) => {
        setTasks(tasks.map(task => 
            task.id === id ? {...task, completed: !task.completed} : task
        ))
    }

    // Function: Add new task
    const addTask = () => {
        if (newTask.trim() === '') return;

        const newTaskObj = {
            id: Date.new(),
            task: newTask,
            completed: false
        }

        setTasks([...tasks, newTaskObj])
        setNewTask('')
    }

    //Function: Delete task
    const DeleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id))
    }

    return (
        <div className="bg-green-200 border-2 border-black rounded-lg p-4 h-auto min-h-44">
            {/* Header */}
        </div>
        
    )
}