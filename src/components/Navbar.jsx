import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isActive = (path) => location.pathname === path

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-stone-950/90 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-col shadow-lg">
                        <div className="flex-1 bg-amber-600"></div>
                        <div className="flex-1 bg-stone-100"></div>
                        <div className="flex-1 bg-green-700"></div>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">
                        Bharat<span className="text-amber-500">Abroad</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    {[['/', 'Home'], ['/events', 'Events'], ['/about', 'About']].map(([path, label]) => (
                        <Link key={path} to={path} className={`transition-all duration-200 ${isActive(path) ? 'text-amber-500' : 'text-stone-300 hover:text-white'
                            }`}>
                            {label}
                        </Link>
                    ))}
                    <Link to="/submit" className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-200 shadow-lg shadow-amber-600/20">
                        + Submit Event
                    </Link>
                </div>

                <button className="md:hidden text-white text-xl" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {menuOpen && (
                <div className="md:hidden bg-stone-950/95 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-4">
                    {[['/', 'Home'], ['/events', 'Events'], ['/about', 'About']].map(([path, label]) => (
                        <Link key={path} to={path} onClick={() => setMenuOpen(false)} className="text-stone-300 hover:text-amber-500 transition py-1">
                            {label}
                        </Link>
                    ))}
                    <Link to="/submit" onClick={() => setMenuOpen(false)} className="bg-amber-600 text-white px-5 py-2.5 rounded-full font-semibold text-center">
                        + Submit Event
                    </Link>
                </div>
            )}
        </nav>
    )
}