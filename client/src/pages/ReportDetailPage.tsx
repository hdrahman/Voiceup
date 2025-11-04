import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Report, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS } from '@shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, ArrowUp, MapPin, Calendar, User, Volume2 } from 'lucide-react'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (id) loadReport()
  }, [id])

  const loadReport = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await api.getReport(id)
      setReport(data)
    } catch (error) {
      console.error('Failed to load report:', error)
      toast.error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to upvote')
      return
    }
    if (!id) return

    try {
      const result = await api.upvoteReport(id)
      toast.success(result.upvoted ? 'Upvoted!' : 'Upvote removed')
      loadReport()
    } catch (error) {
      toast.error('Failed to upvote')
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !id) return

    setSubmittingComment(true)
    try {
      await api.addComment(id, { text: comment })
      setComment('')
      toast.success('Comment added!')
      loadReport()
    } catch (error) {
      toast.error('Failed to add comment. Please login.')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Card className="animate-pulse">
          <div className="h-96 bg-muted"></div>
          <CardContent className="p-8 space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Report not found</p>
          <Link to="/feed">
            <Button className="mt-4">Back to Feed</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Link to="/feed">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Image */}
          {report.imageData && (
            <Card className="overflow-hidden">
              <img
                src={report.imageData}
                alt={report.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </Card>
          )}

          {/* Title and Details */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  style={{
                    backgroundColor: CATEGORY_COLORS[report.category],
                    color: 'white'
                  }}
                >
                  {CATEGORY_LABELS[report.category]}
                </Badge>
                <Badge variant="outline">
                  {STATUS_LABELS[report.status]}
                </Badge>
              </div>
              <CardTitle className="text-3xl">{report.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">{report.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{report.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(report.createdAt)}</span>
                </div>
                {!report.anonymous && report.user && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{report.user.email}</span>
                  </div>
                )}
              </div>

              {/* Audio Player */}
              {report.audioData && (
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">Voice Note</p>
                      <audio controls className="w-full">
                        <source src={report.audioData} type="audio/webm" />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments ({report.comments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <Button type="submit" disabled={!comment.trim() || submittingComment}>
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              ) : (
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground text-center">
                    <Link to="/login" className="text-primary hover:underline">Login</Link> to add comments
                  </p>
                </Card>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {report.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>{comment.user.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.user.email}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Upvote Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <Button
                onClick={handleUpvote}
                variant={report.hasUpvoted ? 'default' : 'outline'}
                size="lg"
                className="w-full mb-4"
              >
                <ArrowUp className="mr-2 h-5 w-5" />
                {report.hasUpvoted ? 'Upvoted' : 'Upvote'}
              </Button>
              <p className="text-3xl font-bold">{report.upvotes}</p>
              <p className="text-sm text-muted-foreground">people support this</p>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">{report.address}</p>
            </CardContent>
          </Card>

          {/* Share Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied!')
              }}>
                Copy Link
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
