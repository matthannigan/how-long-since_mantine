# Project Structure

## Root Level Organization

```
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                    # Business logic and utilities
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── contexts/               # React context providers
├── styles/                 # Global styles and CSS
├── public/                 # Static assets
├── dev/                    # Development documentation
├── docs/                   # User and developer documentation
├── scripts/                # Build and utility scripts
└── test-utils/             # Testing utilities and setup
```

## Component Organization

Components are organized by feature/domain:

```
components/
├── task/                   # Task-related components
│   ├── TaskCard/          # Individual task display
│   ├── TaskForm/          # Task creation/editing
│   ├── TaskCompletionButton/  # Task completion UI
│   └── TimeCommitmentBadge/   # Time indicator component
├── Welcome/               # Welcome/onboarding components
└── ColorSchemeToggle/     # Theme switching component
```

## Library Structure

The `lib/` directory contains business logic organized by concern:

```
lib/
├── constants/             # App constants and configuration
│   ├── categories.ts     # Default categories with colors/icons
│   └── timeCommitments.ts # Time commitment definitions
├── db/                   # Database layer
│   ├── schema.ts        # Dexie database schema and hooks
│   ├── migrations.ts    # Database initialization and migrations
│   └── index.ts         # Database exports
├── services/            # Business logic services
│   ├── TaskService.ts   # Task CRUD operations
│   ├── CategoryService.ts # Category management
│   ├── SettingsService.ts # App settings management
│   └── ExportImportService.ts # Data import/export
├── utils/               # Utility functions
│   └── dateUtils.ts     # Date formatting and calculations
└── validation/          # Data validation schemas
    └── schemas.ts       # Zod validation schemas
```

## Type Definitions

Types are organized by domain in the `types/` directory:

```
types/
├── task.ts              # Task entity and related types
├── category.ts          # Category entity and related types
├── settings.ts          # App settings types
└── index.ts             # Centralized type exports
```

## File Naming Conventions

- **Components**: PascalCase with descriptive names (`TaskCard.tsx`)
- **Hooks**: camelCase starting with "use" (`useTaskManager.ts`)
- **Services**: PascalCase ending with "Service" (`TaskService.ts`)
- **Utils**: camelCase descriptive names (`dateUtils.ts`)
- **Types**: camelCase matching domain (`task.ts`)
- **Constants**: camelCase plural (`categories.ts`)

## Component File Structure

Each component follows this pattern:

```
ComponentName/
├── ComponentName.tsx      # Main component implementation
├── ComponentName.test.tsx # Unit tests
├── ComponentName.story.tsx # Storybook stories (if applicable)
└── ComponentName.module.css # Component-specific styles (if needed)
```

## Import Path Conventions

- Use `@/` alias for absolute imports from project root
- Prefer named exports over default exports
- Group imports: external libraries, then internal modules
- Use index files for clean re-exports

## Testing Structure

- Unit tests co-located with components (`*.test.tsx`)
- Integration tests in `lib/services/__tests__/`
- Test utilities in `test-utils/`
- Database test setup in `lib/db/test-setup.ts`

## Configuration Files

- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.cjs` - Jest testing configuration
- `eslint.config.mjs` - ESLint configuration
- `theme.ts` - Mantine theme customization
- `.kiro/` - Kiro-specific configuration and specs