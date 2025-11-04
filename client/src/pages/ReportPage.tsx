import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import mapboxgl from 'mapbox-gl'
import confetti from 'canvas-confetti'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Category, CATEGORY_LABELS } from '@shared/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { MapPin, Camera, Mic, FileText, CheckCircle2, ArrowRight, ArrowLeft, Upload, Square } from 'lucide-react'
import { compressImage } from '@/lib/utils'
import toast from 'react-hot-toast'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

const STEPS = ['Location', 'Category', 'Details', 'Review']

export default function ReportPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Form data
  const [lat, setLat] = useState(40.7589)
  const [lng, setLng] = useState(-73.9851)
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState<Category>(Category.ROADS)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageData, setImageData] = useState<string>('')
  const [audioData, setAudioData] = useState<string>('')
  const [anonymous, setAnonymous] = useState(false)

  // Recording state
  const [recording, setRecording] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  // Map
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (step === 0 && mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: 13,
      })

      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current)

      marker.current.on('dragend', async () => {
        const lngLat = marker.current!.getLngLat()
        setLng(lngLat.lng)
        setLat(lngLat.lat)
        await reverseGeocode(lngLat.lat, lngLat.lng)
      })

      map.current.on('click', async (e) => {
        marker.current?.setLngLat(e.lngLat)
        setLng(e.lngLat.lng)
        setLat(e.lngLat.lat)
        await reverseGeocode(e.lngLat.lat, e.lngLat.lng)
      })

      // Get current location
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        setLat(latitude)
        setLng(longitude)
        map.current?.setCenter([longitude, latitude])
        marker.current?.setLngLat([longitude, latitude])
        reverseGeocode(latitude, longitude)
      })
    }
  }, [step])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      )
      const data = await response.json()
      if (data.features && data.features.length > 0) {
        setAddress(data.features[0].place_name)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const compressed = await compressImage(file)
      setImageData(compressed)
      toast.success('Image uploaded!')
    } catch (error) {
      toast.error('Failed to upload image')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data)
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          setAudioData(reader.result as string)
          toast.success('Voice note recorded!')
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.current.start()
      setRecording(true)
      toast.success('Recording started...')
    } catch (error) {
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    mediaRecorder.current?.stop()
    setRecording(false)
  }

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const report = await api.createReport({
        title,
        description,
        category,
        lat,
        lng,
        address,
        imageData,
        audioData,
        anonymous: !isAuthenticated || anonymous,
      })

      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      toast.success('Report submitted successfully!')
      setTimeout(() => {
        navigate(`/reports/${report.id}`)
      }, 1000)
    } catch (error) {
      toast.error('Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    value: key as Category,
    label,
    icon: getIcon(key as Category),
  }))

  return (
    <div className="container max-w-4xl py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">Report an Issue</h1>
        <p className="text-muted-foreground mb-8">Help improve your community by reporting civic issues</p>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((stepName, index) => (
              <div
                key={index}
                className={`text-sm font-medium ${
                  index <= step ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {stepName}
              </div>
            ))}
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{STEPS[step]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 0: Location */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Click on the map or drag the marker to select location</Label>
                      <div ref={mapContainer} className="w-full h-96 rounded-lg overflow-hidden mt-2" />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <Button onClick={() => {
                      navigator.geolocation.getCurrentPosition((position) => {
                        const { latitude, longitude } = position.coords
                        setLat(latitude)
                        setLng(longitude)
                        map.current?.flyTo({ center: [longitude, latitude], zoom: 15 })
                        marker.current?.setLngLat([longitude, latitude])
                        reverseGeocode(latitude, longitude)
                        toast.success('Location updated!')
                      })
                    }}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Use Current Location
                    </Button>
                  </div>
                )}

                {/* Step 1: Category */}
                {step === 1 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categoryOptions.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          category === option.value ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setCategory(option.value)}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl mb-3">{option.icon}</div>
                          <div className="font-medium">{option.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Brief description of the issue"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed information about the issue"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Photo (optional)</Label>
                      {imageData ? (
                        <div className="relative">
                          <img src={imageData} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setImageData('')}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                          <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                    <div>
                      <Label>Voice Note (optional)</Label>
                      {audioData ? (
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                          <audio controls className="flex-1">
                            <source src={audioData} />
                          </audio>
                          <Button variant="outline" size="sm" onClick={() => setAudioData('')}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={recording ? stopRecording : startRecording}
                        >
                          {recording ? (
                            <>
                              <Square className="mr-2 h-4 w-4 fill-current" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="mr-2 h-4 w-4" />
                              Record Voice Note
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    {isAuthenticated && (
                      <div className="flex items-center space-x-2">
                        <Switch id="anonymous" checked={anonymous} onCheckedChange={setAnonymous} />
                        <Label htmlFor="anonymous">Report anonymously</Label>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Category</Label>
                        <p className="font-medium">{CATEGORY_LABELS[category]}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Location</Label>
                        <p className="font-medium text-sm">{address}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Title</Label>
                      <p className="font-medium">{title}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="text-sm">{description}</p>
                    </div>
                    {imageData && (
                      <div>
                        <Label className="text-muted-foreground">Photo</Label>
                        <img src={imageData} alt="Preview" className="w-full h-48 object-cover rounded-lg mt-2" />
                      </div>
                    )}
                    {audioData && (
                      <div>
                        <Label className="text-muted-foreground">Voice Note</Label>
                        <audio controls className="w-full mt-2">
                          <source src={audioData} />
                        </audio>
                      </div>
                    )}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm">
                          By submitting this report, you agree to our terms of service. Your report will be publicly visible and sent to the relevant department.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function getIcon(category: Category): string {
  const icons: Record<Category, string> = {
    [Category.ROADS]: '🚧',
    [Category.WASTE]: '🗑️',
    [Category.SAFETY]: '⚠️',
    [Category.LIGHTING]: '💡',
    [Category.OTHER]: '📝',
  }
  return icons[category]
}
