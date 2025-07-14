# How Long Since - Visual Style Guide & Brand Guidelines

## 1. Color Palette

Based on the app's purpose as a household task tracker focused on simplicity and clarity, we recommend a clean palette with clear indicators for task status:

### Primary Colors
- **Primary Blue** (#2563EB): For primary actions, buttons, and interactive elements
- **Neutral Gray** (#6B7280): For secondary text and inactive elements
- **White** (#FFFFFF): For backgrounds and maximizing readability
- **Dark Gray** (#1F2937): For primary text and headings

### Status Colors
- **Overdue Red** (#DC2626): For overdue task indicators (ensuring 4.5:1 contrast ratio for accessibility)
- **Success Green** (#10B981): For completed tasks and positive actions
- **Warning Amber** (#F59E0B): For approaching deadlines

### Category Colors
Since categories are an important organizational element, provide a set of distinguishable colors:

#### Standard Home Categories
- Kitchen: #3B82F6 (Blue)
- Bathroom: #8B5CF6 (Purple)
- Bedroom: #EC4899 (Pink)
- Living Areas: #10B981 (Green)
- Exterior: #F59E0B (Amber)
- Vehicles: #EF4444 (Red)
- Digital/Tech: #6366F1 (Indigo)
- Health: #14B8A6 (Teal)
- Garden/Plants: #84CC16 (Lime)

#### Persona-Specific Categories
- **Pet Care** (for Jordan): #F97316 (Orange)
  - Sub-categories: Pet Health, Pet Maintenance, Pet Enrichment
- **Child-Related** (for Alex): #FB7185 (Rose Pink)
  - Sub-categories: Education, Health, Activities
- **Social/Hobbies** (for Pat): #818CF8 (Lighter Indigo)
  - Sub-categories: Connections, Creative Activities, Learning
- **Financial/Investment** (for Alex): #0EA5E9 (Sky Blue)
  - Sub-categories: Bills, Investments, Budget Review

### Accessibility Considerations
- All text colors maintain at least 4.5:1 contrast ratio against their backgrounds
- Interactive elements use a 3:1 contrast ratio minimum for boundaries
- Status colors have alternative indicators (icons) for colorblind users

#### Enhanced Accessibility for Older Users (for Pat)
- **Larger Text Options**: Provide a "Larger Text" setting that increases all text sizes by 25-50%
- **Higher Contrast Mode**: Offer an enhanced contrast mode with 7:1 contrast ratio for better readability
- **Reduced Motion Option**: Allow users to disable animations and transitions
- **Simplified View**: Create an alternative, less dense layout with fewer items per screen
- **Bold Text Option**: Option to display all text in medium weight (500) or higher for better visibility

## 2. Typography

A clean, readable typography system that works well on mobile devices:

### Font Families
- **Primary Font**: Inter (sans-serif)
- **Alternative System Fonts**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif

### Type Scale
- **Display (Page Titles)**: 24px / 1.2 line height / 700 weight
- **Heading 1 (Section Headers)**: 20px / 1.3 line height / 600 weight
- **Heading 2 (Sub-sections)**: 18px / 1.4 line height / 600 weight
- **Body Large**: 16px / 1.5 line height / 400 weight
- **Body (Default)**: 14px / 1.5 line height / 400 weight
- **Small (Supporting text)**: 12px / 1.5 line height / 400 weight

### Typography Hierarchy
- Task Names: Body Large / 500 weight
- Time Elapsed: Body / 400 weight (prominent placement)
- Category Headers: Heading 2 / 600 weight
- Time Commitment: Small / 400 weight
- Form Labels: Body / 500 weight
- Button Text: Body / 500 weight

## 3. UI Component Patterns

### Buttons
- **Primary Button**
  - Background: Primary Blue
  - Text: White
  - Padding: 12px 16px
  - Border Radius: 8px
  - Height: 48px (mobile-friendly tap target)

- **Secondary Button**
  - Background: White
  - Border: 1px solid Neutral Gray
  - Text: Dark Gray
  - Same dimensions as Primary

- **Icon Button**
  - Size: 44px × 44px (accessible tap target)
  - Border Radius: 8px or circle
  - Visual feedback on hover/press

### Task Cards
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

#### Enhanced Touch Targets for Accessibility
- **"Just Done" Checkbox**: Minimum 48px × 48px (larger than standard)
- **Card Tap Area**: Entire card acts as tap target for details view
- **Swipe Area**: Generous edge margins to prevent accidental navigation
- **Button Spacing**: Minimum 16px between actionable elements
- **Hit Area Extensions**: Invisible extended hit areas for all interactive elements (minimum of 8px beyond visible boundaries)

### Form Elements
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

### Navigation
- **Bottom Navigation Bar**
  - Height: 64px
  - Background: White
  - Shadow: subtle for depth
  - Icon size: 24px × 24px
  - Text labels: Small type
  - Active state: Primary Blue
  - Inactive state: Neutral Gray

## 4. Iconography

### Icon Style
- **Style**: Outlined with 2px stroke
- **Corner Radius**: 2px for squared corners
- **Size**: 24px × 24px (standard) and 20px × 20px (compact)
- **Visual Weight**: Medium (not too thin, not too bold)
- **Consistency**: Uniform visual style across all icons

### Key Icons
- **Add Task**: Plus symbol in circle
- **Task Complete**: Checkmark
- **Edit Task**: Pencil
- **Archive**: Box with down arrow
- **Delete**: Trash can
- **Category View**: Grid/list symbol
- **Time View**: Clock symbol
- **Settings**: Gear
- **Export/Import**: Upload/download arrows
- **Back/Forward**: Chevrons

### Task Category Icons
Provide simple, recognizable icons for each category:

#### Standard Home Categories
- Kitchen: Utensils/pot
- Bathroom: Shower/bath
- Bedroom: Bed
- Living Areas: Couch
- Exterior: House
- Vehicles: Car
- Digital/Tech: Computer/device
- Health: Heart/medical cross
- Garden/Plants: Leaf/plant

#### Persona-Specific Category Icons
- **Pet Care** (for Jordan):
  - Main: Paw print
  - Pet Health: Veterinary cross
  - Pet Maintenance: Brush/grooming tool
  - Pet Enrichment: Toy/activity

- **Child-Related** (for Alex):
  - Main: Child silhouette
  - Education: Book/pencil
  - Health: Apple/healthy food
  - Activities: Playground/ball

- **Social/Hobbies** (for Pat):
  - Main: Paintbrush/hobby
  - Connections: People silhouettes
  - Creative Activities: Art tools
  - Learning: Book/graduation cap

- **Financial/Investment** (for Alex):
  - Main: Dollar sign/graph
  - Bills: Document/receipt
  - Investments: Chart/growth
  - Budget Review: Calculator

## 5. Visual Indicators

### Time Elapsed Indicators
- **Just Now** (< 1 hour): Small green dot indicator
- **Today** (< 24 hours): Regular text, no special indicator
- **Yesterday** (< 48 hours): Regular text, no special indicator
- **This Week** (< 7 days): Regular text, no special indicator
- **Weeks/Months Ago**: Regular text, no special indicator
- **Overdue**: Text in Overdue Red with subtle alert icon

### Time Commitment Indicators
Use a combination of text and visual indicators:
- **15min**: Single filled circle
- **30min**: Two filled circles
- **1hr**: Three filled circles
- **2hrs**: Four filled circles
- **4hrs**: Five filled circles
- **5hrs+**: Five filled circles + "+"

The circles use a muted version of the category color or a neutral gray, providing:
1. Quick visual scanning of time requirements
2. Accessibility for colorblind users through pattern recognition
3. Consistency across the interface

### Overdue Task Indicators
- Text color changes to Overdue Red
- Small alert icon (!) appears next to elapsed time
- Subtle red border on left side of task card (3px)
- Animation: None (avoid distracting movements)

### Empty States
- Friendly, minimal illustrations for empty categories
- Clear call-to-action buttons
- Helpful, brief text explaining next steps

## 6. Implementation Guidelines

### Responsive Behavior
- Mobile-first approach with adaptive desktop layouts
- Breakpoints: 
  - Mobile: <640px (single column)
  - Tablet: 640px-1024px (dual column)
  - Desktop: >1024px (multi-column dashboard)

### Context-Sensitive UI Patterns
- **Time-Based Adaptations**:
  - Morning view emphasizes quick start tasks
  - Evening view prioritizes lower-energy tasks
  - Weekend view focuses on longer time commitment tasks
  
- **Behavior Pattern Recognition**:
  - Highlight frequently completed task categories
  - Adjust category order based on usage patterns
  - Offer "Your Rhythm" section showing personal task completion patterns
  
- **Persona-Based UI Variants**:
  - **Busy Parent Mode** (for Alex): Emphasizes task batching and quick wins
  - **Homeowner Mode** (for Jordan): Prioritizes maintenance schedules and prevention
  - **Active Retiree Mode** (for Pat): Balances maintenance with enrichment activities
  
- **Time Availability Matching**:
  - "Quick Pick" section that filters tasks matching user's current available time
  - Visual highlighting of tasks that can be completed together
  - Smart ordering that prioritizes seasonal or time-sensitive tasks

### Dark Mode Support
- All components have dark mode variants
- Background shifts to dark gray (#1F2937)
- Text becomes white or light gray
- Maintain same contrast ratios in dark mode
- Status colors adjust for visibility

### Design Assets
- SVG icons for scalability
- Component library built in Figma
- Design tokens stored in JSON format
- Responsive grid system: 4px base unit

### Accessibility Guidelines
- High contrast mode support
- Text resizing without breaking layouts
- Focus states clearly visible
- Touch targets minimum 44px × 44px (48px × 48px preferred)
- Screen reader-friendly labeling
- Reduced motion options
- Keyboard navigation enhancements
- Support for screen magnification

## 7. Brand Voice and Tone

While not visual, these elements influence UI text:

- **Friendly but Efficient**: Brief, clear language
- **Encouraging**: Positive reinforcement for task completion
- **Helpful**: Instructional text that guides without overwhelming
- **Direct**: Action-oriented button text ("Add Task" not "Add a New Task")