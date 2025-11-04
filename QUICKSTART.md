# 🚀 VoiceUp Quick Start Guide

Get VoiceUp running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Mapbox API token ([Get one free here](https://account.mapbox.com/))

## Step 1: Install Dependencies

```bash
npm install
```

This will install all dependencies for the client, server, and shared packages.

## Step 2: Set Up Environment Variables

### Server Environment (`server/.env`)

Create a file at `server/.env` with:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=my-super-secret-jwt-key-for-hackathon
DATABASE_URL="file:./dev.db"
```

### Client Environment (`client/.env`)

Create a file at `client/.env` with:

```env
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN_HERE
```

**Important:** Replace `YOUR_MAPBOX_TOKEN_HERE` with your actual Mapbox token.

## Step 3: Initialize Database

```bash
# Go to server directory
cd server

# Create database and tables
npx prisma db push

# Seed with demo data (20+ reports)
npm run seed

# Go back to root
cd ..
```

## Step 4: Run the App

From the root directory:

```bash
npm run dev
```

This starts both the backend (port 3000) and frontend (port 5173).

## Step 5: Open and Explore

Open your browser to: **http://localhost:5173**

### Demo Accounts

**Admin:**
- Email: `admin@voiceup.com`
- Password: `admin123`

**User:**
- Email: `user@example.com`
- Password: `user123`

**Or report anonymously** - no login required!

---

## 🎉 That's It!

You now have a fully functional VoiceUp instance with:
- ✅ 20+ pre-seeded demo reports
- ✅ Interactive map with markers
- ✅ Full CRUD operations
- ✅ Admin dashboard
- ✅ Authentication system

## Quick Commands

```bash
# Start development servers
npm run dev

# Reset database with fresh data
npm run reset

# Build for production
npm run build

# View database in browser
cd server && npx prisma studio
```

## Troubleshooting

**Map not showing?**
- Check your Mapbox token in `client/.env`

**Port 3000 already in use?**
- Change `PORT` in `server/.env`
- Update `VITE_API_URL` in `client/.env` to match

**Database errors?**
- Try: `cd server && npm run reset`

---

## 📖 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the [API Documentation](README.md#api-documentation)
- Check out the [Demo Tips](README.md#hackathon-demo-tips) for presentations

Enjoy building with VoiceUp! 🎊
