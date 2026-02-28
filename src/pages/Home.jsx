import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── STATIC DATA (fallbacks) ───────────────────────────
const services = [
  { icon: '💍', title: 'Weddings', desc: 'From intimate ceremonies to grand celebrations, we create magical wedding experiences that honor traditions and reflect your unique love story.', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600' },
  { icon: '🪔', title: 'Cultural Events', desc: 'Diwali galas, Holi celebrations, Navratri nights — we bring cultural festivities to life with authenticity and contemporary flair.', image: 'https://images.unsplash.com/photo-1574265865559-54e2716c4aec?w=600' },
  { icon: '🏢', title: 'Corporate Events', desc: 'Professional conferences, product launches, and corporate galas designed to impress and inspire with cultural elegance.', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' },
  { icon: '🎉', title: 'Festivals', desc: 'Large-scale festival productions that bring communities together in celebration of heritage, music, art, and food.', image: 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=600' },
  { icon: '🥂', title: 'Private Parties', desc: 'Exclusive private gatherings crafted with personal touches, premium vendors, and flawless execution.', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600' },
]

const testimonials = [
  { quote: "Bharat Abroad transformed our wedding into a fairytale. Every detail was meticulously planned, from the traditional ceremonies to the contemporary reception. They perfectly balanced our cultural heritage with modern elegance.", name: 'Priya & Rahul Sharma', role: 'Wedding Client', event: 'Destination Wedding in Jaipur', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100' },
  { quote: "Our Diwali corporate gala was an absolute masterpiece. The team understood our vision and elevated it beyond imagination. Every guest was left in awe of the stunning decorations and seamless execution.", name: 'Arjun Mehta', role: 'CEO, TechVision India', event: 'Corporate Diwali Gala', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' },
  { quote: "The Navratri festival they organized was the talk of the entire city! Over 2000 guests, flawless logistics, incredible performances. Bharat Abroad truly understands how to celebrate culture on a grand scale.", name: 'Meena Patel', role: 'Cultural Association President', event: 'Navratri Grand Celebration', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100' },
  { quote: "From the first consultation to the final dance, everything was perfect. They made our intimate family wedding feel like a royal experience. Cannot recommend them enough!", name: 'Kavita & Suresh Nair', role: 'Wedding Clients', event: 'Traditional Kerala Wedding', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
]

const portfolioFilters = ['All', 'Weddings', 'Corporate', 'Cultural', 'Festivals']
const categoryColors = { Weddings: '#c84b6e', Corporate: '#4b7fc8', Cultural: '#c87b4b', Festivals: '#7bc84b' }

// ── SCROLL REVEAL ─────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, visible]
}

function RevealSection({ children, delay = 0 }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [portfolioFilter, setPortfolioFilter] = useState('All')
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', eventType: '', message: '' })
  const [formStatus, setFormStatus] = useState('idle')
  const [isMobile, setIsMobile] = useState(false)

  // Supabase-driven data
  const [siteContent, setSiteContent] = useState({})
  const [portfolio, setPortfolio] = useState([])
  const [contentLoaded, setContentLoaded] = useState(false)

  // Fetch site content + portfolio from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const [contentRes, portfolioRes] = await Promise.all([
        supabase.from('site_content').select('*'),
        supabase.from('portfolio').select('*').order('created_at', { ascending: false }),
      ])
      if (contentRes.data) {
        const map = {}
        contentRes.data.forEach(r => { map[r.key] = r.value })
        setSiteContent(map)
      }
      if (portfolioRes.data) setPortfolio(portfolioRes.data)
      setContentLoaded(true)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    handleResize()
    supabase.from('analytics').insert([{ page: 'home', event: 'page_view', metadata: { referrer: document.referrer } }]).then(() => { })
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('resize', handleResize) }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(timer)
  }, [])

  // Content helpers with fallbacks
  const c = (key, fallback = '') => siteContent[key] || fallback

  const filteredPortfolio = portfolioFilter === 'All' ? portfolio : portfolio.filter(p => p.category === portfolioFilter)

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) { alert('Please fill in name, email and message'); return }
    setFormStatus('loading')
    try {
      const { error } = await supabase.from('contact_submissions').insert([{
        name: formData.name, email: formData.email, phone: formData.phone,
        event_type: formData.eventType, message: formData.message, status: 'new'
      }])
      if (error) throw error
      await supabase.from('analytics').insert([{ page: 'home', event: 'contact_form_submit', metadata: { event_type: formData.eventType } }])
      setFormStatus('success')
      setFormData({ name: '', email: '', phone: '', eventType: '', message: '' })
    } catch (err) { console.error(err); setFormStatus('error') }
  }

  // ── STYLES ──
  const inputStyle = { width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E0E0', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', background: 'white', color: '#1a1a1a' }
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }
  const btnPrimary = { background: '#8B1A2F', color: 'white', border: 'none', cursor: 'pointer', padding: '1rem 2.5rem', borderRadius: 100, fontSize: '1rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(139,26,47,0.25)' }

  const Badge = ({ text, light = false }) => (
    <div style={{ display: 'inline-block', background: light ? 'rgba(255,255,255,0.1)' : '#FFF0F3', color: light ? 'rgba(255,255,255,0.9)' : '#8B1A2F', padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>{text}</div>
  )

  // Contact info from Supabase or fallback
  const phone = c('contact_phone', '+1 (234) 567-890')
  const email = c('contact_email', 'hello@bharatabroad.com')
  const address = c('contact_address', '123 Event Plaza, Suite 456\nMumbai, India 400001')
  const heroImage = c('hero_image', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1600')
  const aboutImage1 = c('about_image1', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600')
  const aboutImage2 = c('about_image2', 'https://images.unsplash.com/photo-1574265865559-54e2716c4aec?w=600')
  const heroTitle = c('hero_title', 'Celebrate Culture, Embrace Elegance')
  const heroSubtitle = c('hero_subtitle', 'Creating unforgettable experiences that honor Indian traditions while embracing global sophistication.')
  const aboutTitle = c('about_title', 'Where Tradition Meets Innovation')
  const aboutText = c('about_text', 'Bharat Abroad is more than an event management company — we are storytellers, cultural ambassadors, and experience curators.')
  const socialLinks = { instagram: c('social_instagram', '#'), facebook: c('social_facebook', '#'), twitter: c('social_twitter', '#'), youtube: c('social_youtube', '#') }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? '0.875rem 2rem' : '1.5rem 2rem',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.4s ease',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 26, height: 18, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ flex: 1, background: '#E8621A' }}></div>
            <div style={{ flex: 1, background: '#fff', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}></div>
            <div style={{ flex: 1, background: '#1A5C3A' }}></div>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: scrolled ? '#8B1A2F' : 'white' }}>
            Bharat <span style={{ color: '#E8A020' }}>Abroad</span>
          </span>
        </div>

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {[['home', 'Home'], ['about', 'About'], ['services', 'Services'], ['portfolio', 'Portfolio'], ['testimonials', 'Testimonials'], ['contact', 'Contact']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? '#444' : 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s', padding: 0 }}
                onMouseEnter={e => e.target.style.color = '#8B1A2F'}
                onMouseLeave={e => e.target.style.color = scrolled ? '#444' : 'rgba(255,255,255,0.9)'}
              >{label}</button>
            ))}
            <button onClick={() => scrollTo('contact')} style={{ background: '#8B1A2F', color: 'white', border: 'none', cursor: 'pointer', padding: '0.625rem 1.5rem', borderRadius: 100, fontSize: '0.875rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(139,26,47,0.3)' }}>Book Now</button>
          </div>
        )}

        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? '#1a1a1a' : 'white', fontSize: '1.5rem', padding: 0 }}>{menuOpen ? '✕' : '☰'}</button>
        )}
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,10,15,0.98)', zIndex: 99, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
          {[['home', 'Home'], ['about', 'About'], ['services', 'Services'], ['portfolio', 'Portfolio'], ['testimonials', 'Testimonials'], ['contact', 'Contact']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: '1.5rem', fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{label}</button>
          ))}
          <button onClick={() => scrollTo('contact')} style={{ background: '#8B1A2F', color: 'white', border: 'none', cursor: 'pointer', padding: '1rem 2.5rem', borderRadius: 100, fontSize: '1rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: '1rem' }}>Book Now</button>
        </div>
      )}

      {/* ══ HERO ══ */}
      <section id="home" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.45)', transition: 'background-image 0.5s ease' }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}></div>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 800, padding: '8rem 2rem 4rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.4)', backdropFilter: 'blur(10px)', color: '#F5C842', padding: '0.5rem 1.5rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            PREMIUM EVENT MANAGEMENT
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2.75rem' : 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: '1rem' }}>
            {heroTitle.includes(',') ? (
              <>
                {heroTitle.split(',')[0]},<br />
                <span style={{ color: '#E8A020', fontStyle: 'italic' }}>{heroTitle.split(',')[1]?.trim()}</span>
              </>
            ) : (
              <span style={{ color: '#E8A020', fontStyle: 'italic' }}>{heroTitle}</span>
            )}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: 1.7, maxWidth: 550, margin: '0 auto 2.5rem', fontWeight: 300 }}>{heroSubtitle}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => scrollTo('contact')} style={btnPrimary}>Start Planning Your Event</button>
            <button onClick={() => scrollTo('portfolio')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer', padding: '1rem 2.5rem', borderRadius: 100, fontSize: '1rem', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", backdropFilter: 'blur(10px)' }}>View Our Work</button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', opacity: 0.5 }}>
          <div style={{ color: 'white', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</div>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, white, transparent)', animation: 'scrollPulse 2s ease-in-out infinite' }}></div>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section id="about" style={{ background: 'white', padding: isMobile ? '4rem 1.5rem' : '7rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '5rem', alignItems: 'center' }}>
              <div>
                <Badge text="About Bharat Abroad" />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                  {aboutTitle.includes('Meets') ? (
                    <>{aboutTitle.split('Meets')[0]}Meets<br /><span style={{ color: '#E8A020', fontStyle: 'italic' }}>{aboutTitle.split('Meets')[1]?.trim()}</span></>
                  ) : aboutTitle}
                </h2>
                <p style={{ color: '#666', lineHeight: 1.8, fontSize: '1rem', fontWeight: 300, marginBottom: '1rem' }}>{aboutText}</p>
                <p style={{ color: '#666', lineHeight: 1.8, fontSize: '1rem', fontWeight: 300, marginBottom: '2rem' }}>Our commitment to excellence and attention to detail ensures every event is nothing short of extraordinary — a true celebration of culture, heritage and elegance.</p>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                  {[['500+', 'Events Managed'], ['25+', 'Countries Served'], ['98%', 'Client Satisfaction']].map(([num, label]) => (
                    <div key={label}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', fontWeight: 700, color: '#8B1A2F' }}>{num}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    ['🌍', 'Global Vision', 'Bringing Indian culture to the world stage with modern sophistication'],
                    ['❤️', 'Cultural Roots', 'Honoring traditions while creating contemporary experiences'],
                    ['⭐', 'Premium Quality', 'Meticulous attention to detail in every aspect of your event'],
                    ['👥', 'Expert Team', 'Dedicated professionals making your vision a beautiful reality'],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{ background: '#FFF8F0', border: '1px solid #F5E6D3', borderRadius: '1rem', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', transition: 'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <span style={{ fontSize: '1.1rem', background: '#E8621A', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, flexShrink: 0 }}>{icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1a1a1a', marginBottom: '0.2rem' }}>{title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isMobile && (
                <div style={{ position: 'relative', height: 500 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '70%', height: '65%', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
                    <img src={aboutImage1} alt="Wedding" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '60%', height: '50%', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
                    <img src={aboutImage2} alt="Festival" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', top: '30%', right: '5%', background: '#E8A020', borderRadius: '1rem', padding: '1rem 1.25rem', boxShadow: '0 8px 32px rgba(232,160,32,0.35)', zIndex: 10 }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>10+ Years</div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>of Excellence</div>
                  </div>
                  <div style={{ position: 'absolute', top: -16, left: '55%', width: 80, height: 80, background: '#E8621A', borderRadius: '1.25rem', opacity: 0.75 }}></div>
                  <div style={{ position: 'absolute', bottom: '55%', left: '-5%', width: 50, height: 50, background: '#8B1A2F', borderRadius: '50%', opacity: 0.25 }}></div>
                </div>
              )}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section id="services" style={{ background: '#FAFAFA', padding: isMobile ? '4rem 1.5rem' : '7rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <Badge text="Our Expertise" />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, marginBottom: '1rem' }}>
                Crafting <span style={{ color: '#E8A020', fontStyle: 'italic' }}>Memorable Moments</span>
              </h2>
              <p style={{ color: '#888', fontSize: '1rem', maxWidth: 550, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>From weddings to corporate galas, we specialize in creating events that celebrate culture, embrace elegance, and leave lasting impressions.</p>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {services.map((service, i) => (
              <RevealSection key={service.title} delay={i * 100}>
                <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #F0E8E8', transition: 'all 0.3s', boxShadow: '0 2px 20px rgba(0,0,0,0.04)', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(139,26,47,0.12)'; e.currentTarget.style.borderColor = '#E8A020' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#F0E8E8' }}
                >
                  <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                    <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))' }}></div>
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'white', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>{service.icon}</div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.75rem' }}>{service.title}</h3>
                    <p style={{ color: '#888', fontSize: '0.875rem', lineHeight: 1.7, fontWeight: 300, marginBottom: '1rem' }}>{service.desc}</p>
                    <button onClick={() => scrollTo('contact')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B1A2F', fontWeight: 600, fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", padding: 0 }}>Learn More →</button>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>

          <RevealSection>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>Can't find what you're looking for?</p>
              <button onClick={() => scrollTo('contact')} style={btnPrimary}>Discuss Custom Event Planning</button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══ PORTFOLIO ══ */}
      <section id="portfolio" style={{ background: 'white', padding: isMobile ? '4rem 1.5rem' : '7rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <Badge text="Our Portfolio" />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, marginBottom: '1rem' }}>
                Past Events & <span style={{ color: '#E8A020', fontStyle: 'italic' }}>Success Stories</span>
              </h2>
              <p style={{ color: '#888', fontSize: '1rem', maxWidth: 550, margin: '0 auto', lineHeight: 1.7, fontWeight: 300, marginBottom: '2rem' }}>Explore our curated collection of memorable events that showcase our expertise in creating extraordinary experiences.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {portfolioFilters.map(filter => (
                  <button key={filter} onClick={() => setPortfolioFilter(filter)} style={{ padding: '0.5rem 1.25rem', borderRadius: 100, fontSize: '0.875rem', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.2s', background: portfolioFilter === filter ? '#8B1A2F' : 'white', color: portfolioFilter === filter ? 'white' : '#666', border: portfolioFilter === filter ? '1px solid #8B1A2F' : '1px solid #ddd' }}>{filter}</button>
                ))}
              </div>
            </div>
          </RevealSection>

          {filteredPortfolio.length === 0 && contentLoaded ? (
            <RevealSection>
              <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
                <p>No events in this category yet. Check back soon!</p>
              </div>
            </RevealSection>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {filteredPortfolio.map((item, i) => (
                <RevealSection key={item.id || item.title} delay={i * 80}>
                  <div style={{ position: 'relative', borderRadius: '1.25rem', overflow: 'hidden', height: 280, cursor: 'pointer', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {item.image
                      ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: '#F0E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🎉</div>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }}></div>
                    {item.category && (
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: categoryColors[item.category] || '#8B1A2F', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600 }}>{item.category}</div>
                    )}
                    <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem', lineHeight: 1.3 }}>{item.title}</h3>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap' }}>
                        {item.location && <span>📍 {item.location}</span>}
                        {item.guests && <span>👥 {item.guests}</span>}
                        {item.date && <span>📅 {item.date}</span>}
                      </div>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          )}

          <RevealSection>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => scrollTo('contact')} style={btnPrimary}>Plan Your Event With Us</button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section id="testimonials" style={{ background: '#8B1A2F', padding: isMobile ? '4rem 1.5rem' : '7rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Badge text="Testimonials" light />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '1rem' }}>
                What Our <span style={{ color: '#E8A020', fontStyle: 'italic' }}>Clients Say</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>Don't just take our word for it — hear from those who've experienced the magic of Bharat Abroad firsthand.</p>
            </div>
          </RevealSection>

          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '1.5rem', padding: isMobile ? '2rem 1.5rem' : '3rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '5rem', color: '#E8A020', lineHeight: 1, marginBottom: '1rem', opacity: 0.8 }}>"</div>
            <p style={{ color: 'white', fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: 1.8, fontWeight: 300, marginBottom: '2rem', fontStyle: 'italic' }}>{testimonials[testimonialIdx].quote}</p>
            <div style={{ color: '#E8A020', fontSize: '1rem', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>★★★★★</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E8A020' }} />
              <div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{testimonials[testimonialIdx].name}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{testimonials[testimonialIdx].role}</div>
                <div style={{ color: '#E8A020', fontSize: '0.75rem', marginTop: '0.1rem' }}>{testimonials[testimonialIdx].event}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>‹</button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)} style={{ width: i === testimonialIdx ? 28 : 10, height: 10, borderRadius: 100, border: 'none', cursor: 'pointer', background: i === testimonialIdx ? '#E8A020' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }}></button>
              ))}
            </div>
            <button onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>›</button>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ background: 'white', padding: isMobile ? '4rem 1.5rem' : '7rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #E8621A, #E8A020)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 2rem', boxShadow: '0 8px 32px rgba(232,98,26,0.3)' }}>✨</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Ready to Create Something<br /><span style={{ color: '#E8A020', fontStyle: 'italic' }}>Extraordinary?</span>
            </h2>
            <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 2.5rem', fontWeight: 300 }}>Let's bring your vision to life. Whether it's an intimate gathering or a grand celebration, Bharat Abroad is here to craft an unforgettable experience.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
              <button onClick={() => scrollTo('contact')} style={btnPrimary}>Book a Consultation</button>
              <a href={`tel:${phone}`} style={{ background: 'white', color: '#8B1A2F', border: '2px solid #8B1A2F', padding: '1rem 2.5rem', borderRadius: 100, fontSize: '1rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', display: 'inline-block' }}>Call Us Now</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '1rem', borderTop: '1px solid #F0E8E8', paddingTop: '3rem' }}>
              {[['500+', 'Events Delivered'], ['25+', 'Countries Served'], ['98%', 'Client Satisfaction'], ['10+', 'Years Experience']].map(([num, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', fontWeight: 700, color: '#8B1A2F' }}>{num}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{label}</div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" style={{ background: '#FAFAFA', padding: isMobile ? '4rem 1.5rem' : '7rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <Badge text="Get in Touch" />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '2rem' : 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, marginBottom: '1rem' }}>
                Let's Start <span style={{ color: '#E8A020', fontStyle: 'italic' }}>Planning Together</span>
              </h2>
              <p style={{ color: '#888', fontSize: '1rem', maxWidth: 450, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>Ready to make your event dreams come true? Reach out and let's create something unforgettable.</p>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
            <RevealSection>
              <div style={{ background: '#8B1A2F', borderRadius: '1.5rem', padding: '2.5rem' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Contact Information</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem', fontWeight: 300 }}>We're here to answer your questions and help you create the perfect event.</p>
                {[['📞', 'Phone', phone], ['✉️', 'Email', email], ['📍', 'Office', address]].map(([icon, label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{label}</div>
                      <div style={{ color: 'white', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{value}</div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '1rem' }}>Follow Us</div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {[['📸', socialLinks.instagram], ['📘', socialLinks.facebook], ['🐦', socialLinks.twitter], ['▶️', socialLinks.youtube]].map(([icon, link], i) => (
                      <a key={i} href={link} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', textDecoration: 'none', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      >{icon}</a>
                    ))}
                  </div>
                </div>
              </div>
            </RevealSection>

            <RevealSection>
              <div style={{ background: 'white', borderRadius: '1.5rem', padding: isMobile ? '1.5rem' : '2.5rem', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', border: '1px solid #F0E8E8' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {[['Full Name *', 'name', 'text', 'Your name'], ['Email Address *', 'email', 'email', 'your@email.com']].map(([label, name, type, placeholder]) => (
                    <div key={name}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} placeholder={placeholder} value={formData[name]} onChange={e => setFormData({ ...formData, [name]: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = '#8B1A2F'} onBlur={e => e.target.style.borderColor = '#E8E0E0'} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" placeholder="+1 (234) 567-890" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = '#8B1A2F'} onBlur={e => e.target.style.borderColor = '#E8E0E0'} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Event Type *</label>
                  <select value={formData.eventType} onChange={e => setFormData({ ...formData, eventType: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select event type</option>
                    <option>Wedding</option>
                    <option>Cultural Event</option>
                    <option>Corporate Event</option>
                    <option>Festival</option>
                    <option>Private Party</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Message *</label>
                  <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={4} placeholder="Tell us about your event..." style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#8B1A2F'} onBlur={e => e.target.style.borderColor = '#E8E0E0'} />
                </div>
                {formStatus === 'success' && <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem', color: '#2E7D32', fontSize: '0.875rem', textAlign: 'center' }}>✓ Message sent! We'll be in touch within 24 hours.</div>}
                {formStatus === 'error' && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem', color: '#C62828', fontSize: '0.875rem', textAlign: 'center' }}>Something went wrong. Please try again.</div>}
                <button onClick={handleSubmit} disabled={formStatus === 'loading'} style={{ width: '100%', background: formStatus === 'success' ? '#1A5C3A' : '#8B1A2F', color: 'white', border: 'none', cursor: formStatus === 'loading' ? 'not-allowed' : 'pointer', padding: '1rem', borderRadius: 100, fontSize: '0.9rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(139,26,47,0.25)', opacity: formStatus === 'loading' ? 0.7 : 1 }}>
                  {formStatus === 'loading' ? 'Sending...' : formStatus === 'success' ? '✓ Message Sent!' : 'Send Message ✈'}
                </button>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#1A0A0F', padding: isMobile ? '3rem 1.5rem 2rem' : '4rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr 1fr', gap: isMobile ? '2.5rem' : '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: 24, height: 16, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ flex: 1, background: '#E8621A' }}></div>
                  <div style={{ flex: 1, background: '#fff' }}></div>
                  <div style={{ flex: 1, background: '#1A5C3A' }}></div>
                </div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: '#E8A020' }}>Bharat Abroad</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.7, fontWeight: 300, marginBottom: '1.5rem' }}>Creating unforgettable experiences that honor Indian traditions while embracing global sophistication.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[['📸', socialLinks.instagram], ['📘', socialLinks.facebook], ['🐦', socialLinks.twitter], ['▶️', socialLinks.youtube]].map(([icon, link], i) => (
                  <a key={i} href={link} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[['Home', 'home'], ['About', 'about'], ['Services', 'services'], ['Portfolio', 'portfolio'], ['Contact', 'contact']].map(([label, id]) => (
                  <button key={label} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", padding: 0, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#E8A020'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                  >{label}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Services</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Weddings', 'Corporate Events', 'Cultural Events', 'Festivals', 'Private Parties'].map(s => (
                  <button key={s} onClick={() => scrollTo('services')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", padding: 0, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#E8A020'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Get in Touch</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[['📞', phone], ['✉️', email], ['📍', address.split('\n')[0]]].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>© 2026 Bharat Abroad. All rights reserved.</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>Made with ❤️ in India</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service'].map(link => (
                <button key={link} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif" }}>{link}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @keyframes scrollPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  )
}
