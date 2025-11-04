import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Report, Category, Status, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS } from '@shared/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime } from '@/lib/utils'
import { MapPin, Layers } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers')
  const markers = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    loadReports()
  }, [category])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-73.9851, 40.7589], // New York
      zoom: 12,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right')

    // Wait for map to load before allowing marker additions
    map.current.on('load', () => {
      console.log('Map loaded successfully')
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current || reports.length === 0) return

    // Wait for map to be fully loaded
    const addMarkers = () => {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove())
      markers.current = []

      // Add markers
      reports.forEach((report) => {
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.backgroundColor = CATEGORY_COLORS[report.category]
      el.style.width = '30px'
      el.style.height = '30px'
      el.style.borderRadius = '50%'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.style.cursor = 'pointer'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.fontSize = '12px'
      el.style.fontWeight = 'bold'
      el.style.color = 'white'
      el.textContent = report.category.charAt(0)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([report.lng, report.lat])
        .addTo(map.current!)

      el.addEventListener('click', () => {
        setSelectedReport(report)
        map.current?.flyTo({
          center: [report.lng, report.lat],
          zoom: 14,
          duration: 1000
        })
      })

      markers.current.push(marker)
      })

      // Fit bounds to show all markers
      if (reports.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        reports.forEach(report => {
          bounds.extend([report.lng, report.lat])
        })
        map.current?.fitBounds(bounds, { padding: 50 })
      }
    }

    // Check if map is loaded
    if (map.current.loaded()) {
      addMarkers()
    } else {
      map.current.on('load', addMarkers)
    }

    return () => {
      map.current?.off('load', addMarkers)
    }
  }, [reports])

  const loadReports = async () => {
    try {
      const filters: any = {}
      if (category !== 'all') filters.category = category

      const data = await api.getReports(filters)
      setReports(data)
    } catch (error) {
      console.error('Failed to load reports:', error)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-full md:w-96 bg-background border-r overflow-y-auto"
      >
        <div className="p-4 border-b sticky top-0 bg-background z-10">
          <h1 className="text-2xl font-bold mb-4">Interactive Map</h1>

          {/* Category Filter */}
          <Tabs value={category} onValueChange={(v) => setCategory(v as any)} className="mb-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={Category.ROADS}>Roads</TabsTrigger>
              <TabsTrigger value={Category.WASTE}>Waste</TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-3 w-full mt-2">
              <TabsTrigger value={Category.SAFETY}>Safety</TabsTrigger>
              <TabsTrigger value={Category.LIGHTING}>Lighting</TabsTrigger>
              <TabsTrigger value={Category.OTHER}>Other</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{reports.length} issues</span>
            <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === 'markers' ? 'heatmap' : 'markers')}>
              <Layers className="h-4 w-4 mr-2" />
              {viewMode === 'markers' ? 'Heatmap' : 'Markers'}
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className={`cursor-pointer hover:shadow-md transition-all ${
                selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedReport(report)
                map.current?.flyTo({
                  center: [report.lng, report.lat],
                  zoom: 14,
                  duration: 1000
                })
              }}
            >
              <CardContent className="p-3">
                <div className="flex gap-2 mb-2">
                  <Badge
                    style={{
                      backgroundColor: CATEGORY_COLORS[report.category],
                      color: 'white'
                    }}
                    className="text-xs"
                  >
                    {CATEGORY_LABELS[report.category]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {STATUS_LABELS[report.status]}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 mb-1">{report.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {report.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{report.address}</span>
                  </div>
                  <span>{formatRelativeTime(report.createdAt)}</span>
                </div>
                <Link to={`/reports/${report.id}`}>
                  <Button size="sm" className="w-full mt-2" variant="outline">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        {!mapboxgl.accessToken && (
          <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-4">
            <Card className="max-w-md">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg mb-2">Mapbox Token Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please add your Mapbox API token to the .env file as VITE_MAPBOX_TOKEN
                </p>
                <a
                  href="https://account.mapbox.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Get a free token from Mapbox →
                </a>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
