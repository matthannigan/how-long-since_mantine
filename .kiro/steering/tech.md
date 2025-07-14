# Technology Stack

## Core Framework
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Mantine 8.1** for UI components and styling
- **IndexedDB** via Dexie.js for offline data storage

## Key Dependencies
- **@mantine/core** - UI component library
- **@mantine/form** - Form handling and validation
- **@mantine/hooks** - React hooks utilities
- **@mantine/notifications** - Toast notifications
- **@tabler/icons-react** - Icon library
- **dexie** - IndexedDB wrapper for data persistence
- **zod** - Runtime type validation and schema validation
- **date-fns** - Date manipulation utilities

## Development Tools
- **TypeScript** - Type safety and developer experience
- **Jest** + **React Testing Library** - Unit and integration testing
- **Storybook** - Component development and documentation
- **ESLint** with Mantine config - Code linting
- **Prettier** - Code formatting
- **Stylelint** - CSS linting

## Build System
- **PostCSS** with Mantine preset for styling
- **@next/bundle-analyzer** for bundle optimization
- **Yarn 4.9.2** as package manager

## Common Commands

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

## Architecture Patterns
- **Offline-first** - IndexedDB for local data persistence
- **Service layer** - Abstracted data services (TaskService, CategoryService, etc.)
- **Component composition** - Reusable UI components with clear props interfaces
- **Hook-based state** - Custom hooks for business logic
- **Type-safe validation** - Zod schemas for runtime validation
- **Accessibility-first** - WCAG AA compliance built into components