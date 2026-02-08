import {useState} from 'react'

const TopPriorities = () => {
    // State: stores our list of tasks
const [tasks, setTasks] = useState ([
    { id: 1, text: 'help friend apply for vistor VISA', completed: false},
    { id: 2, text: 'Work on project', completed: false },
    { id: 3, text: 'Process Business Data', completed: false}
])

// State: stores the new task being typed
const [newTask, setNewTask] = useState('');

// Funtion: Toggle task completion (check/uncheck)

// Function: Add new task

// Function: Delete task


    
}

export default TopPriorities