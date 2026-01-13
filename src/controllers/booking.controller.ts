import type { RequestHandler } from "express";
import prisma from "../config/prisma.js";
import { BookingStatus } from "../../generated/prisma/index.js";
import jwt from 'jsonwebtoken';


export const createBooking: RequestHandler = async (req, res) => {
    const {id:userId} = req.user as jwt.JwtPayload;
    const { carName, days, rentPerDay } = req.body

    if (!carName || !days || !rentPerDay) {
        return res.status(400).json({
            message: "invalid inputs"
        })
    }
    if (days > 365 || rentPerDay > 2000) {
        return res.status(400).json({
            message: "invalid inputs"
        })
    }

    try {
        const booking = await prisma.booking.create({
            data: {
                carName,
                rentPerDay: rentPerDay,
                days,
                userId,
                status: BookingStatus.BOOKED

            }
        })
        const totalCost = days * rentPerDay
        if (booking) {
            return res.status(201).json({
                success: true,
                data: {
                    message: "Booking created successfully",
                    bookingId: booking.id,
                    totalCost
                }
            })
        }
    } catch (error) {

    }
}

export const getBooking: RequestHandler = async (req, res) => {
    const { bookingId, summary } = req.query;
    const {id:userId} = req.user as jwt.JwtPayload;
    let sumAmount = 0;

    try {
        if (bookingId) {
            const bookingIdInt = Number(bookingId);
            if (isNaN(bookingIdInt)) {
                return res.status(400).json({ message: "invalid bookingId" });
            }

            const booking = await prisma.booking.findUnique({ where: { id: bookingIdInt } });
            if (!booking) {
                return res.status(404).json({ message: "booking not found" });
            }

            return res.status(200).json({
                success: true,
                data: {
                    id: booking.id,
                    car_name: booking.carName,
                    days: booking.days,
                    rent_per_day: booking.rentPerDay,
                    status: booking.status,
                    totalCost: booking.days * Number(booking.rentPerDay),
                },
            });
        }

        if (summary === "true") {
            if (!userId) return res.status(400).json({ message: "userId required for summary" });

            const userIdInt = Number(userId);
            if (isNaN(userIdInt)) return res.status(400).json({ message: "invalid userId" });

            const user = await prisma.user.findUnique({ where: { id: userIdInt } });
            if (!user) return res.status(404).json({ message: "user not found" });

            const bookings = await prisma.booking.findMany({ where: { userId: userIdInt } });

            for (const booking of bookings) {
                const rent = booking.rentPerDay;
                const days = booking.days;
                sumAmount += rent * days;
            }

            return res.status(200).json({
                success: true,
                data: {
                    userId: user.id,
                    username: user.username,
                    totalBookings: bookings.length,
                    totalAmountSpent: sumAmount,
                },
            });
        }
        return res.status(400).json({ message: "provide bookingId or summary=true" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error" });
    }
};



export const updateBooking: RequestHandler = async (req, res) => {
  const bookingId = Number(req.params.bookingId);
  const {id:userId} = req.user as jwt.JwtPayload;

  const { carName, days, rentPerDay, status } = req.body;

  if (isNaN(bookingId)) {
    return res.status(400).json({ message: "invalid bookingId" });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      return res.status(404).json({ message: "booking not found" });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: "booking does not belong to user" });
    }

    // Update status only
    if (status) {
      if (!["BOOKED", "COMPLETED", "CANCELLED"].includes(status)) {
        return res.status(400).json({ message: "invalid inputs" });
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
      });

      return res.status(200).json({
        success: true,
        data: {
          message: "Booking updated successfully",
          booking: {
            id: updated.id,
            car_name: updated.carName,
            days: updated.days,
            rent_per_day: updated.rentPerDay,
            status: updated.status,
            totalCost: updated.days * updated.rentPerDay,
          },
        },
      });
    }

    // Update booking details
    if (!carName || !days || !rentPerDay || days > 365 || rentPerDay > 2000) {
      return res.status(400).json({ message: "invalid inputs" });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { carName, days, rentPerDay },
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Booking updated successfully",
        booking: {
          id: updated.id,
          car_name: updated.carName,
          days: updated.days,
          rent_per_day: updated.rentPerDay,
          status: updated.status,
          totalCost: updated.days * updated.rentPerDay,
        },
      },
    });

  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};


export const deleteBooking:RequestHandler = async(req,res) => {
    const bookingId = Number(req.params.bookingId);
    const {id:userId} = req.user as jwt.JwtPayload;
    if (isNaN(bookingId)) {
    return res.status(400).json({ message: "invalid bookingId" });
  }

    try {
        const booking = await prisma.booking.findUnique({where:{id:bookingId}})
        if(!booking){
            return res.status(404).json({
                message:"booking not found"
            })
        }
        if(userId != booking.userId){
            return res.status(403).json({
                message:"booking does not belong to user"
            })
        }
        const deleted = await prisma.booking.delete({where:{id:bookingId}})
        if(deleted){
            return res.status(200).json({
                success:true,
                data:{
                    message:"Booking deleted successfully"
                }
            })
        }

    } catch (error) {
        return res.status(500).json({ message: "internal server error" });
    }
}