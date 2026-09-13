import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Copy, ExternalLink, Heart, MapPin, Menu, Pause, Play, Send, Share2, X } from 'lucide-react'
import { weddingData as data } from './data/weddingData'
import './App.css'
import './header-blessing.css'

const AUTH_ROLE_KEY = 'wedding-role'
const AUTHORIZED_SHARE_ROLES = new Set(['admin', 'coadmin'])
const AUTH_CREDENTIALS = {
  admin: 'admin123',
  coadmin: 'coadmin123',
}

function Heading({ eyebrow, title, text }) { return <div className="heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div> }
function Header({ canShareInvitation }) { const [open, setOpen] = useState(false); return <header><a className="logo" href="#top">S<span>&</span>S</a><div className="header-blessing"><span>|| SHRI GANESHAYA NAMAH ||</span></div><nav className={open ? 'open' : ''}>{[['Story', '#story'], ['Events', '#events'], ['Gallery', '#gallery'], ['RSVP', '#rsvp']].map(([name, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{name}</a>)}{canShareInvitation && <a className="nav-share" href="#share">Share invitation <ArrowUpRight size={14} /></a>}</nav><button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button></header> }
function Countdown() { const [left, setLeft] = useState(null); useEffect(() => { if (!data.weddingDate) return undefined; const tick = () => setLeft(Math.max(0, new Date(data.weddingDate) - Date.now())); tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer) }, []); const values = left === null ? ['--', '--', '--', '--'] : [Math.floor(left / 86400000), Math.floor(left / 3600000) % 24, Math.floor(left / 60000) % 60, Math.floor(left / 1000) % 60].map((n) => String(n).padStart(2, '0')); return <section className="countdown"><div><span className="eyebrow light">The celebration begins in</span><h2>Counting every moment</h2></div><div className="timer">{values.map((value, i) => <div key={i}><b>{value}</b><span>{['Days', 'Hours', 'Minutes', 'Seconds'][i]}</span></div>)}</div>{!data.weddingDate && <small>Wedding date to be announced</small>}</section> }
function Events() { return <section className="section" id="events"><Heading eyebrow="Save the moments" title="A celebration in chapters" text="Join us as we gather for each beautiful tradition." /><div className="events">{data.events.map((event, i) => <article className={i === 6 ? 'featured' : ''} key={event.name}><span className="index">0{i + 1}</span><span className="event-mark">âœ¦</span><h3>{event.name}</h3><em className="event-tradition">{event.tradition}</em><p><CalendarDays />{event.date}</p><p><Clock3 />{event.day} Â· {event.time}</p><p><MapPin />{event.venue}<br /><span>{event.address}</span></p><a href={event.mapsUrl} target="_blank" rel="noreferrer">View on map <ArrowUpRight size={14} /></a></article>)}</div></section> }
function Gallery() { const [active, setActive] = useState(null); const move = (step) => setActive((active + step + data.gallery.length) % data.gallery.length); return <section className="section" id="gallery"><Heading eyebrow="A glimpse of us" title="Frames of forever" text="A few little memories from the journey so far." /><div className="gallery">{data.gallery.map((image, i) => <button className={image.size} key={image.src} onClick={() => setActive(i)}><img src={image.src} alt={image.alt} loading="lazy" /><span>{image.category}</span></button>)}</div>{active !== null && <div className="lightbox"><button onClick={() => setActive(null)} aria-label="Close"><X /></button><button className="prev" onClick={() => move(-1)} aria-label="Previous"><ChevronLeft /></button><img src={data.gallery[active].src} alt={data.gallery[active].alt} /><button className="next" onClick={() => move(1)} aria-label="Next"><ChevronRight /></button></div>}</section> }
function Share({ onInvitationSent }) { const [copied, setCopied] = useState(false); const text = "You're invited to Sunny Narula & Shiwangi Khanduja wedding celebration."; const invitationUrl = (() => { const url = new URL(window.location.href); url.searchParams.set('view', 'guest'); url.hash = 'top'; return url.toString() })(); const copy = async () => { await navigator.clipboard?.writeText(invitationUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); onInvitationSent() }; const share = async () => navigator.share ? navigator.share({ title: 'Sunny Narula & ShiwangiKhanduja | Wedding Invitation', text, url: invitationUrl }).then(onInvitationSent) : copy(); return <section className="share" id="share"><div><span className="eyebrow light">Pass it on</span><h2>Bring your favourite people.</h2><p>Send the invitation to family and friends.</p></div><div className="share-buttons"><a href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + invitationUrl)}`} target="_blank" rel="noreferrer" onClick={onInvitationSent}><Send size={17} /> Share on WhatsApp</a><button onClick={copy}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Link copied' : 'Copy invitation link'}</button><button onClick={share}><Share2 size={17} /> Share invitation</button></div></section> }
function App() {
  const audioRef = useRef(null)
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [musicOn, setMusicOn] = useState(false)
  const [guestForm, setGuestForm] = useState({
    name: '',
    guests: '1',
    response: 'Joyfully attending',
    message: '',
  })
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [login, setLogin] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginOpen, setLoginOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    if (new URLSearchParams(window.location.search).get('view') === 'guest') return false
    return !localStorage.getItem(AUTH_ROLE_KEY)
  })
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return 'guest'
    if (new URLSearchParams(window.location.search).get('view') === 'guest') return 'guest'
    return localStorage.getItem(AUTH_ROLE_KEY) || 'guest'
  })

  const sheetEndpoint = import.meta.env.VITE_GOOGLE_SHEET_WEB_APP_URL || ''

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_ROLE_KEY, role)
    }
  }, [role])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#share' && !AUTHORIZED_SHARE_ROLES.has(role)) {
      setLoginOpen(true)
    }
  }, [role])

  const canShareInvitation = AUTHORIZED_SHARE_ROLES.has(role)

  const playMusic = async () => {
    if (!data.musicUrl) return

    const audio = audioRef.current
    if (!audio) return

    try {
      audio.volume = 0.5
      await audio.play()
      setMusicOn(true)
    } catch (error) {
      setMusicOn(false)
    }
  }

  const toggleMusic = async () => {
    if (!data.musicUrl) return

    const audio = audioRef.current
    if (!audio) return

    if (musicOn) {
      audio.pause()
      setMusicOn(false)
      return
    }

    await playMusic()
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    const startMusic = () => {
      void playMusic()
      window.removeEventListener('pointerdown', startMusic, true)
      window.removeEventListener('touchstart', startMusic, true)
      window.removeEventListener('click', startMusic, true)
      window.removeEventListener('keydown', startMusic, true)
    }

    const retryWhenReady = () => {
      void playMusic()
    }

    audio.addEventListener('canplay', retryWhenReady)
    window.addEventListener('pointerdown', startMusic, true)
    window.addEventListener('touchstart', startMusic, { capture: true, passive: true })
    window.addEventListener('click', startMusic, true)
    window.addEventListener('keydown', startMusic, true)
    void playMusic()

    return () => {
      audio.removeEventListener('canplay', retryWhenReady)
      window.removeEventListener('pointerdown', startMusic, true)
      window.removeEventListener('touchstart', startMusic, true)
      window.removeEventListener('click', startMusic, true)
      window.removeEventListener('keydown', startMusic, true)
    }
  }, [])

  const handleInvitationSent = () => {
    setRole('guest')
    setLoginOpen(false)
    if (typeof window !== 'undefined') {
      window.location.hash = '#top'
    }
  }

  const handleLogin = () => {
    const requestedRole = login.username.trim().toLowerCase()
    const password = login.password

    if (!requestedRole || !AUTH_CREDENTIALS[requestedRole]) {
      setLoginError('Please enter a valid admin username.')
      return
    }

    if (AUTH_CREDENTIALS[requestedRole] !== password) {
      setLoginError('Incorrect password. Please try again.')
      return
    }

    setRole(requestedRole)
    setLogin({ username: '', password: '' })
    setLoginError('')
    setLoginOpen(false)
    if (typeof window !== 'undefined') {
      window.location.hash = '#share'
    }
  }

  const handleGuestUpdate = (field, value) => {
    setGuestForm((current) => ({ ...current, [field]: value }))
    if (submitError) setSubmitError('')
  }

  const handleRsvpSubmit = async (event) => {
    event.preventDefault()

    if (!sheetEndpoint) {
      setSubmitError('Google Sheet is not configured yet. Add your Apps Script URL to VITE_GOOGLE_SHEET_WEB_APP_URL and redeploy.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch(sheetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...guestForm,
          timestamp: new Date().toISOString(),
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok || payload.status !== 'success') {
        throw new Error(payload.message || 'Unable to save RSVP. Please try again.')
      }

      setName(guestForm.name)
      setGuestForm({ name: '', guests: '1', response: 'Joyfully attending', message: '' })
      setSent(true)
    } catch (error) {
      setSubmitError(error.message || 'Something went wrong while sending the RSVP.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return <div id="top"><Header canShareInvitation={canShareInvitation} /><main><audio ref={audioRef} src={data.musicUrl} loop preload="auto" autoPlay playsInline /><section className="hero"><div className="hero-copy"><span className="eyebrow">{data.invitationLabel}</span><h1>Sunny <i>&</i><br />Shiwangi</h1><p>{data.description}</p><a href="#events">Explore the invitation <ArrowDown size={16} /></a></div><div className="hero-photo"><img src={data.heroImage.src} alt={data.heroImage.alt} /><span>with love<br /><b>2026</b></span></div></section><section className="section couple"><div className="couple-photo"><img src={data.gallery[2].src} alt="Bride in traditional attire" /><strong>Sunny <i>&</i> Shiwangi</strong></div><div><span className="eyebrow">The couple</span><h2>Made for<br /><em>each other.</em></h2><p>{data.intro}</p><div className="signature">S <span>&</span> S</div></div></section><Countdown /><Events /><section className="section story" id="story"><Heading eyebrow="Our story" title="And so it begins" text="The sweetest chapters are the ones we write together." /><div>{data.story.map((item, i) => <article key={item.title}><b>0{i + 1}</b><div><span className="eyebrow">{item.year}</span><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></section><Gallery /><section className="family"><Heart size={20} fill="currentColor" /><p>{data.familyMessage}</p><span className="eyebrow light">With love, Sunny and Shiwangi</span></section><section className="section venue"><div className="map"><MapPin /></div><div><span className="eyebrow">The venue</span><h2>Meet us<br /><em>there.</em></h2><p>{data.venue.name}</p><address>{data.venue.address}</address><a className="button" href={data.venue.mapsUrl} target="_blank" rel="noreferrer">Get directions <ExternalLink size={15} /></a></div></section><section className="section rsvp" id="rsvp"><div><span className="eyebrow">Kindly reply</span><h2>Will you join<br /><em>our celebration?</em></h2><p>Let us know if we can count you in. Your presence would mean the world to us.</p></div>{sent ? <div className="success"><Check /><h3>Thank you, {name || 'dear friend'}.</h3><p>Your RSVP has been noted.</p></div> : <form onSubmit={handleRsvpSubmit}><label>Your name<input required value={guestForm.name} onChange={(event) => handleGuestUpdate('name', event.target.value)} placeholder="e.g. Priya Sharma" /></label><label>Guests<select value={guestForm.guests} onChange={(event) => handleGuestUpdate('guests', event.target.value)}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label><label>Response<select value={guestForm.response} onChange={(event) => handleGuestUpdate('response', event.target.value)}><option>Joyfully attending</option><option>Unable to attend</option></select></label><label>Message <span>(optional)</span><textarea value={guestForm.message} onChange={(event) => handleGuestUpdate('message', event.target.value)} placeholder="A note for the couple" /></label>{submitError && <span className="submit-error">{submitError}</span>}<button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send RSVP'} <Send size={15} /></button></form>}</section>{canShareInvitation && <Share onInvitationSent={handleInvitationSent} />}</main>{loginOpen && !canShareInvitation && <div className="auth-modal"><div className="auth-card"><span className="eyebrow">Private access</span><h3>Invitation management</h3><p>Only admin and co-admin can access the share invitation tools.</p><label>Username<input value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} placeholder="admin or coadmin" /></label><label>Password<input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} placeholder="Enter password" /></label>{loginError && <small className="auth-error">{loginError}</small>}<div className="auth-actions"><button type="button" className="button muted" onClick={() => { setLoginOpen(false); setLoginError(''); setLogin({ username: '', password: '' }); }}>Cancel</button><button type="button" className="button" onClick={handleLogin}>Login</button></div></div></div>}<footer><a className="logo" href="#top">S<span>&</span>S</a><p>Made with love for our favourite people.</p></footer></div> }
export default App

