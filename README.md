# 🚨 CrisisConnect — Rapid Crisis Response Platform

> **Open Innovation Platform for Coordinated Crisis Response**  
> Hackathon 2025 • React + Node.js + Leaflet.js

![CrisisConnect](https://img.shields.io/badge/CrisisConnect-Live-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-brightgreen?style=flat-square)

---

## 🌟 What is CrisisConnect?

CrisisConnect is a **web-based Open Innovation platform** that enables rapid, coordinated, and crowd-powered responses to crises — natural disasters, floods, pandemics, and humanitarian emergencies.

It bridges the gap between **affected communities**, **volunteers**, **NGOs**, and **government agencies** through a real-time collaborative ecosystem.

---

## 🎯 Key Features

| Module | Description |
|--------|-------------|
| 🗺️ **Live Crisis Map** | Interactive Leaflet map with 15+ crisis markers, severity color-coding, filters |
| 📋 **Crisis Reporting** | 3-step form with GPS location, photo upload, anonymous reporting |
| 👥 **Volunteer Hub** | Skill-based registration, smart matching engine, task board |
| 💡 **Innovation Hub** | Crowdsource ideas, voting system, status pipeline tracker |
| 📊 **Admin Dashboard** | Live stats, charts, CSV export, auto-refresh every 30s |
| 🔔 **Alerts System** | Broadcast alerts, severity filtering, multi-channel notifications |
| 🤖 **AI Chatbot** | Instant help — shelters, helplines, first aid, evacuation routes |
| 🆘 **SOS Button** | Emergency signal with GPS location to nearby responders |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Glassmorphism + 3D transforms) |
| Maps | Leaflet.js + react-leaflet |
| Backend | Node.js + Express.js |
| Database | JSON file storage |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Icons | Lucide React |
| Fonts | Google Fonts (Inter + Outfit) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- Git installed

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/crisisconnect.git
cd crisisconnect

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running Locally

```bash
# Terminal 1 — Start Backend (port 5000)
cd server
node index.js

# Terminal 2 — Start Frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
crisisconnect/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/             # 7 page components
│   │   ├── components/        # Chatbot, SOS Button
│   │   ├── App.jsx            # Router + Layout
│   │   └── index.css          # Complete design system
│   └── package.json
├── server/                    # Express Backend
│   ├── routes/                # 6 API route modules
│   ├── data/                  # Pre-seeded JSON data
│   └── index.js               # Server entry
└── README.md
```

---

## 🎨 Design Highlights

- **Dark Mode** UI with glassmorphism cards
- **3D animated hero** section with floating gradient orbs
- **Animated stat counters** and pulse glowing markers
- **CSS-only charts** — bar charts and conic-gradient donuts
- **Mobile-first** responsive design
- **Premium typography** — Outfit + Inter from Google Fonts

---

## 📊 Pre-Seeded Demo Data

- **15 active crises** across India (floods, earthquakes, cyclones, etc.)
- **20 volunteer profiles** with varied skills
- **10 innovation ideas** with votes and comments
- **8 alert broadcasts** from agencies
- **4 user accounts** (Admin, NGO, Volunteer, Government)

---

## 🤝 Contributing

This is a hackathon project. Feel free to fork and extend!

---

## 📄 License

MIT License — Open source for the community.

---

**Built with ❤️ for Hackathon 2025 — Turning Crisis Chaos into Coordination**
