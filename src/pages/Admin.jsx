import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'bharatabroad2026'

export default function Admin() {
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (authenticated) fetchEvents()
    }, [authenticated])

    const fetchEvents = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) console.error(error)
        else setEvents(data)
        setLoading(false)
    }

    const updateStatus = async (id, status) => {
        const { error } = await supabase
            .from('events')
            .update({ status })
            .eq('id', id)
        if (error) console.error(error)
        else fetchEvents()
    }

    const deleteEvent = async (id) => {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id)
        if (error) console.error(error)
        else fetchEvents()
    }

    const handleLogin = (e) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            setAuthenticated(true)
            setError(null)
        } else {
            setError('Incorrect password. Please try again.')
        }
    }

    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
                <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
                    <div className="text-center mb-6">
                        <span className="text-4xl">🔐</span>
                        <h1 className="text-2xl font-bold text-gray-800 mt-2">Admin Login</h1>
                        <p className="text-gray-500 text-sm mt-1">Bharat Abroad Dashboard</p>
                    </div>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        {error && (
                            <div className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm">{error}</div>
                        )}
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition"
                        />
                        <button
                            type="submit"
                            className="bg-orange-500 text-white py-2.5 rounded-full font-semibold text-sm hover:bg-orange-600 transition"
                        >
                            Login →
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    const pending = events.filter((e) => e.status === 'pending')
    const approved = events.filter((e) => e.status === 'approved')
    const rejected = events.filter((e) => e.status === 'rejected')

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage submitted events</p>
                </div>
                <button
                    onClick={() => setAuthenticated(false)}
                    className="text-sm text-gray-500 hover:text-red-500 transition"
                >
                    Logout
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500">{pending.length}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-500">{approved.length}</p>
                    <p className="text-sm text-gray-500">Approved</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">{rejected.length}</p>
                    <p className="text-sm text-gray-500">Rejected</p>
                </div>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">
                    <span className="text-4xl">🌀</span>
                    <p className="mt-4">Loading events...</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4">
                            {/* Event Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.status === 'approved' ? 'bg-green-100 text-green-600' :
                                            event.status === 'rejected' ? 'bg-red-100 text-red-500' :
                                                'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {event.status}
                                    </span>
                                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                        {event.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800">{event.title}</h3>
                                <p className="text-sm text-gray-500">📅 {event.date} &nbsp; 📍 {event.location}</p>
                                <p className="text-sm text-gray-500">👤 {event.organizer} — {event.email}</p>
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-shrink-0">
                                {event.status !== 'approved' && (
                                    <button
                                        onClick={() => updateStatus(event.id, 'approved')}
                                        className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition"
                                    >
                                        ✓ Approve
                                    </button>
                                )}
                                {event.status !== 'rejected' && (
                                    <button
                                        onClick={() => updateStatus(event.id, 'rejected')}
                                        className="bg-red-100 text-red-500 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-200 transition"
                                    >
                                        ✕ Reject
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteEvent(event.id)}
                                    className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}