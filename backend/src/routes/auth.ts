import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { config } from "../config";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { authenticate } from "../middleware/auth";
import { UserType } from "@wise-accessories/shared";

const router = express.Router();

const createToken = (userId: string, userType: string) => {
  const payload = { id: userId, userType: String(userType).toLowerCase() };
  const secret: any = config.jwtSecret;
  return (jwt as any).sign(payload, secret, { expiresIn: config.jwtExpire });
};

const safeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  userType: user.userType,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      userType,
      shopName,
      shopDescription
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new AppError("Missing required fields", 400);
    }

    const normalizedUserType =
      userType === UserType.SELLER ? UserType.SELLER : UserType.CUSTOMER;

    // Map shared UserType (lowercase) to Prisma enum tokens (uppercase)
    const prismaUserType =
      normalizedUserType === UserType.SELLER ? "SELLER" : "CUSTOMER";

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      // cast to any to avoid complex generated nested-create types during dev
      data: {
        email,
        password: passwordHash,
        firstName,
        lastName,
        phone,
        userType: prismaUserType,
        ...(normalizedUserType === UserType.CUSTOMER
          ? {
              customer: {
                create: {}
              }
            }
          : {
              seller: {
                create: {
                  shopName: shopName || `${firstName} ${lastName} Store`,
                  shopDescription,
                  isApproved: false,
                  isVerified: false
                }
              }
            })
      } as any
    });

    const token = createToken(user.id, user.userType);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: safeUser(user)
      }
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = createToken(user.id, user.userType);

    res.json({
      success: true,
      data: {
        token,
        user: {
          ...safeUser(user),
          userType: String(user.userType).toLowerCase()
        }
      }
    });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: any, res) => {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: safeUser(user)
    });
  })
);

router.post(
  "/logout",
  authenticate,
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      message: "Logout successful"
    });
  })
);

export default router;
