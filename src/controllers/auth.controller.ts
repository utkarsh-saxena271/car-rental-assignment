import type { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from "../config/prisma.js";
import { JWT_SECRET } from "../config/env.js";


export const signupController = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "invalid inputs"
        })
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(409).json({
                message: "username already exists"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(password, salt)


        const user = await prisma.user.create({ data: { username, password: hashpass } })
        if (user) {
            return res.status(200).json({
                success:true,
                data:{message: "user created successfully",
                userId: user.id}
            })
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "internal server error"
        })
    }
}


export const loginController = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "invalid inputs"
        })
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } })
        if (!existingUser) {
            return res.status(401).json({
                message: "user does not exist"
            })
        }
        const pwdvalid = await bcrypt.compare(password, existingUser.password);
        if (!pwdvalid) {
            return res.status(401).json({
                message: "password is incorrect"
            })
        }
        const token = jwt.sign({ userId: existingUser.id, username: existingUser.username }, JWT_SECRET, {
            expiresIn: "7d"
        })

        return res.status(201).json({
            success: true,
            data: {
                message: "Login successful",
                token: token
            }

        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "internal server error"
        })
    }
}