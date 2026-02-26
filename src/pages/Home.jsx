import { Link } from 'react-router-dom'

const featuredEvents = [
    {
        id: 1,
        title: "Holi Festival of Colors",
        date: "March 15, 2026",
        location: "Chicago, IL",
        category: "Festival",
        image: "https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=400",
    },
    {
        id: 2,
        title: "Diwali Night Gala",
        date: "April 2, 2026",
        location: "New York, NY",
        category: "Cultural",
        image: "https://images.unsplash.com/photo-1574265865559-54e2716c4aec?w=400",
    },
    {
        id: 3,
        title: "Bharatanatyam Dance Show",
        date: "April 20, 2026",
        location: "San Francisco, CA",
        category: "Arts",
        image: "https://images.unsplash.com/photo-1604608672516-f1b9c8c0b9a8?w=400",
    },
]

const categories = [
    { label: "Festivals", icon: "🎉" },
    { label: "Music", icon: "🎵" },
    { label: "Food", icon: "🍛" },
    { label: "Arts", icon: "🎨" },
    { label: "Spirituality", icon: "🕉️" },
    { label: "Sports", icon: "🏏" },
]

export default function Home() {
    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-300 text-white py-20 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Celebrate India, <span className="text-white underline decoration-wavy">Everywhere</span>
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                    Discover Indian festivals, cultural events, and community gatherings across the United States.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/events"
                        className="bg-white text-orange-500 font-semibold px-6 py-3 rounded-full hover:bg-orange-50 transition"
                    >
                        Browse Events
                    </Link>
                    <Link
                        to="/submit"
                        className="border-2 border-white text-white font-semibold px-6 py-3 rounded-full hover:bg-white hover:text-orange-500 transition"
                    >
                        + Submit Your Event
                    </Link>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Browse by Category</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {categories.map((cat) => (
                        <Link
                            to="/events"
                            key={cat.label}
                            className="flex flex-col items-center gap-2 bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:scale-105 transition cursor-pointer"
                        >
                            <span className="text-3xl">{cat.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Events */}
            <section className="bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Featured Events</h2>
                        <Link to="/events" className="text-orange-500 font-medium hover:underline">View all →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredEvents.map((event) => (
                            <div key={event.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                                <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                                        {event.category}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-800 mt-2">{event.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">📅 {event.date}</p>
                                    <p className="text-sm text-gray-500">📍 {event.location}</p>
                                    <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Chatbot Teaser */}
            <section className="bg-gradient-to-r from-orange-500 to-yellow-400 py-12 px-4 text-center text-white">
                <div className="max-w-2xl mx-auto">
                    <span className="text-4xl">🤖</span>
                    <h2 className="text-2xl font-bold mt-2 mb-2">Ask Bharat AI</h2>
                    <p className="opacity-90 mb-6">Have questions about Indian culture, festivals, or events near you? Our AI assistant is here to help!</p>
                    <div className="flex items-center bg-white rounded-full overflow-hidden shadow-md max-w-lg mx-auto">
                        <input
                            type="text"
                            placeholder="e.g. What is Diwali? or Find Holi events near me..."
                            className="flex-1 px-5 py-3 text-gray-700 text-sm outline-none"
                        />
                        <button className="bg-orange-500 text-white px-5 py-3 font-semibold hover:bg-orange-600 transition">
                            Ask →
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
                © 2026 Bharat Abroad. Made with ❤️ for the Indian diaspora in the US.
            </footer>
        </div>
    )
}