import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  remainingTickets: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  description: { type: String, required: true },
  tag: { type: String, default: '' },
}, { timestamps: true })

const bookingSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: String, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  quantity: { type: Number, required: true, min: 1, max: 8 },
  total: { type: Number, required: true, min: 0 },
}, { timestamps: true })

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema)
export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)