import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Resetting database...')

  // Delete all data
  console.log('🗑️  Deleting existing data...')
  await prisma.upvote.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ All data deleted')

  // Re-seed
  console.log('🌱 Re-seeding database...')
  await execAsync('npm run seed')

  console.log('🎉 Database reset complete!')
}

main()
  .catch((e) => {
    console.error('❌ Reset error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
