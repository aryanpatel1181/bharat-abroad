import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'bharatabroad2026'

// ── HELPERS ──────────────────────────────────────────
const statusColor = (status) => {
  const map = { new: '#E8A020', contacted: '#1A5C3A', closed: '#888', pending: '#E8A020', approved: '#1A5C3A', rejected: '#8B1A2F', admin: '#4B7FC8', superadmin: '#8B1A2F' }
  return map[status] || '#888'
}

const uploadImage = async (file) => {
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}.${ext}`
  const { data, error } = await supabase.storage.from('site-images').upload(filename, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage.from('site-images').getPublicUrl(filename)
  return urlData.publicUrl
}

// ── SMALL COMPONENTS ─────────────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #F0E8E8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <span style={{ background: `${color}18`, color, borderRadius: '0.5rem', padding: '0.25rem 0.6rem', fontSize: '0.7rem', fontWeight: 600 }}>Live</span>
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.25rem' }}>{label}</div>
      {sub && <div style={{ color: '#aaa', fontSize: '0.72rem', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ label, value, max, color }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginBottom: '0.3rem' }}>
        <span>{label}</span><span style={{ fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: 6, background: '#F0E8E8', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 100, transition: 'width 0.8s ease' }}></div>
      </div>
    </div>
  )
}

function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
      background: type === 'success' ? '#1A5C3A' : type === 'error' ? '#8B1A2F' : '#4B7FC8',
      color: 'white', padding: '0.875rem 1.5rem', borderRadius: '0.75rem',
      fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      animation: 'slideIn 0.3s ease',
    }}>{msg}</div>
  )
}

function ImageUploader({ current, onUpload, label }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(current)

  const handle = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setPreview(url)
      onUpload(url)
    } catch {
      // fallback: use object URL for preview, pass file to parent
      const url = URL.createObjectURL(file)
      setPreview(url)
      onUpload(url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</label>}
      <div style={{ position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', border: '2px dashed #E8E0E0', cursor: 'pointer', background: '#FAFAFA' }}>
        {preview && <img src={preview} alt="preview" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />}
        <label style={{
          position: preview ? 'absolute' : 'relative', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: preview ? 'rgba(0,0,0,0.45)' : 'transparent',
          color: preview ? 'white' : '#888', cursor: 'pointer',
          padding: preview ? 0 : '2rem', flexDirection: 'column', gap: '0.4rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>📷</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}</span>
          <input type="file" accept="image/*" onChange={handle} style={{ display: 'none' }} />
        </label>
      </div>
      {preview && (
        <input value={preview} onChange={e => { setPreview(e.target.value); onUpload(e.target.value) }}
          placeholder="Or paste image URL"
          style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #E8E0E0', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
        />
      )}
      {!preview && (
        <input onChange={e => { setPreview(e.target.value); onUpload(e.target.value) }}
          placeholder="Or paste image URL"
          style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #E8E0E0', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  )
}

// ── MAIN ADMIN ────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('admin')
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Data
  const [submissions, setSubmissions] = useState([])
  const [events, setEvents] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [content, setContent] = useState({})
  const [adminUsers, setAdminUsers] = useState([])

  // UI state
  const [selectedSub, setSelectedSub] = useState(null)
  const [subSearch, setSubSearch] = useState('')
  const [subFilter, setSubFilter] = useState('all')
  const [portfolioModal, setPortfolioModal] = useState(null) // null | 'new' | item
  const [contentEdits, setContentEdits] = useState({})
  const [replyText, setReplyText] = useState('')
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'admin' })
  const [evtSearch, setEvtSearch] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const login = async () => {
    const { data } = await supabase.from('admin_users').select('*').eq('username', username).eq('password', password).single()
    if (data) { setAuthed(true); setCurrentUser(data); fetchAll() }
    else if (password === ADMIN_PASSWORD) { setAuthed(true); setCurrentUser({ username: 'admin', role: 'superadmin' }); fetchAll() }
    else showToast('Wrong username or password', 'error')
  }

  const fetchAll = async () => {
    setLoading(true)
    const [subR, evtR, anaR, portR, conR, usrR] = await Promise.all([
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('analytics').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('portfolio').select('*').order('created_at', { ascending: false }),
      supabase.from('site_content').select('*'),
      supabase.from('admin_users').select('*'),
    ])
    if (subR.data) setSubmissions(subR.data)
    if (evtR.data) setEvents(evtR.data)
    if (anaR.data) setAnalytics(anaR.data)
    if (portR.data) setPortfolio(portR.data)
    if (conR.data) {
      const map = {}
      conR.data.forEach(r => { map[r.key] = r.value })
      setContent(map)
      setContentEdits(map)
    }
    if (usrR.data) setAdminUsers(usrR.data)
    setLoading(false)
  }

  // ── Analytics calculations ──
  const totalViews = analytics.filter(a => a.event === 'page_view').length
  const todayViews = analytics.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString() && a.event === 'page_view').length
  const newSubs = submissions.filter(s => s.status === 'new').length
  const pendingEvts = events.filter(e => e.status === 'pending').length

  // Views by day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const count = analytics.filter(a => new Date(a.created_at).toDateString() === d.toDateString() && a.event === 'page_view').length
    return { label, count }
  })
  const maxViews = Math.max(...last7.map(d => d.count), 1)

  // Submission types breakdown
  const subTypes = {}
  submissions.forEach(s => { const t = s.event_type || 'General'; subTypes[t] = (subTypes[t] || 0) + 1 })
  const maxSubType = Math.max(...Object.values(subTypes), 1)

  // ── Submissions ──
  const filteredSubs = submissions.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(subSearch.toLowerCase()) || s.email?.toLowerCase().includes(subSearch.toLowerCase())
    const matchFilter = subFilter === 'all' || s.status === subFilter
    return matchSearch && matchFilter
  })

  const updateSubStatus = async (id, status) => {
    await supabase.from('contact_submissions').update({ status }).eq('id', id)
    setSubmissions(s => s.map(x => x.id === id ? { ...x, status } : x))
    if (selectedSub?.id === id) setSelectedSub(p => ({ ...p, status }))
    showToast(`Marked as ${status}`)
  }

  const deleteSub = async (id) => {
    if (!confirm('Delete this submission?')) return
    await supabase.from('contact_submissions').delete().eq('id', id)
    setSubmissions(s => s.filter(x => x.id !== id))
    setSelectedSub(null)
    showToast('Deleted')
  }

  const sendReply = (sub) => {
    const subject = encodeURIComponent(`Re: Your Enquiry — Bharat Abroad`)
    const body = encodeURIComponent(`Dear ${sub.name},\n\n${replyText}\n\nWarm regards,\nBharat Abroad Team`)
    window.open(`mailto:${sub.email}?subject=${subject}&body=${body}`)
    updateSubStatus(sub.id, 'contacted')
    setReplyText('')
  }

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Event Type', 'Message', 'Status', 'Date']]
    submissions.forEach(s => rows.push([s.name, s.email, s.phone || '', s.event_type || '', s.message, s.status, new Date(s.created_at).toLocaleString()]))
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'submissions.csv'; a.click()
    showToast('CSV exported!')
  }

  // ── Events ──
  const filteredEvts = events.filter(e => e.title?.toLowerCase().includes(evtSearch.toLowerCase()) || e.category?.toLowerCase().includes(evtSearch.toLowerCase()))

  const updateEvtStatus = async (id, status) => {
    await supabase.from('events').update({ status }).eq('id', id)
    setEvents(e => e.map(x => x.id === id ? { ...x, status } : x))
    showToast(`Event ${status}`)
  }

  const deleteEvt = async (id) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents(e => e.filter(x => x.id !== id))
    showToast('Deleted')
  }

  // ── Portfolio ──
  const [portForm, setPortForm] = useState({ title: '', category: '', location: '', guests: '', date: '', image: '', description: '' })

  const openPortModal = (item) => {
    if (item === 'new') { setPortForm({ title: '', category: '', location: '', guests: '', date: '', image: '', description: '' }); setPortfolioModal('new') }
    else { setPortForm({ ...item }); setPortfolioModal(item) }
  }

  const savePortfolio = async () => {
    if (!portForm.title) { showToast('Title is required', 'error'); return }
    if (portfolioModal === 'new') {
      const { data } = await supabase.from('portfolio').insert([portForm]).select().single()
      if (data) setPortfolio(p => [data, ...p])
      showToast('Portfolio item added!')
    } else {
      await supabase.from('portfolio').update(portForm).eq('id', portfolioModal.id)
      setPortfolio(p => p.map(x => x.id === portfolioModal.id ? { ...x, ...portForm } : x))
      showToast('Portfolio item updated!')
    }
    setPortfolioModal(null)
  }

  const deletePortfolio = async (id) => {
    if (!confirm('Delete this portfolio item?')) return
    await supabase.from('portfolio').delete().eq('id', id)
    setPortfolio(p => p.filter(x => x.id !== id))
    showToast('Deleted')
  }

  // ── Content ──
  const saveContent = async (key) => {
    await supabase.from('site_content').update({ value: contentEdits[key], updated_at: new Date().toISOString() }).eq('key', key)
    setContent(c => ({ ...c, [key]: contentEdits[key] }))
    showToast('Saved!')
  }

  const saveAllContent = async () => {
    for (const key of Object.keys(contentEdits)) {
      if (contentEdits[key] !== content[key]) {
        await supabase.from('site_content').update({ value: contentEdits[key], updated_at: new Date().toISOString() }).eq('key', key)
      }
    }
    setContent({ ...contentEdits })
    showToast('All changes saved!')
  }

  // ── Admin Users ──
  const addUser = async () => {
    if (!newUser.username || !newUser.password) { showToast('Fill in all fields', 'error'); return }
    const { data } = await supabase.from('admin_users').insert([newUser]).select().single()
    if (data) { setAdminUsers(u => [...u, data]); setNewUser({ username: '', password: '', role: 'admin' }); showToast('User added!') }
    else showToast('Username already exists', 'error')
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    await supabase.from('admin_users').delete().eq('id', id)
    setAdminUsers(u => u.filter(x => x.id !== id))
    showToast('User deleted')
  }

  // ── STYLES ──
  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E0E0', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', background: 'white' }
  const btnPrimary = { background: '#8B1A2F', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif' " }
  const btnGhost = { background: '#F7F4F2', color: '#666', border: '1px solid #E8E0E0', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }

  const tabs = [
    { id: 'Dashboard', icon: '📊' },
    { id: 'Submissions', icon: '📬', badge: newSubs },
    { id: 'Events', icon: '🎉', badge: pendingEvts },
    { id: 'Portfolio', icon: '🖼️' },
    { id: 'Content', icon: '✏️' },
    { id: 'Analytics', icon: '📈' },
    { id: 'Users', icon: '👥' },
    { id: 'Settings', icon: '⚙️' },
  ]

  // ── Password change state ──
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwStatus, setPwStatus] = useState('idle')

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      showToast('Please fill in all fields', 'error'); return
    }
    if (pwForm.newPw !== pwForm.confirm) {
      showToast('New passwords do not match', 'error'); return
    }
    if (pwForm.newPw.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return
    }
    // Verify current password
    const { data } = await supabase.from('admin_users')
      .select('*').eq('username', currentUser.username).eq('password', pwForm.current).single()
    if (!data && pwForm.current !== ADMIN_PASSWORD) {
      showToast('Current password is incorrect', 'error'); return
    }
    setPwStatus('loading')
    const { error } = await supabase.from('admin_users')
      .update({ password: pwForm.newPw }).eq('username', currentUser.username)
    if (error) { showToast('Error updating password', 'error'); setPwStatus('idle'); return }
    setPwStatus('success')
    setPwForm({ current: '', newPw: '', confirm: '' })
    showToast('Password changed successfully!')
    setTimeout(() => setPwStatus('idle'), 3000)
  }

  const resetUserPassword = async (userId, username) => {
    const newPw = prompt(`Set new password for "${username}":`)
    if (!newPw) return
    if (newPw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }
    await supabase.from('admin_users').update({ password: newPw }).eq('id', userId)
    showToast(`Password reset for ${username}`)
  }

  // ── LOGIN SCREEN ──
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F0608 0%, #1A0A0F 50%, #0F0608 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 420, background: 'rgba(255,255,255,0.04)', borderRadius: '2rem', padding: '3rem', border: '1px solid rgba(139,26,47,0.3)', backdropFilter: 'blur(20px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #8B1A2F, #C84B6E)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem', boxShadow: '0 8px 32px rgba(139,26,47,0.4)' }}>🔐</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>Admin <span style={{ color: '#E8A020' }}>Portal</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Bharat Abroad Management</p>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" style={{ ...inputStyle, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="••••••••" style={{ ...inputStyle, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
        </div>
        <button onClick={login} style={{ ...btnPrimary, width: '100%', padding: '1rem', fontSize: '0.95rem', borderRadius: 100, boxShadow: '0 4px 20px rgba(139,26,47,0.35)' }}>Sign In →</button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
    </div>
  )

  // ── MAIN DASHBOARD ──
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F2', fontFamily: "'DM Sans', sans-serif", display: 'flex' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── SIDEBAR ── */}
      <div style={{ width: 240, background: '#1A0A0F', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50 }}>
        <div style={{ padding: '1.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#E8A020' }}>Bharat Abroad</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginTop: '0.2rem' }}>Admin Dashboard</div>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          {tabs.map(({ id, icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none',
              cursor: 'pointer', textAlign: 'left', marginBottom: '0.25rem',
              background: activeTab === id ? 'rgba(139,26,47,0.3)' : 'transparent',
              color: activeTab === id ? '#E8A020' : 'rgba(255,255,255,0.45)',
              fontSize: '0.875rem', fontWeight: activeTab === id ? 600 : 400,
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}>
              <span>{icon}</span>
              <span style={{ flex: 1 }}>{id}</span>
              {badge > 0 && <span style={{ background: '#8B1A2F', color: 'white', borderRadius: 100, padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>{badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
            👤 {currentUser?.username} · {currentUser?.role}
          </div>
          <button onClick={() => window.open('/', '_blank')} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: '0.4rem' }}>🌐 View Website</button>
          <button onClick={() => { setAuthed(false); setCurrentUser(null) }} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '0.75rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>🚪 Sign Out</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft: 240, flex: 1, padding: '2rem', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1A0A0F', margin: 0 }}>{activeTab}</h1>
            <p style={{ color: '#888', fontSize: '0.82rem', marginTop: '0.2rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {activeTab === 'Submissions' && <button onClick={exportCSV} style={btnGhost}>⬇ Export CSV</button>}
            {activeTab === 'Portfolio' && <button onClick={() => openPortModal('new')} style={btnPrimary}>+ Add Item</button>}
            {activeTab === 'Content' && <button onClick={saveAllContent} style={btnPrimary}>💾 Save All</button>}
            {activeTab === 'Users' && <button onClick={() => document.getElementById('newUserForm').scrollIntoView({ behavior: 'smooth' })} style={btnPrimary}>+ Add User</button>}
            <button onClick={fetchAll} style={btnGhost}>🔄 Refresh</button>
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '5rem', color: '#888' }}>Loading...</div>}

        {/* ══ DASHBOARD ══ */}
        {!loading && activeTab === 'Dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <StatCard icon="👁️" label="Total Page Views" value={totalViews} color="#4B7FC8" sub={`${todayViews} today`} />
              <StatCard icon="📬" label="New Enquiries" value={newSubs} color="#8B1A2F" sub={`${submissions.length} total`} />
              <StatCard icon="🎉" label="Pending Events" value={pendingEvts} color="#E8A020" sub={`${events.length} total`} />
              <StatCard icon="🖼️" label="Portfolio Items" value={portfolio.length} color="#1A5C3A" sub="Active" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Bar chart - last 7 days */}
              <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #F0E8E8' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', marginBottom: '1.5rem' }}>Page Views — Last 7 Days</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 120 }}>
                  {last7.map(({ label, count }) => (
                    <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#8B1A2F', fontWeight: 600 }}>{count || ''}</span>
                      <div style={{
                        width: '100%', borderRadius: '0.35rem 0.35rem 0 0',
                        background: count > 0 ? 'linear-gradient(to top, #8B1A2F, #C84B6E)' : '#F0E8E8',
                        height: `${Math.max(4, (count / maxViews) * 100)}px`,
                        transition: 'height 0.6s ease',
                      }}></div>
                      <span style={{ fontSize: '0.65rem', color: '#888' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submissions by type */}
              <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #F0E8E8' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', marginBottom: '1.5rem' }}>Enquiries by Type</h3>
                {Object.entries(subTypes).length === 0
                  ? <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No submissions yet</p>
                  : Object.entries(subTypes).map(([type, count]) => (
                    <MiniBar key={type} label={type} value={count} max={maxSubType} color="#8B1A2F" />
                  ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Recent submissions */}
              <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #F0E8E8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F' }}>Recent Enquiries</h3>
                  <button onClick={() => setActiveTab('Submissions')} style={{ background: 'none', border: 'none', color: '#8B1A2F', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                </div>
                {submissions.slice(0, 5).map(sub => (
                  <div key={sub.id} onClick={() => { setActiveTab('Submissions'); setSelectedSub(sub) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #F7F4F2', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A0A0F' }}>{sub.name}</div>
                      <div style={{ color: '#888', fontSize: '0.72rem' }}>{sub.event_type || 'General'} · {new Date(sub.created_at).toLocaleDateString()}</div>
                    </div>
                    <span style={{ background: `${statusColor(sub.status)}18`, color: statusColor(sub.status), borderRadius: 100, padding: '0.2rem 0.65rem', fontSize: '0.65rem', fontWeight: 600 }}>{sub.status}</span>
                  </div>
                ))}
                {submissions.length === 0 && <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No submissions yet</p>}
              </div>

              {/* Recent events */}
              <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #F0E8E8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F' }}>Recent Events</h3>
                  <button onClick={() => setActiveTab('Events')} style={{ background: 'none', border: 'none', color: '#8B1A2F', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                </div>
                {events.slice(0, 5).map(evt => (
                  <div key={evt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #F7F4F2' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A0A0F' }}>{evt.title}</div>
                      <div style={{ color: '#888', fontSize: '0.72rem' }}>{evt.category} · {evt.location}</div>
                    </div>
                    <span style={{ background: `${statusColor(evt.status)}18`, color: statusColor(evt.status), borderRadius: 100, padding: '0.2rem 0.65rem', fontSize: '0.65rem', fontWeight: 600 }}>{evt.status}</span>
                  </div>
                ))}
                {events.length === 0 && <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No events yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* ══ SUBMISSIONS ══ */}
        {!loading && activeTab === 'Submissions' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedSub ? '1fr 400px' : '1fr', gap: '1.25rem' }}>
            <div>
              {/* Search + filter bar */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <input value={subSearch} onChange={e => setSubSearch(e.target.value)} placeholder="🔍 Search by name or email..." style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['all', 'new', 'contacted', 'closed'].map(f => (
                    <button key={f} onClick={() => setSubFilter(f)} style={{
                      padding: '0.6rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                      background: subFilter === f ? '#8B1A2F' : 'white', color: subFilter === f ? 'white' : '#666',
                      border: subFilter === f ? 'none' : '1px solid #E8E0E0',
                    }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F7F4F2' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', margin: 0 }}>
                    Submissions ({filteredSubs.length})
                  </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#FAFAFA' }}>
                        {['Name', 'Email', 'Event Type', 'Date', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubs.map(sub => (
                        <tr key={sub.id}
                          style={{ borderTop: '1px solid #F7F4F2', cursor: 'pointer', background: selectedSub?.id === sub.id ? '#FFF5F7' : 'white' }}
                          onClick={() => setSelectedSub(sub)}
                          onMouseEnter={e => { if (selectedSub?.id !== sub.id) e.currentTarget.style.background = '#FAFAFA' }}
                          onMouseLeave={e => { if (selectedSub?.id !== sub.id) e.currentTarget.style.background = 'white' }}
                        >
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', color: '#1A0A0F', whiteSpace: 'nowrap' }}>{sub.name}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#666' }}>{sub.email}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#666' }}>{sub.event_type || '—'}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap' }}>{new Date(sub.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span style={{ background: `${statusColor(sub.status)}18`, color: statusColor(sub.status), borderRadius: 100, padding: '0.25rem 0.75rem', fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{sub.status}</span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                              <button onClick={() => updateSubStatus(sub.id, 'contacted')} style={{ background: '#1A5C3A18', color: '#1A5C3A', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.68rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>✓ Contacted</button>
                              <button onClick={() => deleteSub(sub.id)} style={{ background: '#8B1A2F18', color: '#8B1A2F', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.68rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredSubs.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No submissions found</div>}
                </div>
              </div>
            </div>

            {/* Detail panel */}
            {selectedSub && (
              <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', padding: '1.5rem', position: 'sticky', top: '2rem', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', margin: 0 }}>Enquiry Details</h3>
                  <button onClick={() => setSelectedSub(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1.1rem' }}>✕</button>
                </div>

                {[['👤 Name', selectedSub.name], ['✉️ Email', selectedSub.email], ['📞 Phone', selectedSub.phone || '—'], ['🎉 Event Type', selectedSub.event_type || '—'], ['📅 Received', new Date(selectedSub.created_at).toLocaleString()]].map(([label, value]) => (
                  <div key={label} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontSize: '0.875rem', color: '#1A0A0F' }}>{value}</div>
                  </div>
                ))}

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>💬 Message</div>
                  <div style={{ background: '#FAFAFA', borderRadius: '0.75rem', padding: '1rem', fontSize: '0.875rem', color: '#1A0A0F', lineHeight: 1.6 }}>{selectedSub.message}</div>
                </div>

                {/* Reply box */}
                <div style={{ marginBottom: '1.5rem', background: '#FFF5F7', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #F0D0D8' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8B1A2F', marginBottom: '0.5rem' }}>✉️ Reply via Email</div>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Type your reply..." style={{ ...inputStyle, resize: 'vertical', marginBottom: '0.75rem' }} />
                  <button onClick={() => sendReply(selectedSub)} style={{ ...btnPrimary, width: '100%', borderRadius: 100 }}>Send Reply ✈</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button onClick={() => updateSubStatus(selectedSub.id, 'contacted')} style={{ ...btnPrimary, background: '#1A5C3A', borderRadius: 100 }}>✓ Mark Contacted</button>
                  <button onClick={() => updateSubStatus(selectedSub.id, 'closed')} style={btnGhost}>Archive</button>
                  <button onClick={() => deleteSub(selectedSub.id)} style={{ ...btnGhost, color: '#8B1A2F', borderColor: '#8B1A2F30' }}>🗑 Delete</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ EVENTS ══ */}
        {!loading && activeTab === 'Events' && (
          <div>
            <input value={evtSearch} onChange={e => setEvtSearch(e.target.value)} placeholder="🔍 Search events..." style={{ ...inputStyle, maxWidth: 400, marginBottom: '1.25rem' }} />
            <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F7F4F2' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', margin: 0 }}>Events ({filteredEvts.length})</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA' }}>
                      {['Title', 'Category', 'Location', 'Date', 'Organizer', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvts.map(evt => (
                      <tr key={evt.id} style={{ borderTop: '1px solid #F7F4F2' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', color: '#1A0A0F', maxWidth: 180 }}>{evt.title}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap' }}>{evt.category}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#666' }}>{evt.location}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap' }}>{evt.date}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#666' }}>{evt.organizer}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ background: `${statusColor(evt.status)}18`, color: statusColor(evt.status), borderRadius: 100, padding: '0.25rem 0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>{evt.status}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => updateEvtStatus(evt.id, 'approved')} style={{ background: '#1A5C3A18', color: '#1A5C3A', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.68rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>✓ Approve</button>
                            <button onClick={() => updateEvtStatus(evt.id, 'rejected')} style={{ background: '#E8A02018', color: '#996800', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.68rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>✕ Reject</button>
                            <button onClick={() => deleteEvt(evt.id)} style={{ background: '#8B1A2F18', color: '#8B1A2F', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.68rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEvts.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No events found</div>}
              </div>
            </div>
          </div>
        )}

        {/* ══ PORTFOLIO ══ */}
        {!loading && activeTab === 'Portfolio' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {portfolio.map(item => (
                <div key={item.id} style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: '#F7F4F2' }}>
                    {item.image && <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openPortModal(item)} style={{ background: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>✏️</button>
                      <button onClick={() => deletePortfolio(item.id)} style={{ background: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>🗑</button>
                    </div>
                    {item.category && (
                      <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: '#8B1A2F', color: 'white', padding: '0.2rem 0.65rem', borderRadius: 100, fontSize: '0.65rem', fontWeight: 600 }}>{item.category}</div>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 600, color: '#1A0A0F', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: '#888', flexWrap: 'wrap' }}>
                      {item.location && <span>📍 {item.location}</span>}
                      {item.guests && <span>👥 {item.guests}</span>}
                      {item.date && <span>📅 {item.date}</span>}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new card */}
              <div onClick={() => openPortModal('new')} style={{
                background: 'white', borderRadius: '1.25rem', border: '2px dashed #E8E0E0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: 280, cursor: 'pointer', color: '#aaa', gap: '0.5rem',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A2F'; e.currentTarget.style.color = '#8B1A2F' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E0E0'; e.currentTarget.style.color = '#aaa' }}
              >
                <span style={{ fontSize: '2.5rem' }}>+</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Add Portfolio Item</span>
              </div>
            </div>

            {/* Portfolio Modal */}
            {portfolioModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#1A0A0F', margin: 0 }}>
                      {portfolioModal === 'new' ? 'Add Portfolio Item' : 'Edit Portfolio Item'}
                    </h3>
                    <button onClick={() => setPortfolioModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#888' }}>✕</button>
                  </div>

                  <ImageUploader current={portForm.image} onUpload={url => setPortForm(f => ({ ...f, image: url }))} label="Event Image" />

                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[['Title *', 'title', 'text'], ['Category', 'category', 'text'], ['Location', 'location', 'text'], ['Guests', 'guests', 'text'], ['Date', 'date', 'text']].map(([label, key, type]) => (
                      <div key={key} style={key === 'title' ? { gridColumn: '1 / -1' } : {}}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</label>
                        <input type={type} value={portForm[key]} onChange={e => setPortForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Description</label>
                      <textarea value={portForm.description} onChange={e => setPortForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button onClick={savePortfolio} style={{ ...btnPrimary, flex: 1, borderRadius: 100 }}>
                      {portfolioModal === 'new' ? '+ Add Item' : '💾 Save Changes'}
                    </button>
                    <button onClick={() => setPortfolioModal(null)} style={{ ...btnGhost, borderRadius: 100 }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CONTENT EDITOR ══ */}
        {!loading && activeTab === 'Content' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Text content */}
            <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', marginBottom: '1.5rem' }}>📝 Text Content</h3>
              {[
                ['hero_title', 'Hero Title'],
                ['hero_subtitle', 'Hero Subtitle'],
                ['about_title', 'About Title'],
                ['about_text', 'About Description'],
                ['contact_phone', 'Phone Number'],
                ['contact_email', 'Email Address'],
                ['contact_address', 'Office Address'],
              ].map(([key, label]) => (
                <div key={key} style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {key.includes('text') || key.includes('subtitle') || key.includes('address') ? (
                      <textarea
                        value={contentEdits[key] || ''}
                        onChange={e => setContentEdits(c => ({ ...c, [key]: e.target.value }))}
                        rows={3}
                        style={{ ...inputStyle, flex: 1, resize: 'vertical' }}
                      />
                    ) : (
                      <input
                        value={contentEdits[key] || ''}
                        onChange={e => setContentEdits(c => ({ ...c, [key]: e.target.value }))}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    )}
                    <button onClick={() => saveContent(key)} style={{ ...btnPrimary, padding: '0.5rem 0.875rem', borderRadius: '0.75rem', flexShrink: 0 }}>💾</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Image + Social content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', marginBottom: '1.5rem' }}>🖼️ Images</h3>
                {[
                  ['hero_image', 'Hero Background Image'],
                  ['about_image1', 'About Section Image 1'],
                  ['about_image2', 'About Section Image 2'],
                ].map(([key, label]) => (
                  <div key={key} style={{ marginBottom: '1.5rem' }}>
                    <ImageUploader
                      current={contentEdits[key]}
                      label={label}
                      onUpload={url => {
                        setContentEdits(c => ({ ...c, [key]: url }))
                        supabase.from('site_content').update({ value: url }).eq('key', key).then(() => showToast(`${label} updated!`))
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', marginBottom: '1.5rem' }}>🔗 Social Media Links</h3>
                {[
                  ['social_instagram', '📸 Instagram URL'],
                  ['social_facebook', '📘 Facebook URL'],
                  ['social_twitter', '🐦 Twitter URL'],
                  ['social_youtube', '▶️ YouTube URL'],
                ].map(([key, label]) => (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input value={contentEdits[key] || ''} onChange={e => setContentEdits(c => ({ ...c, [key]: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                      <button onClick={() => saveContent(key)} style={{ ...btnPrimary, padding: '0.5rem 0.875rem', borderRadius: '0.75rem', flexShrink: 0 }}>💾</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {!loading && activeTab === 'Analytics' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <StatCard icon="👁️" label="Total Page Views" value={totalViews} color="#4B7FC8" />
              <StatCard icon="📅" label="Today's Views" value={todayViews} color="#1A5C3A" />
              <StatCard icon="📬" label="Form Submissions" value={submissions.length} color="#8B1A2F" />
            </div>

            {/* Bar chart */}
            <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #F0E8E8', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', marginBottom: '1.5rem' }}>📊 Page Views — Last 7 Days</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: 180, paddingBottom: '1rem', borderBottom: '1px solid #F0E8E8' }}>
                {last7.map(({ label, count }) => (
                  <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#8B1A2F', fontWeight: 700 }}>{count || ''}</span>
                    <div style={{
                      width: '100%', borderRadius: '0.5rem 0.5rem 0 0',
                      background: count > 0 ? 'linear-gradient(to top, #8B1A2F, #C84B6E)' : '#F0E8E8',
                      height: `${Math.max(6, (count / maxViews) * 150)}px`,
                      transition: 'height 0.8s ease',
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity table */}
            <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F7F4F2' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', margin: 0 }}>Recent Activity</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFAFA' }}>
                    {['Event', 'Page', 'Time'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.slice(0, 50).map(a => (
                    <tr key={a.id} style={{ borderTop: '1px solid #F7F4F2' }}>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.82rem', color: '#1A0A0F', fontWeight: 500 }}>{a.event}</td>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.82rem', color: '#666' }}>{a.page}</td>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: '#888' }}>{new Date(a.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analytics.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No analytics data yet</div>}
            </div>
          </div>
        )}

        {/* ══ USERS ══ */}
        {!loading && activeTab === 'Users' && (
          <div>
            {/* Access restriction banner for non-superadmin */}
            {currentUser?.role !== 'superadmin' && (
              <div style={{
                background: 'linear-gradient(135deg, #FFF8E8, #FFF3D0)',
                border: '1px solid rgba(232,160,32,0.3)', borderRadius: '1rem',
                padding: '1rem 1.5rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔒</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#996800' }}>View Only Access</div>
                  <div style={{ fontSize: '0.78rem', color: '#aa8800', marginTop: '0.2rem' }}>
                    Only Super Admins can add, remove users or reset passwords. Contact a Super Admin to make changes.
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: currentUser?.role === 'superadmin' ? '1fr 380px' : '1fr', gap: '1.25rem' }}>
              <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F7F4F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', margin: 0 }}>Admin Users ({adminUsers.length})</h3>
                  {currentUser?.role === 'superadmin' && (
                    <span style={{ background: '#1A5C3A18', color: '#1A5C3A', borderRadius: 100, padding: '0.2rem 0.75rem', fontSize: '0.7rem', fontWeight: 600 }}>⚡ Super Admin View</span>
                  )}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA' }}>
                      {[
                        'Username',
                        'Role',
                        'Created',
                        ...(currentUser?.role === 'superadmin' ? ['Actions'] : [])
                      ].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(user => (
                      <tr key={user.id} style={{ borderTop: '1px solid #F7F4F2' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', color: '#1A0A0F' }}>
                          👤 {user.username}
                          {user.username === currentUser?.username && (
                            <span style={{ marginLeft: '0.5rem', background: '#4B7FC818', color: '#4B7FC8', borderRadius: 100, padding: '0.1rem 0.5rem', fontSize: '0.62rem', fontWeight: 600 }}>You</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ background: `${statusColor(user.role)}18`, color: statusColor(user.role), borderRadius: 100, padding: '0.25rem 0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>{user.role}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#888' }}>{new Date(user.created_at).toLocaleDateString()}</td>

                        {/* Actions column — superadmin only */}
                        {currentUser?.role === 'superadmin' && (
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => resetUserPassword(user.id, user.username)}
                                style={{ background: '#4B7FC818', color: '#4B7FC8', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                              >🔑 Reset PW</button>
                              {user.username !== currentUser?.username && (
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  style={{ background: '#8B1A2F18', color: '#8B1A2F', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                                >🗑 Remove</button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add user form — superadmin only */}
              {currentUser?.role === 'superadmin' && (
                <div id="newUserForm" style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', padding: '1.5rem', height: 'fit-content' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', marginBottom: '1.5rem' }}>➕ Add New Admin</h3>
                  {[['Username', 'username', 'text'], ['Password', 'password', 'password']].map(([label, key, type]) => (
                    <div key={key} style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</label>
                      <input type={type} value={newUser[key]} onChange={e => setNewUser(u => ({ ...u, [key]: e.target.value }))} style={inputStyle} />
                    </div>
                  ))}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Role</label>
                    <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                  <button onClick={addUser} style={{ ...btnPrimary, width: '100%', borderRadius: 100 }}>Add Admin User</button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ══ SETTINGS ══ */}
        {!loading && activeTab === 'Settings' && (
          <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Change own password */}
            <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 40, height: 40, background: '#8B1A2F18', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔐</div>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', margin: 0 }}>Change Your Password</h3>
                  <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.2rem' }}>Logged in as <strong>{currentUser?.username}</strong></p>
                </div>
              </div>
              {[
                ['Current Password', 'current', 'Your current password'],
                ['New Password', 'newPw', 'At least 6 characters'],
                ['Confirm New Password', 'confirm', 'Repeat new password'],
              ].map(([label, key, placeholder]) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</label>
                  <input
                    type="password"
                    placeholder={placeholder}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B1A2F'}
                    onBlur={e => e.target.style.borderColor = '#E8E0E0'}
                  />
                </div>
              ))}
              {pwStatus === 'success' && (
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1rem', color: '#2E7D32', fontSize: '0.85rem' }}>
                  ✓ Password changed successfully!
                </div>
              )}
              <button onClick={changePassword} disabled={pwStatus === 'loading'} style={{
                ...btnPrimary, borderRadius: 100, width: '100%', padding: '0.875rem',
                opacity: pwStatus === 'loading' ? 0.7 : 1,
                cursor: pwStatus === 'loading' ? 'not-allowed' : 'pointer',
              }}>
                {pwStatus === 'loading' ? 'Updating...' : '🔐 Update Password'}
              </button>
            </div>

            {/* Account info */}
            <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #F0E8E8', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 40, height: 40, background: '#4B7FC818', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1A0A0F', margin: 0 }}>Account Info</h3>
              </div>
              {[['Username', currentUser?.username], ['Role', currentUser?.role], ['Session', 'Active']].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid #F7F4F2' }}>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A0A0F' }}>
                    {label === 'Role'
                      ? <span style={{ background: `${statusColor(value)}18`, color: statusColor(value), borderRadius: 100, padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>{value}</span>
                      : label === 'Session'
                        ? <span style={{ background: '#1A5C3A18', color: '#1A5C3A', borderRadius: 100, padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>● Active</span>
                        : value}
                  </span>
                </div>
              ))}
              <button onClick={() => { setAuthed(false); setCurrentUser(null) }} style={{ ...btnGhost, width: '100%', marginTop: '1.25rem', borderRadius: 100, color: '#8B1A2F', borderColor: '#8B1A2F30' }}>
                🚪 Sign Out
              </button>
            </div>

            {/* Quick tips */}
            <div style={{ background: 'linear-gradient(135deg, #1A0A0F, #2A1020)', borderRadius: '1.25rem', padding: '2rem' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#E8A020', marginBottom: '1rem' }}>💡 Quick Tips</h3>
              {[
                ['📬 Submissions', 'Click any row to open the detail panel. Use the reply box to email clients directly.'],
                ['🖼️ Portfolio', 'Upload images directly from your computer or paste any image URL.'],
                ['✏️ Content', 'Changes save instantly. Hit 💾 next to each field or "Save All" at the top.'],
                ['👥 Users', 'Use 🔑 Reset PW to change any user\'s password from the Users tab.'],
              ].map(([title, tip]) => (
                <div key={title} style={{ marginBottom: '1rem' }}>
                  <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem' }}>{title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.5 }}>{tip}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  )
}
