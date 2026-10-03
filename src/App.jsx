import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, Clock3, MapPin, Minus, Plus, Search, Ticket, X } from 'lucide-react'
import './orbit.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const categories = ['All events', 'Music', 'Arts & culture', 'Food & drink', 'Nightlife']
const demoEvents = [
  { _id: 'demo-1', title: 'Neon Fields Festival', category: 'Music', date: '2026-10-24', time: '4:00 PM', venue: 'Brooklyn Mirage', city: 'Brooklyn, NY', price: 89, remainingTickets: 184, image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85', description: 'One open-air stage, a skyline full of possibility, and a lineup built for the last golden hour of the season.', tag: 'Selling fast' },
  { _id: 'demo-2', title: 'Sunday Table: Harvest', category: 'Food & drink', date: '2026-10-25', time: '1:00 PM', venue: 'The Greenhouse', city: 'Brooklyn, NY', price: 64, remainingTickets: 28, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85', description: 'A long-table lunch celebrating the farms, growers, and neighborhood kitchens that make this city taste like home.', tag: 'Small gathering' },
  { _id: 'demo-3', title: 'Soft Focus: Opening Night', category: 'Arts & culture', date: '2026-10-29', time: '6:30 PM', venue: 'The New Museum', city: 'New York, NY', price: 32, remainingTickets: 63, image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=85', description: 'Step into an after-hours exhibition of new voices, good music, and the kind of conversations that keep going.', tag: 'New' },
  { _id: 'demo-4', title: 'After Hours at Elsewhere', category: 'Nightlife', date: '2026-10-30', time: '10:00 PM', venue: 'Elsewhere', city: 'Brooklyn, NY', price: 24, remainingTickets: 91, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1000&q=85', description: 'Three rooms, one very good reason not to check the time. Local selectors take over until the lights come up.', tag: 'Doors at 10' },
  { _id: 'demo-5', title: 'The Listening Room', category: 'Music', date: '2026-11-05', time: '8:00 PM', venue: 'Public Records', city: 'Brooklyn, NY', price: 38, remainingTickets: 47, image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=85', description: 'An intimate live set with the phones away and the room turned all the way up.', tag: 'Almost gone' },
  { _id: 'demo-6', title: 'Clay After Dark', category: 'Arts & culture', date: '2026-11-08', time: '7:00 PM', venue: 'Shape House Studio', city: 'Queens, NY', price: 52, remainingTickets: 19, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85', description: 'Get your hands messy at a relaxed wheel-throwing workshop, with a studio playlist and something cold to drink.', tag: 'Workshop' },
]

const formatDate = (date) => {
  const value = new Date(`${date}T12:00:00`)
  return { month: new Intl.DateTimeFormat('en', { month: 'short' }).format(value).toUpperCase(), day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(value), full: new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(value) }
}

function readTickets() {
  try { return JSON.parse(localStorage.getItem('orbit-tickets') || '[]') } catch { return [] }
}

function App() {
  const [events, setEvents] = useState(demoEvents)
  const [category, setCategory] = useState('All events')
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('Everywhere')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tickets, setTickets] = useState(readTickets)
  const [showTickets, setShowTickets] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/events`).then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { if (data.events?.length) setEvents(data.events) }).catch(() => {})
  }, [])

  const filteredEvents = useMemo(() => events.filter((event) => {
    const matchesCategory = category === 'All events' || event.category === category
    const matchesCity = city === 'Everywhere' || event.city.toLowerCase().includes(city.toLowerCase())
    const term = search.trim().toLowerCase()
    const matchesSearch = !term || [event.title, event.venue, event.city, event.category].some((value) => value.toLowerCase().includes(term))
    return matchesCategory && matchesCity && matchesSearch
  }), [category, city, events, search])

  function openEvent(event) {
    setSelectedEvent(event)
    setQuantity(1)
    setConfirmation(null)
    setBookingError('')
  }

  async function reserveTickets(event) {
    if (!name.trim() || !email.trim()) return
    const payload = { eventId: event._id, name: name.trim(), email: email.trim(), quantity }
    let booking
    try {
      const response = await fetch(`${API_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) { setBookingError(result.message || 'Could not reserve these tickets.'); return }
      booking = result.booking
      setEvents((current) => current.map((item) => item._id === event._id ? { ...item, remainingTickets: Math.max(0, item.remainingTickets - quantity) } : item))
    } catch {
      booking = { _id: `ORB-${Date.now().toString(36).toUpperCase()}`, eventTitle: event.title, eventDate: event.date, venue: event.venue, city: event.city, total: event.price * quantity }
    }
    const saved = { ...booking, eventTitle: booking.eventTitle || event.title, eventDate: booking.eventDate || event.date, venue: booking.venue || event.venue, city: booking.city || event.city, total: booking.total ?? event.price * quantity, quantity }
    const updated = [saved, ...readTickets()]
    localStorage.setItem('orbit-tickets', JSON.stringify(updated))
    setTickets(updated)
    setConfirmation(saved)
  }

  const featured = events[0] || demoEvents[0]

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Orbit home"><span className="brand-mark"><span /></span><span>orbit<span className="brand-period">.</span></span></a>
        <div className="header-center">
          <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Events, artists, venues" /><kbd>/</kbd></label>
          <label className="location-select"><MapPin size={16} /><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="Filter by city"><option>Everywhere</option><option>Brooklyn</option><option>New York</option><option>Queens</option></select><ChevronDown size={14} /></label>
        </div>
        <button className="my-tickets" onClick={() => setShowTickets(true)}><Ticket size={16} /><span>My tickets</span>{tickets.length > 0 && <span className="ticket-count">{tickets.length}</span>}</button>
      </header>

      <main id="top">
        <section className="feature-wrap" aria-label="Featured event">
          <div className="feature-panel" style={{ '--feature-image': `url("${featured.image}")` }}>
            <div className="feature-copy"><p className="eyebrow"><span className="live-dot" /> THE CITY, AFTER HOURS</p><h1>Good nights<br />stay with you.</h1><p className="feature-description">Find the little thing you’ll be talking about all week.</p><button className="feature-cta" onClick={() => openEvent(featured)}>This week’s pick <ArrowUpRight size={17} /></button></div>
            <div className="feature-caption"><span>ON OUR RADAR</span><strong>{featured.title}</strong><span>{formatDate(featured.date).full} <i>·</i> {featured.venue}</span></div>
            <button className="feature-arrow" aria-label="View featured event" onClick={() => openEvent(featured)}><ArrowUpRight size={21} /></button><span className="feature-index">01 <span>/</span> 04</span>
          </div>
          <div className="feature-note"><span className="note-star">✳</span><div><span>OUT THERE, TOGETHER</span><p>Less scrolling.<br />More stories.</p></div><ArrowDownRight className="note-arrow" size={18} /></div>
        </section>

        <section className="discover-section" id="events">
          <div className="section-heading"><div><p className="eyebrow muted-eyebrow">YOUR CITY IS CALLING</p><h2>Make a night of it<span>.</span></h2></div><a className="calendar-link" href="#event-list"><CalendarDays size={16} /> The next few weeks <ArrowRight size={15} /></a></div>
          <div className="filter-row"><div className="category-tabs" role="tablist" aria-label="Event categories">{categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(item)}>{item}</button>)}</div><span className="results-count">{filteredEvents.length} EVENTS</span></div>
          <div className="event-grid" id="event-list">
            {filteredEvents.map((event, index) => {
              const date = formatDate(event.date)
              return <article className="event-card" key={event._id} style={{ '--card-delay': `${index * 55}ms` }}><button className="event-image-button" onClick={() => openEvent(event)} aria-label={`View ${event.title}`}><img className="event-image" src={event.image} alt="" loading="lazy" /><span className="event-tag">{event.tag || event.category}</span><span className="image-arrow"><ArrowUpRight size={18} /></span><span className="date-stamp"><strong>{date.month}</strong><b>{date.day}</b></span></button><div className="event-details"><div className="event-meta"><span>{event.category}</span><span className="meta-dot" />{event.time}</div><button className="event-title" onClick={() => openEvent(event)}>{event.title}</button><div className="event-bottom"><span className="event-place"><MapPin size={13} />{event.venue}, {event.city.split(',')[0]}</span><span className="event-price">${event.price}<small> / person</small></span></div></div></article>
            })}
          </div>
          {filteredEvents.length === 0 && <div className="empty-state"><span className="empty-icon"><Search size={22} /></span><h3>No plans found. Yet.</h3><p>Try another search or category. Your next good night is still out there.</p><button onClick={() => { setSearch(''); setCategory('All events'); setCity('Everywhere') }}>Clear filters <ArrowRight size={15} /></button></div>}
        </section>
      </main>

      <footer className="site-footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><span /></span><span>orbit<span className="brand-period">.</span></span></a><span>Find your people. Find your place.</span><span className="footer-city"><MapPin size={13} /> MADE FOR THE CITY</span></footer>

      {selectedEvent && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedEvent(null) }}><section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="modal-close" aria-label="Close" onClick={() => setSelectedEvent(null)}><X size={19} /></button>
        {confirmation ? <div className="confirmation-view"><span className="confirmation-mark"><Check size={27} /></span><p className="eyebrow muted-eyebrow">YOU’RE ON THE LIST</p><h2>It’s a plan<span>.</span></h2><p className="confirmation-copy">Your tickets for <strong>{confirmation.eventTitle}</strong> are ready. We’ve saved the details in My tickets.</p><div className="confirmation-code"><span>BOOKING REFERENCE</span><strong>{confirmation._id}</strong></div><button className="primary-action" onClick={() => { setSelectedEvent(null); setShowTickets(true) }}>View my tickets <ArrowRight size={16} /></button></div> : <><div className="modal-image" style={{ backgroundImage: `url("${selectedEvent.image}")` }} /><div className="modal-content"><div className="event-meta"><span>{selectedEvent.category}</span><span className="meta-dot" />{selectedEvent.tag || 'Featured'}</div><h2 id="booking-title">{selectedEvent.title}</h2><p className="modal-description">{selectedEvent.description}</p><div className="event-facts"><div><CalendarDays size={16} /><span>{formatDate(selectedEvent.date).full}<small>{selectedEvent.time}</small></span></div><div><MapPin size={16} /><span>{selectedEvent.venue}<small>{selectedEvent.city}</small></span></div></div><div className="quantity-row"><div><strong>Your tickets</strong><small>${selectedEvent.price} per person</small></div><div className="stepper"><button aria-label="Remove one ticket" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button><span>{quantity}</span><button aria-label="Add one ticket" disabled={quantity >= 8 || quantity >= selectedEvent.remainingTickets} onClick={() => setQuantity((value) => Math.min(8, selectedEvent.remainingTickets, value + 1))}><Plus size={15} /></button></div></div><label className="form-field">Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" autoComplete="name" /></label><label className="form-field">Email for your tickets<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@example.com" autoComplete="email" /></label>{bookingError && <p className="booking-error" role="alert">{bookingError}</p>}<div className="checkout-total"><span>Total</span><strong>${selectedEvent.price * quantity}</strong></div><button className="primary-action" disabled={!name.trim() || !email.trim() || selectedEvent.remainingTickets < 1} onClick={() => reserveTickets(selectedEvent)}>{selectedEvent.remainingTickets < 1 ? 'Sold out' : 'Reserve tickets'} <ArrowRight size={16} /></button><p className="secure-note"><Clock3 size={13} /> No payment needed to reserve</p></div></>}
      </section></div>}

      {showTickets && <div className="modal-backdrop tickets-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowTickets(false) }}><section className="tickets-drawer" role="dialog" aria-modal="true" aria-labelledby="tickets-title"><div className="drawer-heading"><div><p className="eyebrow muted-eyebrow">YOUR UPCOMING PLANS</p><h2 id="tickets-title">My tickets<span>.</span></h2></div><button className="modal-close" aria-label="Close tickets" onClick={() => setShowTickets(false)}><X size={19} /></button></div>{tickets.length ? <div className="ticket-list">{tickets.map((ticket) => <article className="ticket-item" key={ticket._id}><div className="ticket-date"><strong>{formatDate(ticket.eventDate).month}</strong><b>{formatDate(ticket.eventDate).day}</b></div><div className="ticket-info"><h3>{ticket.eventTitle}</h3><span><MapPin size={13} />{ticket.venue}</span><span><Ticket size={13} />{ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'} · ${ticket.total}</span><small>REF {ticket._id}</small></div></article>)}</div> : <div className="drawer-empty"><span className="empty-icon"><Ticket size={22} /></span><h3>Your calendar’s wide open.</h3><p>Book something worth looking forward to and it’ll show up here.</p><button className="primary-action" onClick={() => { setShowTickets(false); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }) }}>Find an event <ArrowRight size={16} /></button></div>}</section></div>}
    </div>
  )
}

export default App
