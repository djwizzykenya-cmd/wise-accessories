import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    userType: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      userType: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError("Invalid token", 401));
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
};
