import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const categories = ["All", "Festival", "Cultural", "Arts", "Food", "Music", "Sports", "Spirituality"]
const cities = ["All Cities", "Chicago, IL", "New York, NY", "San Francisco, CA", "Houston, TX", "Los Angeles, CA", "Dallas, TX", "Austin, TX"]

export default function Events() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedCity, setSelectedCity] = useState('All Cities')

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
        } else {
            setEvents(data)
        }
        setLoading(false)
    }

    const filtered = events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
        const matchesCity = selectedCity === 'All Cities' || event.location === selectedCity
        return matchesSearch && matchesCategory && matchesCity
    })

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">Indian Events Across the US</h1>
                <p className="text-gray-500 mt-2">Find festivals, cultural events, and community gatherings near you</p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2 mb-6 max-w-xl mx-auto">
                <span className="text-gray-400 mr-2">🔍</span>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 outline-none text-sm text-gray-700"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selectedCategory === cat
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-400'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 outline-none ml-auto"
                >
                    {cities.map((city) => (
                        <option key={city}>{city}</option>
                    ))}
                </select>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>

            {/* Loading */}
            {loading && (
                <div className="text-center py-20 text-gray-400">
                    <span className="text-4xl animate-spin inline-block">🌀</span>
                    <p className="mt-4">Loading events...</p>
                </div>
            )}

            {/* Events Grid */}
            {!loading && filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <span className="text-5xl">🙁</span>
                    <p className="mt-4 text-lg">No events found. Try a different search or filter.</p>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filtered.map((event) => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                            {event.image ? (
                                <img src={event.image} alt={event.title} className="w-full h-44 object-cover" />
                            ) : (
                                <div className="w-full h-44 bg-orange-100 flex items-center justify-center text-4xl">🎉</div>
                            )}
                            <div className="p-4">
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                                    {event.category}
                                </span>
                                <h3 className="text-base font-bold text-gray-800 mt-2">{event.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">📅 {event.date}</p>
                                <p className="text-sm text-gray-500">📍 {event.location}</p>
                                <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}