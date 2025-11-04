import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Report, Status, STATUS_LABELS, CATEGORY_LABELS } from '@shared/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ArrowLeft, Eye, Trash2, Archive, ArchiveRestore } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  const [showArchived, setShowArchived] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<Report | null>(null)
  const [bulkAction, setBulkAction] = useState<'delete' | 'archive' | 'unarchive' | null>(null)

  useEffect(() => {
    loadReports()
  }, [filter, showArchived])

  const loadReports = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (filter !== 'all') filters.status = filter
      if (showArchived) filters.includeArchived = 'true'

      const data = await api.getReports(filters)
      setReports(data)
      setSelectedReports(new Set()) // Clear selection when reloading
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

  const handleDelete = async (reportId: string) => {
    try {
      await api.deleteReport(reportId)
      toast.success('Report deleted!')
      setDeleteDialog(null)
      loadReports()
    } catch (error) {
      toast.error('Failed to delete report')
    }
  }

  const handleArchive = async (reportId: string, isArchived: boolean) => {
    try {
      await api.archiveReport(reportId, isArchived)
      toast.success(isArchived ? 'Report archived!' : 'Report unarchived!')
      loadReports()
    } catch (error) {
      toast.error('Failed to archive report')
    }
  }

  const toggleReportSelection = (reportId: string) => {
    const newSelection = new Set(selectedReports)
    if (newSelection.has(reportId)) {
      newSelection.delete(reportId)
    } else {
      newSelection.add(reportId)
    }
    setSelectedReports(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedReports.size === reports.length) {
      setSelectedReports(new Set())
    } else {
      setSelectedReports(new Set(reports.map(r => r.id)))
    }
  }

  const handleBulkAction = async (action: 'delete' | 'archive' | 'unarchive') => {
    if (selectedReports.size === 0) {
      toast.error('Please select reports first')
      return
    }

    try {
      const reportIds = Array.from(selectedReports)
      await api.bulkReportAction({ reportIds, action })
      toast.success(`${selectedReports.size} report(s) ${action === 'delete' ? 'deleted' : action === 'archive' ? 'archived' : 'unarchived'}!`)
      setBulkAction(null)
      loadReports()
    } catch (error) {
      toast.error(`Failed to ${action} reports`)
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

        {/* Filters and Bulk Actions */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
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

              <Button
                variant={showArchived ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>

              <span className="text-sm text-muted-foreground">
                Showing {reports.length} {reports.length === 1 ? 'report' : 'reports'}
              </span>
            </div>

            {/* Bulk Actions */}
            {selectedReports.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedReports.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction('archive')}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction('unarchive')}
                >
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Unarchive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkAction('delete')}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
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
          <>
            {/* Select All */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                checked={selectedReports.size === reports.length && reports.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>

            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-2">
                        <input
                          type="checkbox"
                          checked={selectedReports.has(report.id)}
                          onChange={() => toggleReportSelection(report.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>

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
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{report.title}</h3>
                              {report.isArchived && (
                                <Badge variant="secondary">
                                  <Archive className="mr-1 h-3 w-3" />
                                  Archived
                                </Badge>
                              )}
                            </div>
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
                        <div className="flex items-center gap-3 flex-wrap">
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
                              View
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchive(report.id, !report.isArchived)}
                          >
                            {report.isArchived ? (
                              <>
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                Unarchive
                              </>
                            ) : (
                              <>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </>
                            )}
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialog(report)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={!!bulkAction} onOpenChange={() => setBulkAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === 'delete' && 'Delete Reports'}
              {bulkAction === 'archive' && 'Archive Reports'}
              {bulkAction === 'unarchive' && 'Unarchive Reports'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedReports.size} report(s)?
              {bulkAction === 'delete' && ' This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAction(null)}>
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={() => bulkAction && handleBulkAction(bulkAction)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
