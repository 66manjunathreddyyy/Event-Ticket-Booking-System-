import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { Booking, Event } from './models.js'
import { demoEvents } from './events.js'

const app = express()
const port = process.env.PORT || 5000
const memoryInventory = new Map(demoEvents.map((event) => [event._id, event.remainingTickets]))
let databaseReady = Promise.resolve(false)

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'demo' })
})

app.get('/api/events', async (request, response, next) => {
  try {
    const { category, city, search } = request.query
    const filters = {}
    if (category && category !== 'All events') filters.category = category
    if (city && city !== 'Everywhere') filters.city = new RegExp(String(city), 'i')
    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const term = new RegExp(escaped, 'i')
      filters.$or = ['title', 'venue', 'city', 'category'].map((field) => ({ [field]: term }))
    }

    if (await databaseReady) {
      const events = await Event.find(filters).sort({ date: 1 }).lean()
      return response.json({ events })
    }

    const term = String(search || '').toLowerCase()
    const events = demoEvents
      .filter((event) => (!category || category === 'All events' || event.category === category))
      .filter((event) => (!city || city === 'Everywhere' || event.city.toLowerCase().includes(String(city).toLowerCase())))
      .filter((event) => (!term || [event.title, event.venue, event.city, event.category].some((value) => value.toLowerCase().includes(term))))
      .map((event) => ({ ...event, remainingTickets: memoryInventory.get(event._id) ?? event.remainingTickets }))
    response.json({ events })
  } catch (error) {
    next(error)
  }
})

app.post('/api/bookings', async (request, response, next) => {
  try {
    const { eventId, name, email, quantity } = request.body
    const ticketCount = Number(quantity)
    if (!eventId || !name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || !Number.isInteger(ticketCount) || ticketCount < 1 || ticketCount > 8) {
      return response.status(400).json({ message: 'Enter your name, a valid email, and 1 to 8 tickets.' })
    }

    if (await databaseReady && !String(eventId).startsWith('demo-')) {
      const event = await Event.findOneAndUpdate(
        { _id: eventId, remainingTickets: { $gte: ticketCount } },
        { $inc: { remainingTickets: -ticketCount } },
        { new: true },
      )
      if (!event) return response.status(409).json({ message: 'Those tickets are no longer available.' })
      const booking = await Booking.create({
        event: event._id, eventTitle: event.title, eventDate: event.date, venue: event.venue,
        city: event.city, name, email, quantity: ticketCount, total: event.price * ticketCount,
      })
      return response.status(201).json({ booking })
    }

    const event = demoEvents.find((item) => item._id === eventId)
    const remaining = memoryInventory.get(eventId)
    if (!event || remaining < ticketCount) return response.status(409).json({ message: 'Those tickets are no longer available.' })
    memoryInventory.set(eventId, remaining - ticketCount)
    const booking = {
      _id: `ORB-${Date.now().toString(36).toUpperCase()}`,
      eventTitle: event.title, eventDate: event.date, venue: event.venue, city: event.city,
      name: name.trim(), email: email.trim().toLowerCase(), quantity: ticketCount, total: event.price * ticketCount,
    }
    response.status(201).json({ booking })
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ message: 'Something went wrong. Please try again.' })
})

if (process.env.MONGODB_URI) {
  databaseReady = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
      if (await Event.countDocuments() === 0) {
        await Event.insertMany(demoEvents.map(({ _id, ...event }) => event))
      }
      console.log('MongoDB connected; demo events are ready')
      return true
    })
    .catch((error) => {
      console.error('MongoDB connection failed; using demo data:', error.message)
      return false
    })
} else {
  console.log('MONGODB_URI not set; using in-memory demo data')
}

app.listen(port, () => console.log(`Orbit API listening on http://localhost:${port}`))