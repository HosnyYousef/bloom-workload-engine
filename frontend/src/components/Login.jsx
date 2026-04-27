import { useState } from 'react';
import api from '../services/api'

export default function Login({ onLogin }) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('')
    const [isDemoLoading, setIsDemoLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const response = await api.post('/auth/login', formData)
            const { token, name } = response.data;

            localStorage.setItem('token', token)
            onLogin({ name, token })

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed')
        }
    }

    // Calls demo endpoint, resets seed data, logs in without credentials
    const handleDemoLogin = async () => {
        setError('')
        setIsDemoLoading(true)

        try {
            const response = await api.post('/auth/demo')
            const { token, user } = response.data;

            localStorage.setItem('token', token)
            onLogin({ name: user.name, token })

        } catch (err) {
            setError(err.response?.data?.message || 'Demo login failed')
        } finally {
            setIsDemoLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <input
                        type="email"
                        name='email'
                        placeholder='Email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        name='password'
                        placeholder='Password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type='submit'
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                        Log In
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="mx-3 text-sm text-gray-400">or</span>
                    <div className="flex-1 border-t border-gray-200" />
                </div>

                {/* One-click demo login for recruiters */}
                <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isDemoLoading}
                    className="w-full border border-blue-400 text-blue-500 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-white"
                >
                    {isDemoLoading && (
                        <span
                            className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
                            aria-hidden="true"
                        />
                    )}
                    {isDemoLoading ? 'Loading Demo...' : 'Try Demo'}
                </button>
            </div>
        </div>
    )
}
