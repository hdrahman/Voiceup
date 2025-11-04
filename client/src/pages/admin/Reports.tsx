import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Report, Status, STATUS_LABELS, CATEGORY_LABELS, Category } from '@shared/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Eye } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'all'>('all')

  useEffect(() => {
    loadReports()
  }, [filter])

  const loadReports = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (filter !== 'all') filters.status = filter

      const data = await api.getReports(filters)
      setReports(data)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reportId: string, newStatus: Status) => {
    try {
      await api.updateReportStatus(reportId, { status: newStatus })
      toast.success('Status updated!')
      loadReports()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/admin">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">Manage Reports</h1>
            <p className="text-muted-foreground mt-2">Review and update report statuses</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {reports.length} {reports.length === 1 ? 'report' : 'reports'}
            </span>
          </div>
        </Card>

        {/* Reports Table */}
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading reports...</p>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No reports found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6">
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    {report.imageData && (
                      <img
                        src={report.imageData}
                        alt={report.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{report.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {report.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {CATEGORY_LABELS[report.category]}
                            </Badge>
                            <Badge variant="secondary">
                              {report.upvotes} upvotes
                            </Badge>
                            <Badge variant="secondary">
                              {report.comments?.length || 0} comments
                            </Badge>
                            <span className="text-xs text-muted-foreground self-center">
                              {formatRelativeTime(report.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Select
                          value={report.status}
                          onValueChange={(value) => handleStatusChange(report.id, value as Status)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Link to={`/reports/${report.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
