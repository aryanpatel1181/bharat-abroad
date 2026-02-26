import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🇮🇳</span>
                    <span className="text-xl font-bold text-orange-500">Bharat</span>
                    <span className="text-xl font-bold text-gray-800">Abroad</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/" className="text-gray-600 hover:text-orange-500 transition">Home</Link>
                    <Link to="/events" className="text-gray-600 hover:text-orange-500 transition">Events</Link>
                    <Link to="/about" className="text-gray-600 hover:text-orange-500 transition">About</Link>
                    <Link to="/submit" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition">
                        + Submit Event
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
                    <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-orange-500">Home</Link>
                    <Link to="/events" onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-orange-500">Events</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-orange-500">About</Link>
                    <Link to="/submit" onClick={() => setMenuOpen(false)} className="bg-orange-500 text-white px-4 py-2 rounded-full text-center hover:bg-orange-600">
                        + Submit Event
                    </Link>
                </div>
            )}
        </nav>
    )
}