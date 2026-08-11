import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { authenticate, authorize } from "../middleware/auth";
import { UserType } from "@wise-accessories/shared";

const parseImages = (images: unknown) => {
  if (Array.isArray(images)) {
    return images;
  }

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const router = express.Router();

const FALLBACK_PRODUCTS = [
  {
    id: "p1",
    name: "Motorcycle Engine Piston",
    description: "High-performance piston for reliable engine performance.",
    price: 4500,
    stock: 20,
    images: ["https://images.pexels.com/photos/159898/pexels-photo-159898.jpeg"],
    sellerId: "seller-1",
    seller: { id: "seller-1", shopName: "Wise Accessories Store" },
    category: { id: "cat-1", name: "Engine Parts", slug: "engine-parts" },
    isActive: true
  },
  {
    id: "p2",
    name: "Front Brake Disc",
    description: "Durable braking disc for consistent stopping power.",
    price: 3200,
    stock: 14,
    images: ["https://images.pexels.com/photos/163634/pexels-photo-163634.jpeg"],
    sellerId: "seller-1",
    seller: { id: "seller-1", shopName: "Wise Accessories Store" },
    category: { id: "cat-4", name: "Brakes", slug: "brakes" },
    isActive: true
  },
  {
    id: "p3",
    name: "LED Headlight",
    description: "Bright LED headlight kit for safer night riding.",
    price: 2400,
    stock: 30,
    images: ["https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg"],
    sellerId: "seller-1",
    seller: { id: "seller-1", shopName: "Wise Accessories Store" },
    category: { id: "cat-7", name: "Lights", slug: "lights" },
    isActive: true
  },
  {
    id: "p4",
    name: "Shock Absorber (Rear)",
    description: "Premium rear shock absorber for smooth rides.",
    price: 5200,
    stock: 18,
    images: ["https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg"],
    sellerId: "seller-1",
    seller: { id: "seller-1", shopName: "Wise Accessories Store" },
    category: { id: "cat-3", name: "Suspension", slug: "suspension" },
    isActive: true
  },
  {
    id: "p5",
    name: "Spark Plug Set",
    description: "Reliable spark plug set for smooth ignition.",
    price: 900,
    stock: 40,
    images: ["https://images.pexels.com/photos/163636/pexels-photo-163636.jpeg"],
    sellerId: "seller-1",
    seller: { id: "seller-1", shopName: "Wise Accessories Store" },
    category: { id: "cat-5", name: "Electrical", slug: "electrical" },
    isActive: true
  },
  {
    id: "p6",
    name: "Motorcycle Tire 17in",
    description: "Quality tire built for long mileage and grip.",
    price: 6800,
    stock: 12,
    images: ["https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg"],
    sellerId: "seller-1",
    seller: { id: "seller-1", shopName: "Wise Accessories Store" },
    category: { id: "cat-6", name: "Tires & Wheels", slug: "tires-wheels" },
    isActive: true
  }
];

const filterFallbackProducts = (query: any) => {
  let products = [...FALLBACK_PRODUCTS];
  const search = String(query.search || "").trim().toLowerCase();
  const category = String(query.category || "").trim().toLowerCase();
  const sellerId = String(query.sellerId || "").trim();

  if (search) {
    products = products.filter((product) => {
      return (
        product.name.toLowerCase().includes(search) ||
        (product.description || "").toLowerCase().includes(search) ||
        product.category.name.toLowerCase().includes(search)
      );
    });
  }

  if (category) {
    products = products.filter((product) => product.category.slug === category || product.category.name.toLowerCase() === category);
  }

  if (sellerId) {
    products = products.filter((product) => product.sellerId === sellerId);
  }

  return products;
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const sellerId = String(req.query.sellerId || "").trim();

    const where: any = {
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(category
        ? {
            category: {
              slug: category
            }
          }
        : {}),
      ...(sellerId ? { sellerId } : {})
    };

    try {
      const total = await prisma.product.count({ where });
      const products = await prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              shopName: true
            }
          },
          category: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      res.json({
        success: true,
        data: products.map((product) => ({
          ...product,
          images: parseImages(product.images)
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      const fallback = filterFallbackProducts({ search, category, sellerId });
      const startIndex = (page - 1) * limit;
      const pagedProducts = fallback.slice(startIndex, startIndex + limit);

      res.json({
        success: true,
        data: pagedProducts,
        meta: {
          total: fallback.length,
          page,
          limit,
          totalPages: Math.ceil(fallback.length / limit),
          source: "fallback"
        }
      });
    }
  })
);

router.get(
  "/admin",
  authenticate,
  authorize(UserType.ADMIN, UserType.SELLER),
  asyncHandler(async (req: any, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 100);
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const sellerId = String(req.query.sellerId || "").trim();
    const activeFilter = req.query.active?.toString();

    const where: any = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(category
        ? {
            category: {
              slug: category
            }
          }
        : {}),
      ...(sellerId ? { sellerId } : {})
    };

    if (activeFilter === "true") {
      where.isActive = true;
    } else if (activeFilter === "false") {
      where.isActive = false;
    }

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        seller: {
          select: {
            id: true,
            shopName: true
          }
        },
        category: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({
      success: true,
      data: products.map((product) => ({
        ...product,
        images: parseImages(product.images)
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  })
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });

    res.json({
      success: true,
      data: categories
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: any, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: {
          seller: {
            select: {
              id: true,
              shopName: true
            }
          },
          category: true
        }
      });

      if (product) {
        return res.json({
          success: true,
          data: {
            ...product,
            images: parseImages(product.images)
          }
        });
      }
    } catch (error) {
      // ignore and fallback to local product data
    }

    const fallback = FALLBACK_PRODUCTS.find((product) => product.id === req.params.id);
    if (!fallback) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      success: true,
      data: fallback
    });
  })
);

