

# Daily Reminder App — Implementation Plan

## Overview
A professional, dashboard-style Daily Reminder application with task management, Google Calendar sync, browser notifications, and a polished UI suitable for a portfolio piece. Data persists via localStorage.

---

## Page 1: Dashboard (Home)
- **Sidebar navigation** with sections: Dashboard, All Tasks, Calendar View, Settings
- **Top bar** with search input, filter dropdowns (category, status), and dark/light mode toggle
- **Stats cards** showing: Total tasks, Completed today, Upcoming, Overdue
- **Main content area** with toggle between **list view** (grouped by date) and **card grid view**
- Each task displays: title, description, date/time, category badge (color-coded: Study=blue, Work=orange, Personal=purple, Health=green), and completion checkbox

## Page 2: Add/Edit Task
- Modal or slide-out form with fields: Title, Description, Date picker, Time picker, Category selector
- "Save & Add to Google Calendar" button (when connected)
- Form validation with clear error messages

## Task Management
- **Add** tasks via a prominent "+" button
- **Edit** tasks inline or via the modal
- **Delete** with confirmation dialog
- **Mark complete** with checkbox + strikethrough styling
- All data saved to **localStorage** automatically

## Search & Filter
- Real-time search by title/description
- Filter by category (Study, Work, Personal, Health)
- Filter by status (All, Active, Completed, Overdue)
- Date range filter

## Dark/Light Mode
- Toggle in the top bar
- Persisted preference in localStorage
- Smooth transition between themes

## Google Calendar Integration
- "Connect to Google Calendar" button in sidebar/settings
- Step-by-step setup guide displayed in a help section explaining how to create Google Cloud credentials
- OAuth 2.0 sign-in flow via popup
- Once connected: new tasks automatically create Google Calendar events
- Sync indicator showing connection status
- **Note:** Since this is a frontend-only app, the Google API client library will be used directly in the browser with a publishable client ID. Full setup instructions will be provided in-app.

## Browser Notifications
- On first visit, request notification permission
- Schedule notifications based on task date/time
- Toast notification fallback when browser notifications are denied

## Responsive Design
- Sidebar collapses to bottom nav on mobile
- Cards stack vertically on small screens
- Touch-friendly controls and spacing

## Visual Design
- Dashboard aesthetic with clean cards, subtle shadows, and consistent spacing
- Color-coded category system
- Progress indicators and completion animations
- Professional typography and iconography via Lucide icons

