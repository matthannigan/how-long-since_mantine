# How Long Since

A household task management app that tracks when tasks were last completed rather than traditional to-do lists. The app helps users identify suitable tasks based on their available time and provides visual indicators for overdue tasks.

## Overview

"How Long Since" answers the question "How long has it been since...?" for various household responsibilities and activities. Unlike traditional task managers, this app focuses on tracking completion history to help users make informed decisions about what needs attention.

### Core User Story

"As a busy person with various responsibilities, I want to be able to track how long it's been since I performed certain tasks and identify opportunities to complete tasks within limited available time so that more tasks get done and the list doesn't feel overwhelming."

### Target Users

- **Busy Parents**: Managing work and household responsibilities with limited time windows
- **First-time Homeowners**: Learning home maintenance rhythms and building good habits
- **Active Retirees**: Tracking social connections, hobbies, and household tasks

## Key Features

- **Time-based tracking**: Focus on "when last done" rather than due dates
- **Time commitment filtering**: Find tasks that fit your available time (15min, 30min, 1hr, 2hrs, 4hrs, 5hrs+)
- **Visual overdue indicators**: Multiple accessibility-compliant signals for overdue tasks
- **Category organization**: Color-coded categories with icons for easy scanning
- **Offline-first PWA**: Works without internet connection using IndexedDB
- **Accessibility-focused**: WCAG AA compliance with screen reader support
- **Data portability**: Import/export functionality for backup and migration

## Technology Stack

### Core Framework
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Mantine 8.1** for UI components and styling
- **IndexedDB** via Dexie.js for offline data storage

### Key Dependencies
- **@mantine/core** - UI component library
- **@mantine/form** - Form handling and validation
- **@mantine/hooks** - React hooks utilities
- **@mantine/notifications** - Toast notifications
- **@tabler/icons-react** - Icon library
- **dexie** - IndexedDB wrapper for data persistence
- **zod** - Runtime type validation and schema validation
- **date-fns** - Date manipulation utilities

### Development Tools
- **TypeScript** - Type safety and developer experience
- **Jest** + **React Testing Library** - Unit and integration testing
- **Storybook** - Component development and documentation
- **ESLint** with Mantine config - Code linting
- **Prettier** - Code formatting
- **Stylelint** - CSS linting

## Development Scripts

### Development
```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn analyze      # Analyze bundle size
```

### Testing
```bash
yarn test         # Run all tests (lint + typecheck + jest)
yarn jest         # Run Jest tests only
yarn jest:watch   # Run Jest in watch mode
yarn typecheck    # TypeScript type checking
```

### Code Quality
```bash
yarn lint         # Run ESLint and Stylelint
yarn eslint       # Run ESLint only
yarn stylelint    # Run Stylelint only
yarn prettier:check   # Check code formatting
yarn prettier:write  # Format code with Prettier
```

### Storybook
```bash
yarn storybook        # Start Storybook dev server
yarn storybook:build  # Build Storybook for production
```

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
│   ├── task/              # Task-related components
│   ├── Welcome/           # Welcome/onboarding components
│   └── ColorSchemeToggle/ # Theme switching component
├── lib/                   # Business logic and utilities
│   ├── constants/         # App constants and configuration
│   ├── db/               # Database layer (Dexie schema)
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── validation/       # Data validation schemas
├── types/                 # TypeScript type definitions
├── hooks/                # Custom React hooks
├── contexts/             # React context providers
├── styles/               # Global styles and CSS
└── public/               # Static assets
```

## Implementation Progress

### ✅ Completed
- Project foundation and setup
- Core data layer with IndexedDB schema
- Service layer implementation (TaskService, CategoryService, SettingsService, ExportImportService)
- Task management core features (creation, editing, completion)
- Task display with time formatting and overdue indicators

### 🚧 In Progress
- Category management system
- Task list views and navigation
- User interface and layout components

### 📋 Planned
- Accessibility implementation (WCAG AA compliance)
- Data persistence and backup features
- User experience enhancements
- Performance optimization
- Progressive Web App features

## Architecture Patterns

- **Offline-first**: IndexedDB for local data persistence
- **Service layer**: Abstracted data services for business logic
- **Component composition**: Reusable UI components with clear props interfaces
- **Hook-based state**: Custom hooks for business logic
- **Type-safe validation**: Zod schemas for runtime validation
- **Accessibility-first**: WCAG AA compliance built into components

## Design Principles

- **Mobile-first responsive design**: Optimized for touch interactions
- **Accessibility compliance**: WCAG AA standards with screen reader support
- **Offline functionality**: Works without internet connection
- **Encouraging interface**: Non-overwhelming, positive user experience
- **Focus on completion history**: "When last done" rather than "what to do next"

## Data Models

### Task Entity
```typescript
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

### Category Entity
```typescript
Category {
  id: string
  name: string
  color: string
  isDefault: boolean
}
```

## Contributing

This project follows test-driven development practices and prioritizes accessibility from the start. All code must pass TypeScript compilation, maintain 80%+ test coverage for business logic, and pass axe-core accessibility tests.
