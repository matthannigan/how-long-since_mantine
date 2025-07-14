# How Long Since - Technical Specification Document

## 1. Project Overview

### 1.1 Application Purpose
"How Long Since" is a household task management application that focuses on tracking when tasks were last completed rather than traditional to-do lists. The app helps users identify suitable tasks based on their available time and provides visual indicators for overdue tasks.

### 1.2 Target Audience
Busy individuals managing multiple household responsibilities who want to:
- Track when they last completed recurring tasks
- Identify tasks that fit their available time windows
- Reduce the overwhelming feeling of household maintenance

Our primary personas include:
- **Busy Parents (Alex)**: Healthcare professionals or others with demanding jobs, managing both work and household responsibilities
- **First-time Homeowners (Jordan)**: Learning home maintenance rhythms and requirements, managing pet care alongside home responsibilities
- **Active Retirees (Pat)**: Tracking social connections and enrichment activities, maintaining variety in retirement lifestyle

### 1.3 Core User Story
"As a busy person with lots of household tasks, I want to be able to track how long it's been since I performed certain tasks and identify opportunities to complete tasks within limited available time so that more tasks get done and the list doesn't feel overwhelming."

## 2. Technical Architecture

### 2.1 Technology Stack
- **Frontend Framework**: Next.js v15 with React v19
- **Styling**: Mantine v3
- **Data Storage**: IndexedDB for client-side storage
- **Deployment**: GitHub Actions for CI/CD
- **Type Safety**: TypeScript
- **Application Type**: Progressive Web App (PWA)

### 2.2 Development Environment
- Local development on Mac with command-line tools
- Package management via npm or pnpm
- Version control through GitHub repository
- Non-production Docker server for staging deployment

### 2.3 Code Organization
```
/src
  /components     # Reusable UI components
    /ui           # Base UI components
    /forms        # Form components for task management
    /layouts      # Layout components
  /hooks          # Custom React hooks
  /lib            # Utility functions and services
    /db           # IndexedDB service
    /tasks        # Task-related utilities
  /pages          # Next.js pages
  /public         # Static assets
  /styles         # Global styles
  /types          # TypeScript type definitions
  /docs           # Documentation for developers and users
```

## 3. Data Model

### 3.1 Task Entity
```typescript
interface Task {
  id: string;                     // Unique identifier
  name: string;                   // Task name (128 char max)
  description: string;            // Task description (512 char max)
  categoryId: string;             // Reference to category
  createdAt: Date;                // Creation timestamp
  lastCompletedAt: Date | null;   // Last completion timestamp
  expectedFrequency?: {           // Optional frequency
    value: number;
    unit: 'day' | 'week' | 'month' | 'year';
  };
  timeCommitment?: '15min' | '30min' | '1hr' | '2hrs' | '4hrs' | '5hrs+'; // Time required (OPTIONAL)
  isArchived: boolean;            // Archive status
  notes: string;                  // Additional notes (512 char max)
}
```

### 3.2 Category Entity
```typescript
interface Category {
  id: string;                     // Unique identifier
  name: string;                   // Category name
  color?: string;                 // Optional color code
  icon?: string;                  // Optional icon reference
  isDefault: boolean;             // Is this a default category
}
```

### 3.3 App Settings Entity
```typescript
interface AppSettings {
  id: string;                     // Always '1' for singleton
  lastBackupDate: Date | null;    // Last export date
  currentView: 'category' | 'time'; // Last used view
  theme: 'light' | 'dark' | 'system'; // Theme preference
  textSize?: 'default' | 'large' | 'larger'; // Text size preference
  highContrast?: boolean;         // High contrast mode
  reducedMotion?: boolean;        // Reduced motion preference
  personaPreference?: 'busy-parent' | 'homeowner' | 'active-retiree'; // User persona preference
}
```

### 3.4 Persona-Specific Data Models

#### 3.4.1 Pet Care (For Jordan)
```typescript
interface PetProfile {
  id: string;                     // Unique identifier
  name: string;                   // Pet name
  type: string;                   // Type of pet
  tasks: string[];                // Associated task IDs
}
```

#### 3.4.2 Social Connections (For Pat)
```typescript
interface SocialConnection {
  id: string;                     // Unique identifier
  name: string;                   // Person or group name
  relationshipType: string;       // Family, Friend, etc.
  lastContactedAt: Date | null;   // Last contact timestamp
  preferredContactMethod: string; // Call, Visit, Email, etc.
}
```

