import cookieParser from 'cookie-parser';
import express from 'express'
import authRoutes from './routes/auth.routes.js'
import bookingRoutes from './routes/booking.routes.js'

const app = express();

// app level middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes)
app.use('/api/bookings',bookingRoutes)





export default app;