router.get(
  "/sellers",
  authenticate,
  authorize(UserType.ADMIN),
  asyncHandler(async (_req, res) => {
    const sellers = await prisma.seller.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({ success: true, data: sellers });
  })
);

router.post(
  "/",
  authenticate,
  authorize(UserType.SELLER, UserType.ADMIN),
  asyncHandler(async (req: any, res) => {
    const { name, description, categoryId, price, stock, images, sellerId } = req.body;

    if (!name || !categoryId || !price || !stock) {
      throw new AppError("Missing required fields", 400);
    }

    let seller = null as any;
    const currentUser = req.user;
    if (currentUser.userType === UserType.SELLER) {
      seller = await prisma.seller.findUnique({
        where: {
          userId: currentUser.id
        }
      });
      if (!seller) {
        throw new AppError("Seller profile not found", 404);
      }
    } else {
      if (sellerId) {
        seller = await prisma.seller.findUnique({ where: { id: sellerId } });
      }

      if (!seller) {
        seller = await prisma.seller.findFirst({ orderBy: { createdAt: "asc" } });
      }

      if (!seller) {
        throw new AppError("No seller found for product creation", 404);
      }
    }

    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        name,
        description,
        categoryId,
        price: Number(price),
        stock: Number(stock),
        images: JSON.stringify(Array.isArray(images) ? images : []),
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        ...product,
        images: parseImages(product.images)
      }
    });
  })
);

router.put(
  "/:id",
  authenticate,
  authorize(UserType.SELLER, UserType.ADMIN),
  asyncHandler(async (req: any, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (req.user.userType === UserType.SELLER) {
      const seller = await prisma.seller.findUnique({
        where: {
          userId: req.user.id
        }
      });
      if (!seller || seller.id !== product.sellerId) {
        throw new AppError("Forbidden", 403);
      }
    }

    const { name, description, categoryId, price, stock, images, isActive } = req.body;
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ?? product.name,
        description: description ?? product.description,
        categoryId: categoryId ?? product.categoryId,
        price: price === undefined ? product.price : Number(price),
        stock: stock === undefined ? product.stock : Number(stock),
        images: JSON.stringify(
          images !== undefined
            ? Array.isArray(images)
              ? images
              : []
            : parseImages(product.images)
        ),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {})
      }
    });

    const updatedProductWithRelations = await prisma.product.findUnique({
      where: { id: updatedProduct.id },
      include: {
        seller: {
          select: {
            id: true,
            shopName: true
          }
        },
        category: true
      }
    });

    res.json({
      success: true,
      data: {
        ...updatedProductWithRelations,
        images: parseImages(updatedProductWithRelations?.images)
      }
    });
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserType.SELLER, UserType.ADMIN),
  asyncHandler(async (req: any, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (req.user.userType === UserType.SELLER) {
      const seller = await prisma.seller.findUnique({
        where: {
          userId: req.user.id
        }
      });
      if (!seller || seller.id !== product.sellerId) {
        throw new AppError("Forbidden", 403);
      }
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
