import { Link } from 'react-router-dom'

export default function About() {
    const team = [
        { name: "Aryan", role: "Founder & Developer", emoji: "👨‍💻" },
        { name: "Community", role: "Event Organizers", emoji: "🤝" },
        { name: "Bharat AI", role: "AI Assistant", emoji: "🤖" },
    ]

    const stats = [
        { label: "Events Listed", value: "500+" },
        { label: "Cities Covered", value: "50+" },
        { label: "Community Members", value: "10,000+" },
        { label: "States Covered", value: "30+" },
    ]

    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-orange-500 to-yellow-400 text-white py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">About Bharat Abroad</h1>
                <p className="text-lg max-w-2xl mx-auto opacity-90">
                    We are a community-driven platform connecting the Indian diaspora across the United States
                    through culture, festivals, and shared experiences.
                </p>
            </section>

            {/* Mission */}
            <section className="max-w-4xl mx-auto px-4 py-16 text-center">
                <span className="text-5xl">🇮🇳</span>
                <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-3">Our Mission</h2>
                <p className="text-gray-500 leading-relaxed text-lg">
                    Whether you moved to the US last year or were born here, the thread of Indian culture
                    runs deep. Bharat Abroad exists to make sure that thread never breaks — by helping you
                    find your community, celebrate your traditions, and discover the vibrant Indian culture
                    happening right in your city.
                </p>
            </section>

            {/* Stats */}
            <section className="bg-orange-50 py-12 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
                            <p className="text-3xl font-bold text-orange-500">{stat.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Who We Are</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {team.map((member) => (
                        <div key={member.name} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                            <span className="text-5xl">{member.emoji}</span>
                            <h3 className="text-lg font-bold text-gray-800 mt-3">{member.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-orange-500 to-yellow-400 py-12 px-4 text-center text-white">
                <h2 className="text-2xl font-bold mb-2">Want to list your event?</h2>
                <p className="opacity-90 mb-6">Join hundreds of organizers already sharing their events on Bharat Abroad.</p>
                <Link
                    to="/submit"
                    className="bg-white text-orange-500 font-semibold px-6 py-3 rounded-full hover:bg-orange-50 transition"
                >
                    + Submit Your Event
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
                © 2026 Bharat Abroad. Made with ❤️ for the Indian diaspora in the US.
            </footer>
        </div>
    )
}