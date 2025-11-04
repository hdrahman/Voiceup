import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Report, Category, Status, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS } from '@shared/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ArrowUp, MessageCircle, MapPin, Search } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default function FeedPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes'>('newest')

  useEffect(() => {
    loadReports()
  }, [category, status, sortBy])

  const loadReports = async () => {
    setLoading(true)
    try {
      const filters: any = { sortBy }
      if (category !== 'all') filters.category = category
      if (status !== 'all') filters.status = status
      if (search) filters.search = search

      const data = await api.getReports(filters)
      setReports(data)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(search.toLowerCase()) ||
    report.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Issue Feed</h1>
            <p className="text-muted-foreground mt-2">Browse and filter reported civic issues</p>
          </div>
          <Link to="/report">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Report New Issue
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="upvotes">Most Upvoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredReports.length} {filteredReports.length === 1 ? 'issue' : 'issues'}
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No issues found matching your filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/reports/${report.id}`}>
                  <Card className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden h-full">
                    {report.imageData && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={report.imageData}
                          alt={report.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-2 left-2 flex gap-2">
                          <Badge
                            style={{
                              backgroundColor: CATEGORY_COLORS[report.category],
                              color: 'white'
                            }}
                          >
                            {CATEGORY_LABELS[report.category]}
                          </Badge>
                          <Badge variant="secondary">
                            {STATUS_LABELS[report.status]}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">{report.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {report.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{report.address}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-3 bg-muted/50 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-4 w-4" />
                          <span>{report.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{report.comments?.length || 0}</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground">{formatRelativeTime(report.createdAt)}</span>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
