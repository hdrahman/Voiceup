import express from 'express'
import { PrismaClient } from '@prisma/client'
import {
  CreateReportRequest,
  UpdateReportStatusRequest,
  UpdateReportRequest,
  CreateCommentRequest,
  BulkReportActionRequest,
  ReportFilters,
  Category,
  Status,
} from '@shared/types'
import { authenticate, optionalAuth, requireAdmin, AuthRequest } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Create report (with or without auth)
router.post('/create', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body as CreateReportRequest

    if (!data.title || !data.description || !data.category || !data.lat || !data.lng) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const report = await prisma.report.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        imageData: data.imageData,
        audioData: data.audioData,
        anonymous: data.anonymous || false,
        userId: data.anonymous ? null : req.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    })

    res.status(201).json(report)
  } catch (error) {
    console.error('Create report error:', error)
    res.status(500).json({ error: 'Failed to create report' })
  }
})

// Get all reports with filters
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { category, status, search, sortBy, lat, lng, includeArchived } = req.query as any
    const filters: any = {}

    // Exclude archived reports by default (unless admin specifically includes them)
    if (includeArchived !== 'true') {
      filters.isArchived = false
    }

    if (category) filters.category = category as Category
    if (status) filters.status = status as Status
    if (search) {
      filters.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'upvotes') {
      orderBy = { upvotes: 'desc' }
    }

    const reports = await prisma.report.findMany({
      where: filters,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        upvoteUsers: req.userId
          ? {
            where: { userId: req.userId },
          }
          : false,
      },
    })

    // Add hasUpvoted field
    const reportsWithUpvote = reports.map((report: any) => ({
      ...report,
      hasUpvoted: req.userId ? report.upvoteUsers?.length > 0 : false,
      upvoteUsers: undefined, // Remove upvoteUsers array from response
    }))

    res.json(reportsWithUpvote)
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

// Get single report
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        upvoteUsers: req.userId
          ? {
            where: { userId: req.userId },
          }
          : false,
      },
    })

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    const reportWithUpvote = {
      ...report,
      hasUpvoted: req.userId ? (report.upvoteUsers as any[])?.length > 0 : false,
      upvoteUsers: undefined,
    }

    res.json(reportWithUpvote)
  } catch (error) {
    console.error('Get report error:', error)
    res.status(500).json({ error: 'Failed to fetch report' })
  }
})

// Upvote report
router.post('/:id/upvote', authenticate, async (req: AuthRequest, res) => {
  try {
    const reportId = req.params.id
    const userId = req.userId!

    // Check if already upvoted
    const existing = await prisma.upvote.findUnique({
      where: {
        reportId_userId: {
          reportId,
          userId,
        },
      },
    })

    if (existing) {
      // Remove upvote
      await prisma.upvote.delete({
        where: { id: existing.id },
      })
      await prisma.report.update({
        where: { id: reportId },
        data: { upvotes: { decrement: 1 } },
      })
      return res.json({ upvoted: false })
    } else {
      // Add upvote
      await prisma.upvote.create({
        data: { reportId, userId },
      })
      await prisma.report.update({
        where: { id: reportId },
        data: { upvotes: { increment: 1 } },
      })
      return res.json({ upvoted: true })
    }
  } catch (error) {
    console.error('Upvote error:', error)
    res.status(500).json({ error: 'Failed to upvote' })
  }
})

// Add comment
router.post('/:id/comment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body as CreateCommentRequest

    if (!text) {
      return res.status(400).json({ error: 'Comment text required' })
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        reportId: req.params.id,
        userId: req.userId!,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    })

    res.status(201).json(comment)
  } catch (error) {
    console.error('Comment error:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

// Update report status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body as UpdateReportStatusRequest

    if (!status || !Object.values(Status).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    })

    res.json(report)
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

// Update report (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, status } = req.body as UpdateReportRequest

    const updateData: any = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (category && Object.values(Category).includes(category)) {
      updateData.category = category
    }
    if (status && Object.values(Status).includes(status)) {
      updateData.status = status
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    res.json(report)
  } catch (error) {
    console.error('Update report error:', error)
    res.status(500).json({ error: 'Failed to update report' })
  }
})

// Delete report (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.report.delete({
      where: { id: req.params.id },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete report error:', error)
    res.status(500).json({ error: 'Failed to delete report' })
  }
})

// Archive/unarchive report (admin only)
router.put('/:id/archive', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { isArchived } = req.body

    if (typeof isArchived !== 'boolean') {
      return res.status(400).json({ error: 'Invalid archive status' })
    }

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { isArchived },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    })

    res.json(report)
  } catch (error) {
    console.error('Archive report error:', error)
    res.status(500).json({ error: 'Failed to archive report' })
  }
})

// Bulk actions on reports (admin only)
router.post('/bulk-action', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { reportIds, action } = req.body as BulkReportActionRequest

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ error: 'Invalid report IDs' })
    }

    if (!action || !['delete', 'archive', 'unarchive'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' })
    }

    let result
    switch (action) {
      case 'delete':
        result = await prisma.report.deleteMany({
          where: { id: { in: reportIds } },
        })
        break
      case 'archive':
        result = await prisma.report.updateMany({
          where: { id: { in: reportIds } },
          data: { isArchived: true },
        })
        break
      case 'unarchive':
        result = await prisma.report.updateMany({
          where: { id: { in: reportIds } },
          data: { isArchived: false },
        })
        break
    }

    res.json({ success: true, count: result.count })
  } catch (error) {
    console.error('Bulk action error:', error)
    res.status(500).json({ error: 'Failed to perform bulk action' })
  }
})

export default router
