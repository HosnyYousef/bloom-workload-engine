import { useState } from 'react'
import { api } from "..services/api";

export default function Register ({ onLogin }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: ''})
    const [error, setError] = useState('')
}

const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
}

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('')

    try {
        const response = await api.post('/auth/register', formData);
        const { token, name } = response.data;
        localStorage.setItem('token', token);
        onLogin({ name, token })
    } catch (err) {
        setError(err.response?.data?.message || 'Registration failed')
    }    
}

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        

        </div>
    </div>
)