import express from "express";
import prisma from "../prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import { UserType } from "@wise-accessories/shared";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize(UserType.ADMIN),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ success: true, data: users });
  })
);

export default router;