#### 3.4.3 Child-Related Tasks (For Alex)
```typescript
interface ChildProfile {
  id: string;                     // Unique identifier
  name: string;                   // Child name
  age: number;                    // Child age
  schoolTasks: string[];          // School-related task IDs
  healthTasks: string[];          // Health-related task IDs
  activityTasks: string[];        // Activity-related task IDs
}
```

## 4. Core Functionality

### 4.1 Task Management
- Add new tasks with validation for required fields
- Edit existing tasks
- Archive tasks to keep the active list manageable
- Delete tasks permanently

#### 4.1.1 Task Form Fields
- Task name (required, 128 char max)
- Description (optional, 512 char max)
- Category (required, selection from existing or option to create new)
- Expected frequency (optional):
  - Numeric input (1, 2, 3, etc.)
  - Unit dropdown (days, weeks, months, years)
- Time commitment (optional, selection from predefined options)
- Notes (optional, 512 char max)

### 4.2 Task Completion
- Mark tasks as complete with a single tap/click
- Support swipe-right gesture on mobile for marking complete
  - Alternative: "Just Done" button for accessibility
- Support swipe-left gesture on mobile for editing task
  - Alternative: Edit button for accessibility
- Automatically update lastCompletedAt timestamp

### 4.3 Task Views
- **Category View**: Tasks grouped by category
- **Time Commitment View**: Tasks grouped by time required
  - Tasks without time commitment appear at bottom, after 5+ hour tasks
- Each view displays:
  - Task name
  - Time elapsed since last completion
  - Expected time commitment (when specified)
  - Visual overdue indicator when applicable

### 4.4 Overdue Calculation
- If task has expectedFrequency:
  - Calculate due date: lastCompletedAt + expectedFrequency
  - Mark as overdue if due date < current date
- If no expectedFrequency is set:
  - No overdue status is applied

### 4.5 Time Elapsed Display
- Format time elapsed in user-friendly terms:
  - "Just now" (< 1 hour)
  - "X hours ago" (< 24 hours)
  - "Yesterday" (< 48 hours)
  - "X days ago" (< 7 days)
  - "X weeks ago" (< 30 days)
  - "X months ago" (< 365 days)
  - "X years ago" (≥ 365 days)

### 4.6 Data Import/Export
- **CSV Export**: Generate downloadable CSV file with task data
- **CSV Import**: Parse and validate CSV files against a provided template
- **JSON Export**: Complete backup of all app data (tasks, categories, settings)
- **JSON Import**: Restore app from backup

### 4.7 Persona-Specific Features

#### 4.7.1 Busy Parent Features (Alex)
- Task batching for completing multiple related tasks efficiently
- Quick wins section highlighting 5-15 minute tasks
- Morning/evening view adaptations for busy schedules
- Child-related task categories (Education, Health, Activities)
- "Quick Pick" feature for limited time windows between commitments

#### 4.7.2 New Homeowner Features (Jordan)
- Home maintenance schedule recommendations
- Pet care integration with task tracking
- Seasonal maintenance bundled tasks
- Maintenance education with brief task descriptions
- Budget-conscious planning features

#### 4.7.3 Active Retiree Features (Pat)
- Social connections tracking
- Hobby and enrichment activity tracking
- Balance visualization between maintenance and enjoyment tasks
- Enhanced accessibility features (larger text, higher contrast)
- Focus on variety and new experiences

### 4.8 Context-Sensitive UI Adaptations

#### 4.8.1 Time-Based Adaptations
- Morning view emphasizes quick start tasks
- Evening view prioritizes lower-energy tasks
- Weekend view focuses on longer time commitment tasks

#### 4.8.2 Behavior Pattern Recognition
- Highlight frequently completed task categories
- Adjust category order based on usage patterns
- Offer "Your Rhythm" section showing personal task completion patterns

#### 4.8.3 Time Availability Matching
- "Quick Pick" section that filters tasks matching user's current available time
- Visual highlighting of tasks that can be completed together
- Smart ordering that prioritizes seasonal or time-sensitive tasks

## 5. User Interface

### 5.1 General UI Principles
- Mobile-first responsive design
- Bottom navigation for primary actions
- Accessibility compliance with WCAG Level AA
- Responsive layout for desktop views
- Touch-friendly large tap targets for mobile users

### 5.2 Main Task List
- Default grouped by category
- Each task displays:
  - Task name
  - Time elapsed since last completion (prominently displayed)
  - Expected time commitment (when specified)
  - Subtle red indicator for overdue tasks
- Quick-action buttons/gestures:
  - Checkbox for "Just Done"
  - Swipe right to mark complete
  - Swipe left to edit

