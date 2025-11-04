import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { Role } from '@shared/types'

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  userId?: string
  userRole?: Role
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: Role }

    // Check if user is banned
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isBanned: true },
    })

    if (user?.isBanned) {
      return res.status(403).json({ error: 'Account has been banned' })
    }

    req.userId = decoded.userId
    req.userRole = decoded.role

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: Role }
      req.userId = decoded.userId
      req.userRole = decoded.role
    }

    next()
  } catch (error) {
    // Invalid token, but continue without auth
    next()
  }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== Role.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
