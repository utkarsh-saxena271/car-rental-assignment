import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createBooking, deleteBooking, getBooking, updateBooking } from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/',authMiddleware,createBooking)
router.get('/',authMiddleware,getBooking)
router.put('/:bookingId',authMiddleware,updateBooking)
router.delete('/:bookingId',authMiddleware,deleteBooking)


export default router;