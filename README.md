# 📣 VoiceUp - Civic Issue Reporting Platform

<div align="center">

![VoiceUp Banner](https://via.placeholder.com/1200x400/3B82F6/FFFFFF?text=VoiceUp+-+Make+Your+Community+Better)

**Empowering citizens to report and track civic issues in real-time**

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20SQLite-blue)](#tech-stack)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Demo](#demo-accounts) • [Screenshots](#screenshots)

</div>

---

## 🌟 Overview

VoiceUp is a modern civic engagement platform that bridges the gap between citizens and local government. Report potholes, waste management issues, safety concerns, and more - all with an intuitive interface featuring interactive maps, photo uploads, and voice notes.

Built for hackathons with a focus on **impressive demo capabilities** and **real-world usability**.

## ✨ Features

### 🎯 Core Features

- **📍 Interactive Map View**
  - Real-time issue markers with custom colors by category
  - Marker clustering for better visualization
  - Click-to-view detailed information
  - Smooth animations and flyTo transitions

- **📝 Multi-Step Report Creation**
  - Step 1: Interactive location picker with current location support
  - Step 2: Category selection with beautiful icons
  - Step 3: Photo upload (with compression) + Voice recording
  - Step 4: Review before submission with confetti celebration!

- **🗳️ Community Engagement**
  - Upvote issues that matter to you
  - Comment and discuss reported problems
  - Track issue status from New → In Progress → Resolved
  - Anonymous reporting option

- **👨‍💼 Admin Dashboard**
  - Real-time statistics with animated counters
  - Category distribution charts (Recharts)
  - Recent activity feed with auto-refresh
  - Quick status updates for reports

### 🎨 UI/UX Excellence

- ✅ Modern, responsive design with Tailwind CSS
- ✅ Dark mode support with smooth transitions
- ✅ Framer Motion animations throughout
- ✅ Glass-morphism effects and gradient accents
- ✅ Loading skeletons and empty states
- ✅ Toast notifications for user feedback
- ✅ PWA-ready with manifest and service worker

### 🛡️ Technical Features

- ✅ JWT authentication (email/password)
- ✅ Role-based access control (Citizen/Admin)
- ✅ Base64 image storage (no file system needed)
- ✅ Base64 audio storage for voice notes
- ✅ SQLite database with Prisma ORM
- ✅ TypeScript for type safety across full stack
- ✅ Shared types between frontend and backend

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Shadcn/ui components
- **Animations:** Framer Motion
- **Maps:** Mapbox GL JS
- **Charts:** Recharts
- **Routing:** React Router v6
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT + bcrypt
- **Validation:** Zod

### Developer Experience
- **Monorepo:** NPM workspaces
- **Type Sharing:** Shared TypeScript types package
- **Hot Reload:** Vite HMR + tsx watch mode
- **Code Quality:** TypeScript strict mode

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ installed
- NPM or Yarn package manager
- Mapbox API key (free tier works great!)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/voiceup.git
cd voiceup

# Install all dependencies
npm install
```

### 2. Environment Setup

**Server environment variables** (`server/.env`):
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-me-in-production
DATABASE_URL="file:./dev.db"
```

**Client environment variables** (`client/.env`):
```env
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

#### Getting a Mapbox Token

1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Sign up for a free account
3. Create a new access token
4. Copy and paste into `client/.env`

### 3. Database Setup

```bash
# Push the Prisma schema to create the database
cd server
npx prisma db push

# Seed with demo data (20+ realistic reports)
npm run seed
```

### 4. Run the Application

**Option 1: Run everything together (recommended)**
```bash
# From the root directory
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

---

## 👥 Demo Accounts

The seed script creates these accounts for testing:

**Admin Account:**
- Email: `admin@voiceup.com`
- Password: `admin123`
- Can change report statuses and view admin dashboard

**Citizen Account:**
- Email: `user@example.com`
- Password: `user123`
- Can create reports, comment, and upvote

**Anonymous Reporting:**
- No login required! Just go to `/report` and start reporting

---

## 📸 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/800x500/3B82F6/FFFFFF?text=Landing+Page+with+Animated+Hero)

### Interactive Map
![Map View](https://via.placeholder.com/800x500/10B981/FFFFFF?text=Interactive+Map+with+Markers)

### Multi-Step Report Form
![Report Form](https://via.placeholder.com/800x500/8B5CF6/FFFFFF?text=Multi-Step+Report+Form)

### Issue Feed
![Issue Feed](https://via.placeholder.com/800x500/F59E0B/FFFFFF?text=Masonry+Grid+Issue+Feed)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x500/EF4444/FFFFFF?text=Admin+Dashboard+with+Charts)

---

## 📁 Project Structure

```
voiceup/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # Shadcn/ui components
│   │   │   └── ...
│   │   ├── contexts/     # React contexts (Auth, Theme)
│   │   ├── lib/          # Utilities and API client
│   │   ├── pages/        # Route pages
│   │   │   ├── admin/   # Admin pages
│   │   │   └── ...
│   │   └── App.tsx       # Root component
│   ├── public/           # Static assets, PWA manifest
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   ├── seed.ts       # Database seeding
│   │   └── index.ts      # Server entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
│
├── shared/                # Shared TypeScript types
│   ├── src/
│   │   └── types.ts      # Shared interfaces and enums
│   └── package.json
│
└── package.json           # Root workspace config
```

---

## 🎮 Usage Guide

### Creating a Report

1. Navigate to "Report Issue" or `/report`
2. **Step 1:** Click on the map to select location (or use current location)
3. **Step 2:** Choose a category (Roads, Waste, Safety, Lighting, Other)
4. **Step 3:** Add title, description, photo, and/or voice note
5. **Step 4:** Review and submit (confetti celebration!)

### Admin Functions

1. Login as admin (`admin@voiceup.com` / `admin123`)
2. Access admin dashboard from user menu
3. View statistics and recent activity
4. Go to "Manage Reports" to update statuses
5. Change status: New → In Progress → Resolved

### Viewing Reports

- **Map View:** See all reports on an interactive map
- **Feed View:** Browse reports in a card grid with filters
- **Detail View:** Click any report to see full details, comments, and upvotes

---

## 🔧 Development

### Available Scripts

**Root (runs on all workspaces):**
```bash
npm run dev          # Run both client and server
npm run build        # Build for production
npm run seed         # Seed database
npm run reset        # Reset and re-seed database
```

**Client:**
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
```

**Server:**
```bash
npm run dev          # Start dev server (tsx watch)
npm run build        # Compile TypeScript
npm run start        # Run compiled code
npm run db:push      # Push Prisma schema
npm run db:studio    # Open Prisma Studio
```

### Database Management

```bash
# View/edit data in browser
cd server
npx prisma studio

# Reset database
npm run reset

# Generate Prisma client after schema changes
npx prisma generate
```

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Build the client:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the `client/dist` folder

3. Set environment variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_MAPBOX_TOKEN`: Your Mapbox token

### Backend (Render/Railway/Heroku)

1. Build the server:
   ```bash
   cd server
   npm run build
   ```

2. Set environment variables:
   - `PORT`: Server port
   - `NODE_ENV`: production
   - `JWT_SECRET`: Secure random string
   - `DATABASE_URL`: SQLite file path

3. Run Prisma migrations:
   ```bash
   npx prisma db push
   npm run seed
   ```

4. Start server:
   ```bash
   npm start
   ```

---

## 🎯 Hackathon Demo Tips

### Impressive Features to Show

1. **Live Map Updates:** Show markers appearing in real-time
2. **Multi-Step Form:** Demonstrate smooth transitions and progress bar
3. **Voice Recording:** Record a voice note and play it back
4. **Photo Upload:** Show image compression and preview
5. **Confetti Animation:** Submit a report for celebration effect
6. **Admin Dashboard:** Show live stats and status updates
7. **Dark Mode:** Toggle between light and dark themes
8. **Responsive Design:** Show mobile vs desktop views

### Demo Flow (5 minutes)

1. **Landing Page** (30s) - Show animated stats and hero
2. **Create Report** (1m 30s) - Go through all 4 steps
3. **Map View** (1m) - Show interactive map with filters
4. **Report Detail** (1m) - Demonstrate upvoting and commenting
5. **Admin Dashboard** (1m) - Show charts and status updates
6. **Wrap-up** (30s) - Mention PWA, dark mode, and tech stack

### Quick Database Reset

```bash
# Reset database with fresh demo data
npm run reset
```

---

## 🔮 Future Enhancements

- [ ] Email notifications for status updates
- [ ] SMS alerts for critical issues
- [ ] Advanced analytics dashboard
- [ ] Department assignment workflow
- [ ] Mobile apps (React Native)
- [ ] AI-powered category detection
- [ ] Multilingual support
- [ ] Integration with city management systems
- [ ] Heat map visualization
- [ ] Export reports to PDF/CSV
- [ ] Advanced search and filtering
- [ ] Report priority levels
- [ ] Before/After photo comparisons
- [ ] Public API for third-party integrations

---

## 📝 API Documentation

### Authentication

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Reports

**POST** `/api/reports/create`
```json
{
  "title": "Pothole on Main St",
  "description": "Large pothole causing damage",
  "category": "ROADS",
  "lat": 40.7589,
  "lng": -73.9851,
  "address": "123 Main St, New York, NY",
  "imageData": "data:image/jpeg;base64,...",
  "audioData": "data:audio/webm;base64,...",
  "anonymous": false
}
```

**GET** `/api/reports?category=ROADS&status=NEW&sortBy=newest`

**GET** `/api/reports/:id`

**POST** `/api/reports/:id/upvote` (requires auth)

**POST** `/api/reports/:id/comment` (requires auth)
```json
{
  "text": "This needs immediate attention!"
}
```

**PUT** `/api/reports/:id/status` (admin only)
```json
{
  "status": "IN_PROGRESS"
}
```

### Statistics

**GET** `/api/stats`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Shadcn/ui** for beautiful component primitives
- **Mapbox** for amazing mapping capabilities
- **Framer Motion** for smooth animations
- **Prisma** for excellent DX with databases
- **The open-source community** for inspiration and tools

---

## 💬 Support

Having issues? Here are some common solutions:

**Map not loading?**
- Check that `VITE_MAPBOX_TOKEN` is set in `client/.env`
- Verify your Mapbox token is valid

**Database errors?**
- Run `cd server && npx prisma db push`
- Try `npm run reset` to recreate the database

**Port already in use?**
- Change `PORT` in `server/.env`
- Update `VITE_API_URL` in `client/.env` to match

**Dependencies not installing?**
- Delete all `node_modules` folders
- Delete all `package-lock.json` files
- Run `npm install` from the root directory

---

<div align="center">

**Built with ❤️ for making communities better**

⭐ Star this repo if you found it helpful!

[Report Bug](https://github.com/yourusername/voiceup/issues) • [Request Feature](https://github.com/yourusername/voiceup/issues)

</div>
