import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Megaphone, MapPin, TrendingUp, Clock, CheckCircle2, Eye } from 'lucide-react'
import { api } from '@/lib/api'
import { Stats } from '@shared/types'
import CountUp from '@/components/CountUp'

export default function LandingPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error)
  }, [])

  const features = [
    {
      icon: Megaphone,
      title: 'Report Issues',
      description: 'Easily report potholes, waste, safety concerns and more with photos and voice notes.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MapPin,
      title: 'Interactive Map',
      description: 'View all reported issues on an interactive map with real-time updates.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Follow the status of reported issues from submission to resolution.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Eye,
      title: 'Community Driven',
      description: 'Upvote and comment on issues that matter to you and your community.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30"></div>
        <div className="absolute inset-0 bg-grid-white/10"></div>

        <div className="container relative py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Make Your Community
              <br />
              <span className="gradient-text">Better Together</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Report civic issues, track their progress, and help make your city a better place to live.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/report">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Megaphone className="mr-2 h-5 w-5" />
                  Report an Issue
                </Button>
              </Link>
              <Link to="/map">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <MapPin className="mr-2 h-5 w-5" />
                  View Map
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-muted/50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
            >
              <Card className="text-center">
                <CardHeader>
                  <AlertTriangle className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                  <CardTitle className="text-3xl md:text-4xl font-bold">
                    <CountUp end={stats.totalReports} duration={2} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <CardTitle className="text-3xl md:text-4xl font-bold">
                    <CountUp end={stats.resolvedToday} duration={2} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <CardTitle className="text-3xl md:text-4xl font-bold">
                    <CountUp end={stats.activeIssues} duration={2} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Active Issues</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Clock className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <CardTitle className="text-3xl md:text-4xl font-bold">
                    <CountUp end={stats.avgResolutionTime} duration={2} />h
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Avg Resolution</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, fast, and effective civic engagement platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Make a Difference?</h2>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              Join thousands of citizens making their communities better, one report at a time.
            </p>
            <Link to="/report">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Megaphone className="mr-2 h-5 w-5" />
                Report Your First Issue
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
