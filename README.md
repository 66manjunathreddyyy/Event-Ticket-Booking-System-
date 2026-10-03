<<<<<<< HEAD
# Event-Ticket-Booking-System-
The Event Ticket Booking System is a web-based application designed to make the process of booking tickets for various events simple, fast, and convenient. The system allows users to view available events, check event details such as date, time, venue, and ticket price, and book tickets online without visiting a physical ticket counter.
=======
# Orbit Event Tickets

A MERN event discovery and ticket reservation app. Browse and filter events, reserve up to eight tickets, and view saved reservations under **My tickets**.

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. The Express API runs on `http://localhost:5000`.

Without MongoDB configured, the API uses six sample events and keeps reservations in memory for the lifetime of the server. The browser also saves your ticket list locally.

## Use MongoDB

Copy `.env.example` to `.env`, set `MONGODB_URI` to a local MongoDB instance or MongoDB Atlas connection string, then restart the API. The server seeds the sample events into an empty database and stores reservations in MongoDB.

## Other commands

- `npm run dev:client` starts only the Vite client.
- `npm run dev:server` starts only the Express API.
- `npm run build` creates a production client build.
- `npm run lint` runs Oxlint.

Reservations in this starter do not process payments or require user accounts.
>>>>>>> a5781fa (Initial commit)
