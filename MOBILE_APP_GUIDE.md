# 📱 CrisisConnect Mobile App Guide

## Overview

CrisisConnect is now a **Progressive Web App (PWA)** that works on all devices and supports **push notifications** for real-time crisis alerts.

---

## 🚀 Getting Started

### Installation on Mobile

#### iOS (Safari)
1. Open https://crisesconnect1.onrender.com in Safari
2. Tap the **Share** button
3. Select **"Add to Home Screen"**
4. Name it **CrisisConnect**
5. Tap **"Add"**

#### Android (Chrome)
1. Open https://crisesconnect1.onrender.com in Chrome
2. Tap the **⋮** menu (three dots)
3. Select **"Install app"** or **"Add to Home Screen"**
4. Confirm installation

#### Desktop (Chrome, Edge, Firefox)
1. Open https://crisesconnect1.onrender.com
2. Click the **⊕** icon in the address bar (or menu)
3. Select **"Install CrisisConnect"**
4. Confirm

---

## 🔔 Push Notifications

### Enabling Notifications

When you first visit the app, you'll see a notification permission request:
- **Click "Allow"** to receive crisis alerts
- Without this, you won't get push notifications

### Permission Settings

#### iOS
- Settings > Apps > CrisisConnect > Notifications > Allow Notifications

#### Android
- Settings > Apps > CrisisConnect > Notifications > Allow

#### Desktop
- Browser Settings > Privacy > Notifications > CrisisConnect > Allow

---

## 📢 Broadcasting Alerts

### How to Send Alerts (Admin/NGO Users)

1. **Log in** to CrisisConnect
2. Go to **Alerts & Broadcasting** page
3. Fill in the form:
   - **Alert Title**: Brief summary (e.g., "Flood Warning")
   - **Alert Message**: Detailed information
   - **Severity**: Choose from:
     - 🔴 **Critical** - Life-threatening emergency
     - 🟠 **High** - Serious situation requiring immediate action
     - 🟡 **Medium** - Important but not urgent
     - 🟢 **Low** - General information
4. Click **"Broadcast to All"**
5. ✅ All users receive instant notifications!

### What Users See

**On Phone/Desktop (App Installed):**
- 🔔 **Push Notification** appears immediately
- ⏰ Works even if app is closed!

**On Browser:**
- 🔔 **Browser Notification** appears
- 💬 Click to view full details

---

## 🛠️ Features

| Feature | Desktop | Mobile Browser | Installed App |
|---------|---------|----------------|---------------|
| Live Crisis Map | ✅ | ✅ | ✅ |
| Report Crisis | ✅ | ✅ | ✅ |
| Volunteer Hub | ✅ | ✅ | ✅ |
| Ideas & Voting | ✅ | ✅ | ✅ |
| Admin Dashboard | ✅ | ✅ | ✅ |
| Broadcast Alerts | ✅ | ✅ | ✅ |
| **Push Notifications** | ✅ | ✅ | ✅ |
| **Offline Mode** | ✅ | ✅ | ✅ |
| **Home Screen Icon** | — | — | ✅ |
| **App Menu** | — | — | ✅ |

---

## 📡 Offline Functionality

CrisisConnect automatically caches data for offline access:

- ✅ View previously loaded crisis data
- ✅ See past broadcasts and alerts
- ✅ Access help information (chatbot, resources)
- ❌ Cannot submit new reports (requires internet)
- ❌ Cannot post new ideas (requires internet)

**How It Works:**
- First visit loads and caches data
- Service Worker stores information
- Automatically syncs when connection returns

---

## 🔐 Permissions

The app may request:

1. **Notifications** - For crisis alerts
   - ✅ **Allow** for emergency updates
2. **Location** - For crisis reporting (optional)
   - ✅ **Allow** to pin exact location
   - ❌ **Deny** to report anonymously
3. **Camera** - For photo uploads (optional)
   - ✅ **Allow** to attach crisis photos

---

## 🐛 Troubleshooting

### Not Receiving Notifications?

**iPhone:**
- Check Settings > Notifications > CrisisConnect is enabled
- Ensure **"Allow Notifications"** is ON
- Try clearing app cache

**Android:**
- Go to Settings > Apps > CrisisConnect > Notifications
- Toggle **Allow notifications** OFF and ON

**Desktop:**
- Check browser notifications are enabled
- Allow CrisisConnect in browser permissions
- Refresh the page

### App Not Installing?

**iOS:**
- Must use Safari (not Chrome)
- Try clearing browser cache
- Ensure you're on HTTPS (not HTTP)

**Android:**
- Use Chrome (not Firefox/Safari)
- Check internet connection
- Restart browser

### Performance Issues?

- Clear app cache: Settings > Apps > CrisisConnect > Storage > Clear Cache
- Update browser to latest version
- Restart your device
- Check internet connection speed

---

## 📊 Data Usage

- **Initial Download:** ~5-10 MB
- **Per Broadcast Alert:** ~1 KB
- **Monthly (avg):** ~15-20 MB
- **Works offline:** Yes ✅

---

## 🔗 Useful Links

- **Website:** https://crisesconnect1.onrender.com
- **GitHub:** https://github.com/shaurya-singh007/crisesconnect1
- **Report Issue:** Create GitHub issue
- **Contact:** See GitHub repository

---

## 💡 Tips & Best Practices

1. **Keep App Updated**
   - Enable auto-updates in app settings
   - Check GitHub for new versions

2. **Enable Notifications**
   - Don't miss critical crisis alerts
   - Adjust notification sounds in settings

3. **Battery Life**
   - PWA uses minimal battery
   - Background sync is efficient
   - Similar to native apps

4. **Storage**
   - App uses ~50-100 MB on device
   - Automatically manages cache
   - Can be uninstalled like any app

5. **Security**
   - HTTPS encrypted connection
   - JWT authentication
   - No personal data stored locally

---

## 🎯 Quick Reference

| Task | Steps |
|------|-------|
| **Install App** | Open URL > Share > Add to Home Screen |
| **Enable Notifications** | Open App > Allow when prompted |
| **Send Alert** | Alerts > Fill form > Broadcast |
| **View Broadcasts** | Alerts > Scroll down |
| **Update App** | Browser > Check for updates |
| **Uninstall** | Long-press icon > Remove |

---

## 📞 Support

For help:
1. Check this guide first
2. Visit GitHub Issues
3. Contact administrator
4. Check system status at `/api/health`

---

**Last Updated:** 2026-04-21 18:01:32  
**Version:** 1.0.0 (PWA + Notifications)