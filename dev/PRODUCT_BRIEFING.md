# How Long Since - Product Briefing

## Overview
"How Long Since" is a household and personal task management application focused on tracking *when* tasks were last completed rather than creating a to-do list. Unlike traditional task managers, this app answers the question "How long has it been since...?" for various responsibilities and activities. The app helps users identify suitable tasks based on available time and provides visual indicators for overdue tasks, all while maintaining high accessibility standards.

## Example Target Users
"How Long Since" serves diverse users with different needs and life stages:

1. **Busy Parents** (represented by Alex)
   - Healthcare professionals or others with demanding jobs
   - Managing both work and household responsibilities
   - Limited time windows for tasks
   - Need to reduce mental load and household management stress

2. **First-time Homeowners** (represented by Jordan)
   - Learning home maintenance rhythms and requirements
   - Managing pet care alongside home responsibilities
   - Building good habits for preventative maintenance
   - Working within budget constraints

3. **Active Retirees** (represented by Pat)
   - Tracking social connections and enrichment activities
   - Maintaining variety in retirement lifestyle
   - Balancing household tasks with hobbies and learning
   - May have accessibility needs like larger text or higher contrast

But remember these are research personas - not the only intended users of the app.

## Core User Story
"As a busy person with various responsibilities, I want to be able to track how long it's been since I performed certain tasks and identify opportunities to complete tasks within limited available time so that more tasks get done and the list doesn't feel overwhelming."

## Key Differentiators
- Focus on "time since last completion" rather than due dates
- Organization by both category and time commitment
- Simplicity and mobile-first design with high accessibility
- Quick task completion marking
- Flexible usage for household tasks, pet care, social activities, and more
- Personalized content and UI based on user needs

## Accessibility Commitment
"How Long Since" is committed to WCAG 2.1 Level AA compliance, with implementation phased across releases:

1. **Foundation (MVP)**
   - Semantic HTML structure
   - Keyboard navigation
   - Color contrast compliance
   - Screen reader compatibility for core functionality

2. **Enhanced Accessibility (Short Term)**
   - Advanced ARIA implementations
   - Additional non-visual indicators
   - Form error handling improvements
   - Touch target sizing optimization

3. **Accessibility Excellence (Future)**
   - User customization options (text size, spacing)
   - Advanced gesture alternatives
   - Refined focus management

## Functionality

### Primary Views
1. **Categorical Task List** (Main/Default View)
   - Tasks organized by category with color-coding
   - Each task displays:
     - Task name
     - Time elapsed since last completion
     - Estimated time commitment (visual indicator system)
   - Visual indicators for overdue tasks (color, icon, and border)
   - Checkbox for "Just Done" task completion

2. **Time Commitment View**
   - Same tasks organized by time required to complete
   - Helps answer "What can I do with 15 minutes?"
   - Tasks still show category and time elapsed
   - Same "Just Done" checkbox functionality

### Core Features
1. **Task Management**
   - Add new tasks with:
     - Task name
     - Category (with visual identifier)
     - Notes
     - Expected frequency
     - Estimated time commitment
   - Edit existing tasks (same interface as add)
   - Archive and delete tasks
   - Category management with customizable colors

2. **Task Completion**
   - One-tap "Just Done" checkbox for quick marking
   - Swipe gestures with non-gesture alternatives
   - Updates "last completed" timestamp automatically
   - Positive reinforcement messaging

3. **Visual Indicators**
   - Clear display of time elapsed since last completion
   - Multiple warning indicators for overdue tasks (not just color)
   - Categories with icons and colors for easy scanning
   - Time commitment visualization system

4. **User Experience**
   - Friendly but efficient content tone
   - Contextual help text
   - Clear error messages
   - Onboarding guidance for new users
   - Support for screen readers and keyboard navigation

5. **Data Management**
   - Import/export functionality
   - Backup reminders
   - Data persistence in offline mode

## Technical Specifications

### Data Storage
- Version 1: Single-user focus
- IndexedDB for client-side storage
- Service worker for offline functionality
- No authentication required initially

### Technology Stack
- Next.js with React framework
- TypeScript for type safety
- Tailwind CSS for styling
- PWA implementation

### User Interface
- Mobile-first responsive design
- Bottom-positioned "Add Task" button for thumb accessibility
- Easy toggle between category and time commitment views
- Adaptive layout for desktop (multi-column dashboard)
- Dark mode support
- High contrast mode option

### Data Structure
All views use the same underlying data models:

#### Task Entity
```
Task {
  id: string
  name: string
  description: string
  categoryId: string
  createdAt: Date
  lastCompletedAt: Date | null
  expectedFrequency: {value: number, unit: string} | null
  timeCommitment: '15min' | '30min' | '1hr' | '2hrs' | '4hrs' | '5hrs+'
  isArchived: boolean
  notes: string
}
```

#### Category Entity
```
Category {
  id: string
  name: string
  color: string
  isDefault: boolean
}
```

#### App Settings Entity
```
AppSettings {
  id: string
  lastBackupDate: Date | null
  currentView: 'category' | 'time'
  theme: 'light' | 'dark' | 'system'
}
```

## Feature Priority
1. **MVP (Version 1)**
   - Single-user functionality
   - Add, edit, archive, delete tasks
   - Mark tasks as complete
   - View tasks by category
   - Time elapsed indicators
   - Overdue warnings
   - Basic accessibility features
   - Data import/export

2. **Enhancements (Short Term)**
   - Time commitment view
   - Desktop-optimized layout
   - Enhanced accessibility features
   - Category management
   - User onboarding
   - Dark mode

3. **Future Considerations (Version 2+)**
   - User accounts
   - Shared task lists (family access)
   - Persona-based task templates
   - Push notifications
   - Calendar integration
   - Expanded accessibility customization

## Design Principles
- Simplicity over complexity
- Quick access over deep features
- Visual clarity with multiple indicators for status
- "Tap and go" interaction model for task completion
- Inclusive design for all abilities
- Content that reduces mental load

## Content Strategy
- Friendly but efficient tone
- Encouraging language for task completion
- Contextual help text
- Clear error messages
- Life-stage specific content approaches:
  - Efficiency-focused for busy parents
  - Educational for new homeowners
  - Life-enrichment focused for active retirees

## Branding Elements
- Color system with:
  - Primary app colors
  - Status indicators (overdue, completed)
  - Category color coding
- Typography system with clear hierarchy
- Consistent iconography
- Visual indicator systems for time commitment and elapsed time