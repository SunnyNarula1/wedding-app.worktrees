import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Copy, ExternalLink, Heart, MapPin, Menu, Pause, Play, Send, Share2, X } from 'lucide-react'
import { weddingData as data } from './data/weddingData'
import './App.css'
import './event-layout.css'
import './gallery-responsive.css'
import './header-blessing.css'

function Heading({ eyebrow, title, text }) {
  return <div className="heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>
}

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header>
      <a className="logo" href="#top">S<span>&</span>S</a>
      <div className="header-blessing"><span>|| SHRI GANESHAYA NAMAH ||</span></div>
      <nav className={open ? 'open' : ''}>
        {[['Story', '#story'], ['Events', '#events'], ['Gallery', '#gallery']].map(([name, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{name}</a>
        ))}
      </nav>
      <button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X /> : <Menu />}
      </button>
    </header>
  )
}

function Countdown() {
  const [left, setLeft] = useState(null)

  useEffect(() => {
    if (!data.weddingDate) return undefined

    const tick = () => setLeft(Math.max(0, new Date(data.weddingDate) - Date.now()))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  const values = left === null
    ? ['--', '--', '--', '--']
    : [
        Math.floor(left / 86400000),
        Math.floor(left / 3600000) % 24,
        Math.floor(left / 60000) % 60,
        Math.floor(left / 1000) % 60,
      ].map((n) => String(n).padStart(2, '0'))

  return (
    <section className="countdown">
      <div>
        <span className="eyebrow light">The celebration begins in</span>
        <h2>Counting every moment</h2>
      </div>
      <div className="timer">
        {values.map((value, i) => (
          <div key={i}><b>{value}</b><span>{['Days', 'Hours', 'Minutes', 'Seconds'][i]}</span></div>
        ))}
      </div>
      {!data.weddingDate && <small>Wedding date to be announced</small>}
    </section>
  )
}

function Events() {
  return (
    <section className="section" id="events">
      <Heading eyebrow="Save the moments" title="A celebration in chapters" text="Join us as we gather for each beautiful tradition." />
      <div className="events">
        {data.events.map((event, i) => (
          <article className={i === 6 ? 'featured event-card' : 'event-card'} key={event.name}>
            {event.image && (
              <div className="event-image">
                <img src={event.image} alt={event.name} />
              </div>
            )}
            <div className="event-content">
              <span className="index">0{i + 1}</span>
              <span className="event-mark">✦</span>
              <h3>{event.name}</h3>
              <em className="event-tradition">{event.tradition}</em>
              <p><CalendarDays />{event.date}</p>
              <p><Clock3 />{event.day} · {event.time}</p>
              <p><MapPin />{event.venue}<br /><span>{event.address}</span></p>
              <a href={event.mapsUrl} target="_blank" rel="noreferrer">View on map <ArrowUpRight size={14} /></a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Gallery() {
  const [active, setActive] = useState(null)

  const move = (step) => setActive((active + step + data.gallery.length) % data.gallery.length)

  return (
    <section className="section" id="gallery">
      <Heading eyebrow="A glimpse of us" title="Frames of forever" text="A few little memories from the journey so far." />
      <div className="gallery">
        {data.gallery.map((image, i) => (
          <button className={image.size} key={image.src} onClick={() => setActive(i)}>
            <img src={image.src} alt={image.alt} loading="lazy" />
            <span>{image.category}</span>
          </button>
        ))}
      </div>
      {active !== null && (
        <div className="lightbox">
          <button onClick={() => setActive(null)} aria-label="Close"><X /></button>
          <button className="prev" onClick={() => move(-1)} aria-label="Previous"><ChevronLeft /></button>
          <img src={data.gallery[active].src} alt={data.gallery[active].alt} />
          <button className="next" onClick={() => move(1)} aria-label="Next"><ChevronRight /></button>
        </div>
      )}
    </section>
  )
}

function App() {
  const audioRef = useRef(null)
  const [musicOn, setMusicOn] = useState(false)

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

  return (
    <div id="top">
      <Header />
      <main>
        <audio ref={audioRef} src={data.musicUrl} loop preload="auto" autoPlay playsInline />

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">{data.invitationLabel}</span>
            <h1>Sunny <i>&</i><br />Shiwangi</h1>
            <p>{data.description}</p>
            <a href="#events">Explore the invitation <ArrowDown size={16} /></a>
          </div>
          <div className="hero-photo">
            <img src={data.heroImage.src} alt={data.heroImage.alt} />
            <span>with love<br /><b>2026</b></span>
          </div>
        </section>

        <section className="section couple">
          <div className="couple-photo">
            <img src={data.gallery[2].src} alt="Bride in traditional attire" />
            <strong>Sunny <i>&</i> Shiwangi</strong>
          </div>
          <div>
            <span className="eyebrow">The couple</span>
            <h2>Made for<br /><em>each other.</em></h2>
            <p>{data.intro}</p>
            <div className="signature">S <span>&</span> S</div>
          </div>
        </section>

        <Countdown />
        <Events />

        <section className="section story" id="story">
          <Heading eyebrow="Our story" title="And so it begins" text="The sweetest chapters are the ones we write together." />
          <div>
            {data.story.map((item, i) => (
              <article key={item.title}>
                <b>0{i + 1}</b>
                <div>
                  <span className="eyebrow">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <Gallery />

        <section className="family">
          <Heart size={20} fill="currentColor" />
          <p>{data.familyMessage}</p>
          <span className="eyebrow light">With love, Sunny and Shiwangi</span>
        </section>

        <section className="section venue">
          <div className="map"><MapPin /></div>
          <div>
            <span className="eyebrow">The venue</span>
            <h2>Meet us<br /><em>there.</em></h2>
            <p>{data.venue.name}</p>
            <address>{data.venue.address}</address>
            <a className="button" href={data.venue.mapsUrl} target="_blank" rel="noreferrer">Get directions <ExternalLink size={15} /></a>
          </div>
        </section>

      </main>
    </div>
  )
}

export default App
