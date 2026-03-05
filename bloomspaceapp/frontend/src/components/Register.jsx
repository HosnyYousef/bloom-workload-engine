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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>

                    {/* Name FIELD */}
                    <input
                        type="text"
                        name='name'
                        placeholder='Full Name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className='w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    />


                    {/* EMAIL FIELD */}
                    <input
                        type="email"
                        name='email'
                        placeholder='Email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className='w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    />

                    {/* PASSWORD FIELD */}
                    <input
                        type="password"
                        name='password'
                        placeholder='Password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className='w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    />

                    <button
                        type='submit'
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    )
}