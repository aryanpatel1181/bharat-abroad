import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    return (
        <nav className="bg-white border-b-4 border-orange-500 sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex flex-col w-6 h-5 rounded-sm overflow-hidden">
                        <div className="flex-1 bg-orange-500"></div>
                        <div className="flex-1 bg-white border-y border-gray-200"></div>
                        <div className="flex-1 bg-green-600"></div>
                    </div>
                    <span className="text-xl font-bold text-orange-500">Bharat</span>
                    <span className="text-xl font-bold text-blue-900">Abroad</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/" className={`transition pb-1 ${isActive('/') ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
                        Home
                    </Link>
                    <Link to="/events" className={`transition pb-1 ${isActive('/events') ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
                        Events
                    </Link>
                    <Link to="/about" className={`transition pb-1 ${isActive('/about') ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
                        About
                    </Link>
                    <Link to="/submit" className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition font-semibold shadow-sm">
                        + Submit Event
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-gray-600 text-xl" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
                    <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-orange-500 py-2 border-b border-gray-50">Home</Link>
                    <Link to="/events" onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-orange-500 py-2 border-b border-gray-50">Events</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-orange-500 py-2 border-b border-gray-50">About</Link>
                    <Link to="/submit" onClick={() => setMenuOpen(false)} className="bg-orange-500 text-white px-4 py-2 rounded-full text-center hover:bg-orange-600 mt-1">
                        + Submit Event
                    </Link>
                </div>
            )}
        </nav>
    )
}