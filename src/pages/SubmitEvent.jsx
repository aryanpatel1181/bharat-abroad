import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SubmitEvent() {
    const [form, setForm] = useState({
        title: '',
        date: '',
        location: '',
        category: '',
        description: '',
        organizer: '',
        email: '',
        image: '',
    })
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const categories = ['Festival', 'Cultural', 'Arts', 'Food', 'Music', 'Sports', 'Spirituality']

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.from('events').insert([
            {
                title: form.title,
                date: form.date,
                location: form.location,
                category: form.category,
                description: form.description,
                organizer: form.organizer,
                email: form.email,
                image: form.image || null,
                status: 'pending',
            }
        ])

        setLoading(false)

        if (error) {
            setError('Something went wrong. Please try again.')
            console.error(error)
        } else {
            setSubmitted(true)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <span className="text-6xl">🎉</span>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">Event Submitted!</h2>
                    <p className="text-gray-500 mt-2">
                        Thank you for submitting your event. Our team will review it and publish it shortly.
                    </p>
                    <button
                        onClick={() => {
                            setSubmitted(false)
                            setForm({ title: '', date: '', location: '', category: '', description: '', organizer: '', email: '', image: '' })
                        }}
                        className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition"
                    >
                        Submit Another Event
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Submit an Event</h1>
                <p className="text-gray-500 mt-2">Share your Indian cultural event with the community across the US</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">

                {error && (
                    <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Holi Festival of Colors"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                        <input
                            type="date"
                            name="date"
                            required
                            value={form.date}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                        <input
                            type="text"
                            name="location"
                            required
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Chicago, IL"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                        name="category"
                        required
                        value={form.category}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Description *</label>
                    <textarea
                        name="description"
                        required
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about your event..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name *</label>
                        <input
                            type="text"
                            name="organizer"
                            required
                            value={form.organizer}
                            onChange={handleChange}
                            placeholder="Your name or organization"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Image URL (optional)</label>
                    <input
                        type="url"
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold text-sm hover:bg-orange-600 transition mt-2 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Event →'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                    All submissions are reviewed by our team before being published.
                </p>
            </form>
        </div>
    )
}