### 5.3 Add/Edit Task Form
- Modal dialog or dedicated page
- Form validation with clear error messages
- Required fields clearly marked
- Cancel and Save buttons

### 5.4 Category Management
- List of existing categories
- Add, edit, delete options
- Color selection for visual distinction
- Icon selection with predictive matching based on category name

### 5.5 User Onboarding
- Guided tutorial focused on core functionality:
  - Adding tasks
  - Marking tasks as complete
  - Switching between category and time views
  - Editing categories
  - Adding detailed task information

### 5.6 UI Component Patterns

#### 5.6.1 Buttons
- **Primary Button**
  - Background: Primary Blue (#2563EB)
  - Text: White
  - Padding: 12px 16px
  - Border Radius: 8px
  - Height: 48px (mobile-friendly tap target)

- **Secondary Button**
  - Background: White
  - Border: 1px solid Neutral Gray (#6B7280)
  - Text: Dark Gray (#1F2937)
  - Same dimensions as Primary

- **Icon Button**
  - Size: 44px × 44px (accessible tap target)
  - Border Radius: 8px or circle
  - Visual feedback on hover/press

#### 5.6.2 Task Cards
- Background: White
- Border: 1px solid light gray (#E5E7EB)
- Border Radius: 8px
- Padding: 16px
- Shadow: subtle for depth (0 1px 3px rgba(0,0,0,0.1))
- Layout: 
  - Task name (left-aligned)
  - Time elapsed (prominent, right-aligned)
  - Time commitment indicator (bottom left)
  - "Just Done" checkbox (right)

#### 5.6.3 Form Elements
- **Text Inputs**
  - Height: 48px
  - Border: 1px solid Neutral Gray
  - Border Radius: 8px
  - Padding: 12px 16px
  - Focus state: Primary Blue outline

- **Dropdowns/Selects**
  - Same styling as text inputs
  - Clear dropdown icon
  - Expanded state with sufficient contrast

- **Checkboxes**
  - Size: 24px × 24px (mobile-friendly)
  - Unchecked: 1px border, white background
  - Checked: Primary Blue background, white checkmark

#### 5.6.4 Navigation
- **Bottom Navigation Bar**
  - Height: 64px
  - Background: White
  - Shadow: subtle for depth
  - Icon size: 24px × 24px
  - Text labels: Small type
  - Active state: Primary Blue
  - Inactive state: Neutral Gray

### 5.7 Visual Indicators

#### 5.7.1 Time Commitment Indicators
Use a circle-based visual system:
- **15min**: Single filled circle
- **30min**: Two filled circles
- **1hr**: Three filled circles
- **2hrs**: Four filled circles
- **4hrs**: Five filled circles
- **5hrs+**: Five filled circles + "+"
- **No time commitment specified**: Text indicating "Time: Unknown"

#### 5.7.2 Overdue Task Indicators
Use multiple indicators to ensure accessibility:
- Text color changes to Overdue Red (#DC2626)
- Small alert icon (!) appears next to elapsed time
- Subtle red border on left side of task card (3px)
- Screen reader announcement of overdue status

#### 5.7.3 Time Elapsed Indicators
- **Just Now** (< 1 hour): Small green dot indicator
- **Today** (< 24 hours): Regular text, no special indicator
- **Yesterday** (< 48 hours): Regular text, no special indicator
- **This Week** (< 7 days): Regular text, no special indicator
- **Weeks/Months Ago**: Regular text, no special indicator
- **Overdue**: Text in Overdue Red with subtle alert icon

## 6. Data Persistence

### 6.1 IndexedDB Configuration
- Database name: "HowLongSinceDB"
- Database version: 1
- Object stores:
  - tasks
  - categories
  - settings
  - petProfiles (for Jordan persona)
  - socialConnections (for Pat persona)
  - childProfiles (for Alex persona)

### 6.2 Data Service Layer
- Create abstraction services for:
  - TaskService
  - CategoryService
  - SettingsService
  - PersonaService (for persona-specific data)
- Each service should handle:
  - CRUD operations
  - Data validation
  - Error handling

### 6.3 Offline Functionality
- Service worker implementation for PWA
- Cache static assets
- Allow full app functionality without internet connection
- Local-first data approach with IndexedDB

### 6.4 Data Backup Prompts
- Remind users to back up data every 2 weeks
- Track last backup date in settings
- Provide simple export button in reminders

## 7. Error Handling

### 7.1 Form Validation
- Client-side validation before submission
- Clear error messages with suggested fixes
- Focus management for accessibility

### 7.2 Data Validation
- Enforce character limits on task name (128) and description (512)
- Prevent duplicate category names
- Validate import file formats

### 7.3 Import Errors
- Validate CSV structure before processing
- Provide specific error messages for data issues
- Suggest smaller import chunks if large files fail

### 7.4 Storage Errors
- Handle IndexedDB failures gracefully
- Provide recovery suggestions
- Auto-retry strategies for transient errors

### 7.5 Error Message Guidelines

#### 7.5.1 Error Message Structure
1. What happened (clear statement of the error)
2. Why it matters (impact on the user, if needed)
3. What to do next (suggested action)

#### 7.5.2 Error Message Examples
- Empty required field: "Please add a task name."
- Character limit: "Task name is too long. Max 128 characters."
- Invalid data: "Please enter a valid [field type]."
- Duplicate task: "This task already exists."
- Cannot delete: "Cannot delete the default category. Try editing it instead."
- Cannot save: "Changes couldn't be saved. Try again."

## 8. Performance Considerations

### 8.1 Data Limitations
- Character limits on text fields
- Archive functionality for old tasks
- Pagination for large task lists

### 8.2 Rendering Optimization
- React component memoization
- Virtualized lists for performance with many tasks
- Lazy loading for less critical functionality

### 8.3 Critical Metrics
- Time to Interactive < 3 seconds
- First Contentful Paint < 1.5 seconds
- Smooth 60fps animations and transitions

### 8.4 Accessibility Performance Metrics
- Screen reader announcement timing < 500ms after state change
- Keyboard navigation: maximum 5 tab stops to reach primary actions
- Touch response time < 300ms for motor-impaired users
- Focus movement within 200ms of user action

## 9. Security Considerations

### 9.1 Data Protection
- IndexedDB browser sandboxing for data isolation
- Input sanitization for all user-entered content
- Future consideration: Password protection for exports

### 9.2 Code Security
- Regular dependency updates
- Static code analysis in CI/CD pipeline
- No sensitive data in client-side code

## 10. Testing Strategy

### 10.1 Unit Testing
- Jest for JavaScript/TypeScript testing
- React Testing Library for component tests
- Test coverage targets:
  - Critical business logic: 90%+
  - UI components: 70%+
  - Data services: 80%+

### 10.2 Integration Testing
- End-to-end tests for critical user flows:
  - Task creation and completion
  - Category management
  - Data import/export
- Mock IndexedDB for reliable testing

### 10.3 Performance Testing
- Lighthouse CI integration
- Bundle size monitoring
- Rendering performance benchmarks

### 10.4 Persona-Specific Testing
- Test scenarios for each persona:
  - Alex (Busy Parent): Task batching, quick wins, child-related task management
  - Jordan (Homeowner): Home maintenance scheduling, pet care integration
  - Pat (Active Retiree): Social connection tracking, accessibility features

### 10.5 Accessibility Testing
- Automated testing with axe-core
- Manual testing with screen readers (NVDA, VoiceOver, JAWS)
- Keyboard navigation testing
- Touch target size verification
- Color contrast validation
- Test with assistive technologies

### 10.6 Content Testing
- Verify content tone matches guidelines
- Test error messages for clarity
- Validate help text usefulness
- Test cognitive load reduction features

## 11. Accessibility (WCAG AA Compliance)

### 11.1 Key Requirements
- Sufficient color contrast (4.5:1 for normal text)
- Keyboard navigation for all functionality
- Screen reader compatibility
- Focus management
- Descriptive ARIA attributes
- Resizable text without breaking layouts

### 11.2 Testing Tools
- axe-core for automated accessibility testing
- Manual testing with screen readers
- Keyboard navigation testing

### 11.3 Phased Implementation Approach

#### 11.3.1 Foundation (MVP)
- Basic keyboard navigation
- Proper semantic HTML structure
- Color contrast compliance
- Screen reader compatibility for core functionality
- Touch target sizing

#### 11.3.2 Enhanced Accessibility (Short Term)
- Advanced ARIA implementations
- Additional non-visual indicators
- Keyboard shortcuts
- Complete screen reader optimization
- Form error handling improvements

#### 11.3.3 Accessibility Excellence (Future)
- User customization options (text size, spacing, etc.)
- Advanced gesture alternatives
- Comprehensive user testing with diverse disabilities
- Refined focus management
- Performance optimization for assistive technologies

## 12. Deployment Strategy

### 12.1 Environments
- Development: Local environment
- Staging: Docker server for testing
- Future Production: To be determined

### 12.2 CI/CD with GitHub Actions
- Automated testing on pull requests
- Build and deployment to staging on merge to main
- Future: Production deployment workflow

## 13. Documentation

### 13.1 Developer Documentation
- Setup instructions
- Architecture overview
- Component library
- API documentation
- Testing procedures

### 13.2 User Documentation
- User guide
- FAQ
- Troubleshooting guide
- CSV import template

### 13.3 Documentation Location
- Stored with source code in `/docs` directory
- Markdown format for version control compatibility

## 14. Content Strategy Implementation

### 14.1 Voice and Tone Guidelines
- **Friendly but Efficient**: Brief, clear language
- **Encouraging**: Positive reinforcement for task completion
- **Helpful**: Instructional text that guides without overwhelming
- **Direct**: Action-oriented button text

### 14.2 Microcopy Implementation
- Standard text for common actions (Add Task, Edit, Delete, etc.)
- Consistent terminology throughout the application
- Encouraging messages for task completion
- Clear, concise error messages

### 14.3 Life Stage-Specific Content
- Specific content approaches for each persona:
  - Efficiency-focused language for busy parents (Alex)
  - Educational content for new homeowners (Jordan)
  - Life-enrichment focused content for active retirees (Pat)

### 14.4 Cognitive Load Reduction
- Use language to reduce mental burden
- Provide just-in-time information
- Implement quick-access content patterns
- Design contextually aware content

## 15. Future Considerations (v2)

### 15.1 User Accounts
- Authentication system
- Cloud data synchronization
- Multi-device access

### 15.2 Shared Task Lists
- Family/household access
- Permission management
- Real-time updates

### 15.3 Persona-Based Tasks
- Predefined task templates based on user profiles:
  - Homeowner
  - Parent
  - Pet owner
  - Gardener

### 15.4 Notifications
- Push notifications for overdue tasks
- Email reminders
- Calendar integration

## 16. License and Attribution

### 16.1 Licensing
- Non-commercial open source license
- Specific terms prohibiting commercial use

### 16.2 Attribution Requirements
- Credit original creator
- Link to GitHub repository

## Appendices

### A. Initial Category Suggestions
- Kitchen
- Bathroom
- Bedroom
- Living Areas
- Exterior
- Vehicles
- Digital/Tech
- Health
- Pets
- Garden/Plants

Each with predefined colors and icons:
- Kitchen: #3B82F6 (Blue), Utensils/pot icon
- Bathroom: #8B5CF6 (Purple), Shower/bath icon
- Bedroom: #EC4899 (Pink), Bed icon
- Living Areas: #10B981 (Green), Couch icon
- Exterior: #F59E0B (Amber), House icon
- Vehicles: #EF4444 (Red), Car icon
- Digital/Tech: #6366F1 (Indigo), Computer icon
- Health: #14B8A6 (Teal), Heart icon
- Pets: #F97316 (Orange), Paw print icon
- Garden/Plants: #84CC16 (Lime), Leaf icon

### B. Initial Task Suggestions
Examples of starter tasks for each category with suggested frequencies and time commitments.

#### Standard Home Tasks
- Deep clean refrigerator (Kitchen, 1 month, 30min)
- Clean shower grout (Bathroom, 3 months, 1hr)
- Wash bedding (Bedroom, 2 weeks, 30min)
- Vacuum furniture (Living Areas, 1 month, 30min)
- Clean gutters (Exterior, 6 months, 2hrs)
- Check tire pressure (Vehicles, 1 month, 15min)
- Update passwords (Digital/Tech, 3 months, 30min)
- Check medicine expiration dates (Health, 6 months, 15min)
- Clean pet bedding (Pets, 2 weeks, 30min)
- Water plants (Garden/Plants, 1 week, 15min)

#### Persona-Specific Tasks
- **For Alex (Busy Parent)**:
  - Schedule pediatrician visit (6 months, 15min)
  - Review homework routine (3 months, 30min)
  - Rotate kids' seasonal clothes (6 months, 2hrs)

- **For Jordan (Homeowner)**:
  - Check HVAC filter (3 months, 15min)
  - Apply pet flea treatment (1 month, 15min)
  - Inspect roof (1 year, 30min)

- **For Pat (Active Retiree)**:
  - Video call with grandchildren (2 weeks, 30min)
  - Try new hobby or class (1 month, 2hrs)
  - Attend community event (2 weeks, 2hrs)

### C. CSV Import/Export Format
Detailed field specifications and expected data types.

### D. Implementation Timeline
Suggested implementation phases for core functionality.