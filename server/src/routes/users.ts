import express from 'express'
import { PrismaClient } from '@prisma/client'
import { UpdateUserRoleRequest, UpdateUserBanRequest, Role } from '@shared/types'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isBanned: true,
                createdAt: true,
                _count: {
                    select: {
                        reports: true,
                        comments: true,
                        upvotes: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        res.json(users)
    } catch (error) {
        console.error('Get users error:', error)
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

// Update user role (admin only)
router.put('/:id/role', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { role } = req.body as UpdateUserRoleRequest

        if (!role || !Object.values(Role).includes(role)) {
            return res.status(400).json({ error: 'Invalid role' })
        }

        // Prevent admin from changing their own role
        if (req.params.id === req.userId) {
            return res.status(400).json({ error: 'Cannot change your own role' })
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: {
                id: true,
                email: true,
                role: true,
                isBanned: true,
                createdAt: true,
            },
        })

        res.json(user)
    } catch (error) {
        console.error('Update role error:', error)
        res.status(500).json({ error: 'Failed to update role' })
    }
})

// Ban/unban user (admin only)
router.put('/:id/ban', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { isBanned } = req.body as UpdateUserBanRequest

        if (typeof isBanned !== 'boolean') {
            return res.status(400).json({ error: 'Invalid ban status' })
        }

        // Prevent admin from banning themselves
        if (req.params.id === req.userId) {
            return res.status(400).json({ error: 'Cannot ban yourself' })
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { isBanned },
            select: {
                id: true,
                email: true,
                role: true,
                isBanned: true,
                createdAt: true,
            },
        })

        res.json(user)
    } catch (error) {
        console.error('Update ban status error:', error)
        res.status(500).json({ error: 'Failed to update ban status' })
    }
})

export default router
