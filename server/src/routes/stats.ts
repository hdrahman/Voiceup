import express from 'express'
import { PrismaClient } from '@prisma/client'
import { Stats, Category, Status } from '@shared/types'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    // Get total reports
    const totalReports = await prisma.report.count()

    // Get resolved today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const resolvedToday = await prisma.report.count({
      where: {
        status: Status.RESOLVED,
        updatedAt: { gte: today },
      },
    })

    // Get active issues
    const activeIssues = await prisma.report.count({
      where: {
        status: { in: [Status.NEW, Status.IN_PROGRESS] },
      },
    })

    // Calculate average resolution time (simplified)
    const resolvedReports = await prisma.report.findMany({
      where: { status: Status.RESOLVED },
      select: { createdAt: true, updatedAt: true },
      take: 100, // Sample last 100
    })

    let avgResolutionTime = 0
    if (resolvedReports.length > 0) {
      const totalTime = resolvedReports.reduce((sum, report) => {
        const diff = new Date(report.updatedAt).getTime() - new Date(report.createdAt).getTime()
        return sum + diff
      }, 0)
      avgResolutionTime = Math.round(totalTime / resolvedReports.length / (1000 * 60 * 60)) // hours
    }

    // Get reports by category
    const byCategory: Record<Category, number> = {
      [Category.ROADS]: 0,
      [Category.WASTE]: 0,
      [Category.SAFETY]: 0,
      [Category.LIGHTING]: 0,
      [Category.OTHER]: 0,
    }

    const categoryGroups = await prisma.report.groupBy({
      by: ['category'],
      _count: true,
    })

    categoryGroups.forEach((group) => {
      byCategory[group.category] = group._count
    })

    // Get recent activity
    const recentActivity = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
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

    const stats: Stats = {
      totalReports,
      resolvedToday,
      activeIssues,
      avgResolutionTime,
      byCategory,
      recentActivity,
    }

    res.json(stats)
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
