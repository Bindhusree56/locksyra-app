# 🛡️ LockSyra - Your Free Security Guardian

![LockSyra Banner](https://img.shields.io/badge/Security-Guardian-8B5CF6?style=for-the-badge&logo=shield&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**🌐 Live Demo:** [https://locksyra.netlify.app](https://locksyra.netlify.app)

> AI-Powered Security Toolkit for Students • Free Forever • No Credit Card Required

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Integrations](#-api-integrations)
- [Mobile Features](#-mobile-features)
- [Backend Architecture](#-backend-architecture)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Overview

**LockSyra** is a comprehensive, student-focused security application that provides enterprise-grade security tools completely free. Built with React and powered by Claude AI, it offers real-time threat detection, breach monitoring, password management, and AI-powered security insights.

### Why LockSyra?

- 🎓 **Built for Students:** Free forever with no hidden costs
- 🤖 **AI-Powered:** Claude AI integration for intelligent security analysis
- 🔒 **Privacy-First:** All data processed locally, never stored
- 📱 **Cross-Platform:** Works on web, iOS, and Android
- 🌍 **Offline Capable:** Core features work without internet

---

## ✨ Key Features

### 🔍 Security Monitoring

- **Real-Time Breach Detection**
  - Check emails against 10B+ breach records (HIBP API)
  - Password compromise checking with k-anonymity
  - Historical breach timeline visualization
  - Google Sheets integration for breach logging

### 🎣 Phishing Protection

- **URL Scanner**
  - Real-time phishing URL detection
  - Risk scoring (0-100)
  - Malware and suspicious content detection
  - Scan history tracking
  - Educational tips on spotting phishing

### 🔐 Password Management

- **Secure Vault**
  - Encrypted password storage (AES-256-GCM)
  - Password strength analyzer
  - Breach checking for stored passwords
  - Duplicate password detection
  - One-click password generation
  - Security audit reports

### 📰 Security News Feed

- **Stay Informed**
  - Live security news from trusted sources
  - Category filtering (breaches, vulnerabilities, malware)
  - Trending threat analysis
  - Customizable alert preferences

### 🤖 AI Analysis

- **Claude AI Integration**
  - Personalized security recommendations
  - Behavior pattern analysis
  - Actionable security insights
  - Natural language security tips

### 🎯 Gamification

- **Engagement Features**
  - Security score tracking
  - Daily streak system
  - Achievement badges
  - Progress visualization

---

## 🛠️ Tech Stack

### Frontend

- **React 18.2** - UI Framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Capacitor** - Mobile wrapper

### Backend

- **Node.js + Express** - Server
- **PostgreSQL + Sequelize** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Winston** - Logging

### APIs & Services

- **Claude AI (Anthropic)** - AI analysis
- **HIBP (HaveIBeenPwned)** - Breach checking
- **IPQualityScore** - Phishing detection
- **RSS2JSON** - News aggregation
- **Firebase** - Analytics

### Mobile Features

- **Capacitor Plugins:**
  - Status Bar
  - Splash Screen
  - Haptics
  - Biometric Auth
  - App State Management

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
postgresql >= 14.0
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Bindhusree56/locksyra-app.git
cd locksyra
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Environment Setup**

Create `.env` in the root directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_IPQS_API_KEY=your_ipqs_key
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Database
DB_NAME=locksyra_db
DB_USER=locksyra_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# JWT Secrets
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Encryption
ENCRYPTION_KEY=your_64_character_hex_key_here
ENCRYPTION_ALGORITHM=aes-256-gcm

# APIs (Optional but recommended)
HIBP_API_KEY=your_hibp_key
IPQS_API_KEY=your_ipqs_key

# CORS
CORS_ORIGIN=http://localhost:3000
```

5. **Database Setup**
```bash
# Create PostgreSQL database
createdb locksyra_db

# Run migrations
cd backend
psql locksyra_db < ../database/schema.sql
cd ..
```

6. **Start Development Servers**

Terminal 1 (Frontend):
```bash
npm start
```

Terminal 2 (Backend):
```bash
cd backend
npm run dev
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
# Frontend build
npm run build

# Backend (uses NODE_ENV=production)
cd backend
npm start
```

---

## 📁 Project Structure

```
locksyra/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication
│   │   ├── breach/       # Breach monitoring
│   │   ├── security/     # Security tools
│   │   ├── dashboard/    # Dashboard cards
│   │   ├── education/    # Learning center
│   │   └── settings/     # Settings panel
│   ├── utils/            # Utility functions
│   │   ├── breachUtils.js
│   │   ├── mobileFeatures.js
│   │   └── riskColors.js
│   ├── App.js            # Main app component
│   └── index.js          # Entry point
├── backend/
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   └── utils/        # Backend utilities
│   └── package.json
├── database/
│   └── schema.sql        # Database schema
└── android/              # Android native files
```

---

## 🔌 API Integrations

### Claude AI (Anthropic)

**Purpose:** Intelligent security analysis and recommendations

**Setup:**
- No API key needed in artifacts
- Uses direct endpoint: `https://api.anthropic.com/v1/messages`

**Usage:**
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: "Your prompt" }]
  })
});
```

### HaveIBeenPwned (HIBP)

**Purpose:** Email and password breach checking

**Free Tier:**
- Password API: Unlimited (anonymous)
- Email API: Requires key (free for individuals)

**Signup:** [haveibeenpwned.com/API/Key](https://haveibeenpwned.com/API/Key)

### IPQualityScore

**Purpose:** URL phishing detection

**Free Tier:** 5,000 requests/month

**Signup:** [ipqualityscore.com](https://www.ipqualityscore.com/create-account)

### RSS2JSON

**Purpose:** Convert RSS feeds to JSON for news

**Free Tier:** 10,000 requests/day (no signup needed)

**Endpoint:** `https://api.rss2json.com/v1/api.json`

