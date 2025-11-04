import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Category, Status, Role } from '@shared/types'

const prisma = new PrismaClient()

const sampleReports = [
  {
    title: 'Large pothole on Main Street',
    description: 'Deep pothole causing damage to vehicles near the intersection of Main St and 5th Ave. Multiple cars have been damaged.',
    category: Category.ROADS,
    status: Status.NEW,
    lat: 40.7589,
    lng: -73.9851,
    address: 'Main St & 5th Ave, New York, NY',
    upvotes: 24,
  },
  {
    title: 'Overflowing trash bins in Central Park',
    description: 'Several trash bins near the south entrance are overflowing. Attracting pests and creating unsanitary conditions.',
    category: Category.WASTE,
    status: Status.IN_PROGRESS,
    lat: 40.7694,
    lng: -73.9787,
    address: 'Central Park South Entrance, New York, NY',
    upvotes: 15,
  },
  {
    title: 'Broken street light on Elm Street',
    description: 'Street light has been out for 3 weeks. Makes the area unsafe at night.',
    category: Category.LIGHTING,
    status: Status.NEW,
    lat: 40.7580,
    lng: -73.9900,
    address: '123 Elm Street, New York, NY',
    upvotes: 32,
  },
  {
    title: 'Dangerous intersection needs traffic light',
    description: 'Multiple near-miss accidents at this intersection. A traffic light or stop sign is urgently needed.',
    category: Category.SAFETY,
    status: Status.NEW,
    lat: 40.7614,
    lng: -73.9776,
    address: 'Park Ave & 52nd St, New York, NY',
    upvotes: 48,
  },
  {
    title: 'Graffiti on public building',
    description: 'Offensive graffiti on the side of the community center. Needs cleanup.',
    category: Category.OTHER,
    status: Status.RESOLVED,
    lat: 40.7550,
    lng: -73.9820,
    address: '456 Community Ave, New York, NY',
    upvotes: 8,
  },
  {
    title: 'Cracked sidewalk causing trip hazard',
    description: 'Severely cracked sidewalk on Oak Street. Multiple people have tripped and fallen.',
    category: Category.ROADS,
    status: Status.IN_PROGRESS,
    lat: 40.7600,
    lng: -73.9875,
    address: 'Oak Street, New York, NY',
    upvotes: 19,
  },
  {
    title: 'Illegal dumping in empty lot',
    description: 'Large amount of construction waste illegally dumped in the vacant lot on Pine Street.',
    category: Category.WASTE,
    status: Status.NEW,
    lat: 40.7565,
    lng: -73.9810,
    address: 'Pine Street Vacant Lot, New York, NY',
    upvotes: 27,
  },
  {
    title: 'Street light flickering constantly',
    description: 'Street light flickers all night, causing distraction to drivers and residents.',
    category: Category.LIGHTING,
    status: Status.NEW,
    lat: 40.7620,
    lng: -73.9790,
    address: 'Maple Drive, New York, NY',
    upvotes: 11,
  },
  {
    title: 'Abandoned vehicle on residential street',
    description: 'Car has been abandoned for over a month. Flat tires, covered in dust.',
    category: Category.OTHER,
    status: Status.NEW,
    lat: 40.7575,
    lng: -73.9865,
    address: 'Birch Lane, New York, NY',
    upvotes: 14,
  },
  {
    title: 'Missing crosswalk markings',
    description: 'Crosswalk markings have faded and are barely visible. Safety concern for pedestrians.',
    category: Category.SAFETY,
    status: Status.RESOLVED,
    lat: 40.7595,
    lng: -73.9835,
    address: 'Cedar St & Walnut Ave, New York, NY',
    upvotes: 22,
  },
  {
    title: 'Road sign knocked down',
    description: 'Stop sign at intersection knocked over by vehicle. Creating dangerous situation.',
    category: Category.SAFETY,
    status: Status.IN_PROGRESS,
    lat: 40.7610,
    lng: -73.9845,
    address: 'Willow St & Ash Blvd, New York, NY',
    upvotes: 35,
  },
  {
    title: 'Recycling bins not collected for 2 weeks',
    description: 'Recycling pickup has been missed repeatedly. Bins are overflowing.',
    category: Category.WASTE,
    status: Status.NEW,
    lat: 40.7585,
    lng: -73.9795,
    address: 'Cherry Street, New York, NY',
    upvotes: 18,
  },
  {
    title: 'Dark alley needs lighting',
    description: 'Alley behind shops has no lighting. Safety concern for workers and customers.',
    category: Category.LIGHTING,
    status: Status.NEW,
    lat: 40.7605,
    lng: -73.9880,
    address: 'Alley behind Main St Shops, New York, NY',
    upvotes: 29,
  },
  {
    title: 'Large tree branch hanging dangerously',
    description: 'Tree branch damaged in storm hanging over road. Could fall on vehicles.',
    category: Category.SAFETY,
    status: Status.IN_PROGRESS,
    lat: 40.7590,
    lng: -73.9760,
    address: 'Spruce Ave, New York, NY',
    upvotes: 41,
  },
  {
    title: 'Broken manhole cover',
    description: 'Manhole cover is cracked and making loud noise when vehicles pass over it.',
    category: Category.ROADS,
    status: Status.NEW,
    lat: 40.7555,
    lng: -73.9895,
    address: 'Poplar Street, New York, NY',
    upvotes: 16,
  },
  {
    title: 'Public bench vandalized',
    description: 'Park bench has been severely damaged and is unusable.',
    category: Category.OTHER,
    status: Status.RESOLVED,
    lat: 40.7615,
    lng: -73.9805,
    address: 'Riverside Park, New York, NY',
    upvotes: 9,
  },
  {
    title: 'Flooded storm drain',
    description: 'Storm drain is blocked causing flooding on the street during rain.',
    category: Category.ROADS,
    status: Status.NEW,
    lat: 40.7570,
    lng: -73.9840,
    address: 'Magnolia Drive, New York, NY',
    upvotes: 25,
  },
  {
    title: 'Bus stop shelter damaged',
    description: 'Glass panels in bus shelter are broken, making it unsafe.',
    category: Category.OTHER,
    status: Status.NEW,
    lat: 40.7625,
    lng: -73.9770,
    address: '3rd Ave Bus Stop, New York, NY',
    upvotes: 12,
  },
  {
    title: 'Faded road markings at school zone',
    description: 'School zone markings are barely visible. Safety concern for children.',
    category: Category.SAFETY,
    status: Status.NEW,
    lat: 40.7560,
    lng: -73.9855,
    address: 'School Zone, Hickory St, New York, NY',
    upvotes: 38,
  },
  {
    title: 'Broken fire hydrant leaking water',
    description: 'Fire hydrant is broken and continuously leaking water. Wasting resources.',
    category: Category.OTHER,
    status: Status.IN_PROGRESS,
    lat: 40.7580,
    lng: -73.9825,
    address: 'Sycamore Lane, New York, NY',
    upvotes: 21,
  },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@voiceup.com' },
    update: {},
    create: {
      email: 'admin@voiceup.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })
  console.log('✅ Created admin user (email: admin@voiceup.com, password: admin123)')

  // Create citizen user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      role: Role.CITIZEN,
    },
  })
  console.log('✅ Created citizen user (email: user@example.com, password: user123)')

  // Create reports
  console.log('📝 Creating sample reports...')
  for (const reportData of sampleReports) {
    // Randomly assign to user, admin, or anonymous
    const rand = Math.random()
    const userId = rand > 0.7 ? null : rand > 0.5 ? admin.id : user.id
    const anonymous = userId === null

    await prisma.report.create({
      data: {
        ...reportData,
        anonymous,
        userId,
      },
    })
  }
  console.log(`✅ Created ${sampleReports.length} sample reports`)

  // Add some comments
  console.log('💬 Adding sample comments...')
  const reports = await prisma.report.findMany({ take: 5 })
  const comments = [
    'This is a serious issue that needs immediate attention!',
    'I reported this same issue last month.',
    'Has anyone from the city responded to this?',
    'This affects my daily commute. Please fix it soon.',
    'Thank you for reporting this!',
  ]

  for (let i = 0; i < reports.length; i++) {
    await prisma.comment.create({
      data: {
        text: comments[i],
        reportId: reports[i].id,
        userId: i % 2 === 0 ? user.id : admin.id,
      },
    })
  }
  console.log('✅ Added sample comments')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
