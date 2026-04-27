import { useState } from 'react'
import api from '../services/api';

export default function Register({ onLogin }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')


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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="card bg-white dark:bg-gray-900 p-8 rounded-2xl w-full max-w-md border-2 border-black dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Create Account</h2>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <input
                        type="text"
                        name='name'
                        placeholder='Full Name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    />
                    <input
                        type="email"
                        name='email'
                        placeholder='Email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    />
                    <input
                        type="password"
                        name='password'
                        placeholder='Password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    />
                    <button
                        type='submit'
                        className="btn w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 border-2 border-black dark:border-gray-600"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    )
}