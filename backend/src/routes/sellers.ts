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
    const sellers = await prisma.seller.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        products: true
      }
    });

    const payload = sellers.map((seller) => ({
      id: seller.id,
      shopName: seller.shopName,
      ownerName: `${seller.user.firstName} ${seller.user.lastName}`.trim(),
      email: seller.user.email,
      status: seller.isApproved ? "approved" : "pending",
      products: (seller as any).products?.length ?? 0,
      rating: 0,
      createdAt: seller.createdAt
    }));

    res.json({ success: true, data: payload });
  })
);

export default router;