---

## 📱 Mobile Features

### Capacitor Setup

1. **Add iOS Platform**
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

2. **Add Android Platform**
```bash
npx cap add android
npx cap sync android
npx cap open android
```

### Available Mobile Features

- ✅ Status Bar customization
- ✅ Splash Screen
- ✅ Haptic feedback
- ✅ Back button handling (Android)
- ✅ Biometric authentication
- ✅ Network status monitoring
- ✅ Share functionality
- ✅ Push notifications

### Build for Mobile

**Android:**
```bash
npm run build
npx cap sync android
npx cap open android
# Build in Android Studio
```

**iOS:**
```bash
npm run build
npx cap sync ios
npx cap open ios
# Build in Xcode
```

---

## 🗄️ Backend Architecture

### Database Schema

**Users Table:**
- UUID primary keys
- Bcrypt password hashing
- JWT refresh token storage
- Login attempt tracking
- 2FA support

**Breach Checks Table:**
- User breach history
- JSONB breach details
- IP and user agent logging

**Security Logs Table:**
- Comprehensive audit trail
- Severity levels
- Action tracking

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

**Breach Monitoring:**
- `POST /api/breach/check-email` - Check email
- `POST /api/breach/check-password` - Check password
- `GET /api/breach/history` - Get check history

**Security:**
- `GET /api/security/news` - Get security news
- `POST /api/security/ai-analysis` - AI insights
- `GET /api/security/logs` - User security logs

**Phishing:**
- `POST /api/phishing/check-url` - Scan URL

### Security Features

- Rate limiting (express-rate-limit)
- Helmet.js security headers
- CORS configuration
- Input validation (express-validator)
- SQL injection protection (Sequelize)
- XSS protection
- Password complexity requirements
- Account lockout after failed attempts

---

## 🌐 Deployment

### Frontend (Netlify)

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: build
   ```

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.herokuapp.com
   REACT_APP_IPQS_API_KEY=your_key
   ```

4. **Deploy**
   - Push to main branch
   - Automatic deployment

**Live URL:** [https://locksyra.netlify.app](https://locksyra.netlify.app)

### Backend (Heroku)

1. **Create Heroku App**
```bash
heroku create locksyra-api
```

2. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:mini
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set ENCRYPTION_KEY=your_key
# ... other variables
```

4. **Deploy**
```bash
git subtree push --prefix backend heroku main
```

### Alternative: Render.com

1. Create new Web Service
2. Connect repository
3. Set build command: `cd backend && npm install`
4. Set start command: `node src/server.js`
5. Add environment variables
6. Deploy

---


## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 LockSyra Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📞 Contact

**Project Team:**
- Email: bindhusree564@gmail.com


## 🙏 Acknowledgments

- [Anthropic Claude AI](https://anthropic.com) - AI-powered analysis
- [Have I Been Pwned](https://haveibeenpwned.com) - Breach data
- [IPQualityScore](https://ipqualityscore.com) - URL scanning
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Lucide Icons](https://lucide.dev) - Icon library
- [React](https://react.dev) - Frontend framework
- [Capacitor](https://capacitorjs.com) - Mobile wrapper

---
---


---

**Made with ❤️ for students by students**

🛡️ Stay Safe. Stay Secure. Stay with LockSyra.