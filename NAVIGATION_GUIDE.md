# Civic Issue Tracker - Navigation & Layout Guide

## Overview
This application now features a comprehensive mobile-first navigation system similar to modern social media apps, with WhatsApp-style camera interface and intuitive bottom navigation.

## Navigation Structure

### Bottom Navigation Bar
- **Home** 🏠: Main dashboard with greetings, announcements, and recent activity
- **Post** ➕: WhatsApp-style camera-first report creation
- **Posts** 📄: Tabbed view of user reports and area activity  
- **Profile** 👤: User settings, stats, and account management

## Screen Details

### 1. Home Screen (`/home`)
**Features:**
- Personalized greeting with user name and location
- Announcements section with municipal notifications
- "Your Reports" section showing recent 3 reports
- "Recent Area Activity" showing community reports
- Quick navigation to detailed views

**User Flow:**
- Landing page after login
- Quick access to create new reports
- Overview of personal and area activity
- Tap on any report to view details

### 2. Create Post Screen (`/create-post`)
**WhatsApp-Style Interface:**
- **Initial View**: Camera preview with gallery strip at top
- **Camera Mode**: Full-screen camera with capture button
- **Gallery Mode**: Grid view of device photos
- **Text Input**: Description with voice recording option
- **Submission**: Direct submit and navigate to report details

**Features:**
- Inbuilt camera integration
- Gallery selection with preview
- Voice note recording capability
- Text description with title
- Immediate submission with background AI processing

### 3. Posts Screen (`/posts`)
**Tabbed Interface:**
- **My Posts**: All reports created by the user
- **Area Posts**: Reports from user's municipality
- Search and filter functionality
- Status-based filtering (All, Submitted, In Progress, Resolved)

**Features:**
- Real-time search across titles and descriptions
- Filter by report status
- Detailed report cards with images
- Quick navigation to report details

### 4. Profile Screen (`/profile`)
**User Management:**
- Profile information with edit capability
- Statistics dashboard (Total, Resolved, Pending reports)
- Settings for notifications and privacy
- Logout functionality

**Sections:**
- Personal Information
- Report Statistics
- App Settings
- Support & Help

### 5. Report Details Screen (`/report/:id`)
**Enhanced Details:**
- Full report information with images
- Status and priority indicators
- Background AI-generated questions (if needed)
- Real-time updates and notifications
- Two-way communication with municipality

## Technical Implementation

### Route Structure
```javascript
/home              -> HomeScreen (default after login)
/create-post       -> CreatePostScreen (WhatsApp-style)
/posts             -> PostsScreen (tabbed view)
/profile           -> ProfileScreen (user management)
/report/:id        -> ReportDetails (enhanced details)
```

### Key Components
- `BottomNavigation.jsx`: Mobile-friendly navigation bar
- `LayoutWithBottomNav.jsx`: Layout wrapper for consistent bottom nav
- Individual screen components with responsive design

### Background Processing
- Reports submit immediately without blocking UI
- AI analysis happens in background
- PWA notifications for updates
- Questions appear on report details page when needed

## Mobile-First Design

### Responsive Features
- Touch-friendly interface
- Optimized for mobile screens
- Progressive Web App (PWA) capabilities
- Offline functionality with service workers

### Camera Integration
- WebRTC camera access
- Image capture and preview
- Gallery selection
- File upload fallback

### Voice Features
- WebAudio API for voice recording
- Audio playback controls
- Voice note attachment to reports

## User Experience Flow

### Report Creation Flow
1. **Home** → Tap "Post" or "Create Report"
2. **Camera Interface** → Take photo or select from gallery
3. **Text Input** → Add title, description, voice note
4. **Submit** → Immediate submission and navigation to details
5. **Background Processing** → AI analysis and questions (if needed)

### Report Management Flow
1. **Posts Screen** → View all reports with search/filter
2. **Report Details** → Full information and status updates
3. **Answer Questions** → If AI needs clarification
4. **Track Progress** → Real-time status updates

## Development Notes

### Environment Setup
```bash
npm install          # Install dependencies
npm run dev         # Start development server (port 5173)
npm run server      # Start JSON server (port 5000)
```

### Key Technologies
- React 19 with modern hooks
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- React Webcam for camera
- JSON Server for mock backend
- PWA with Vite plugin

### API Endpoints
- `GET /complaints` - Fetch reports
- `POST /complaints` - Create new report
- `PUT /complaints/:id` - Update report
- `GET /users` - User authentication
- Background analysis endpoints

## Future Enhancements

### Planned Features
- Push notifications for report updates
- Real-time chat with municipal staff
- Geolocation-based report filtering
- Photo editing and annotation
- Offline report creation with sync

### Performance Optimizations
- Image compression before upload
- Lazy loading for report lists
- Background sync for offline reports
- Service worker caching strategies

## Testing & Deployment

### Testing Checklist
- [ ] Camera functionality across devices
- [ ] Voice recording on mobile browsers
- [ ] Navigation flow completeness
- [ ] PWA installation and offline mode
- [ ] Background processing and notifications
- [ ] Responsive design on various screen sizes

### Deployment Considerations
- HTTPS required for camera/microphone access
- PWA manifest and service worker configuration
- Environment variables for API endpoints
- Image upload size limits and optimization

---

This navigation system provides a modern, intuitive experience for civic complaint management with focus on mobile usability and quick report creation.
