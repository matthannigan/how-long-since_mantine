# How Long Since - Accessibility Requirements Document

## 1. Introduction

This document outlines the accessibility requirements for the "How Long Since" household task management application. Our goal is to create an inclusive application that can be used by people with a wide range of abilities, including those with visual, motor, auditory, and cognitive disabilities.

"How Long Since" will conform to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, with additional considerations specific to our application's unique features and target audience.

## 2. WCAG 2.1 Level AA Requirements

### 2.1 Perceivable

#### Text Alternatives
- All non-text content (icons, images) must have appropriate text alternatives
- Task category icons must include descriptive text labels
- Visual indicators for time commitment must have text equivalents

#### Time-Based Media
- Any tutorial videos must include captions and audio descriptions

#### Adaptable Content
- The application layout must be responsive and adaptable to different viewport sizes
- Content must be presentable in different ways without losing information
- UI must maintain logical reading order in different view modes

#### Distinguishable Content
- Text and background color combinations must maintain a contrast ratio of at least 4.5:1
- Status indicators (overdue, completed) must be distinguishable by more than color alone
- Text must be resizable up to 200% without loss of content or functionality
- No audio plays automatically

### 2.2 Operable

#### Keyboard Accessibility
- All functionality must be accessible via keyboard
- No keyboard traps in any interface elements
- Keyboard focus must be visible and follow a logical order
- Provide keyboard shortcuts for frequently used actions (task completion, adding new tasks)

#### Timing
- No timing constraints for completing forms or actions
- If session timeouts are implemented (in future versions), provide warnings and options to extend

#### Seizures and Physical Reactions
- No content that flashes more than three times per second
- Animation must be subtle and non-essential to core functionality

#### Navigable
- Page titles and section headings must accurately describe content and purpose
- Focus order preserves meaning and operability
- Link purpose is clear from context or link text
- Multiple ways to find content (search, category navigation, time filter)
- Focus is not changed automatically when elements receive focus

#### Input Modalities
- Touch targets must be at least 44px × 44px
- Gesture-based interactions (swipe) must have non-gesture alternatives
- Motion-based interactions must be optional and have alternatives

### 2.3 Understandable

#### Readable
- Language of the application must be programmatically determinable
- Unusual words or technical terms must be defined through a glossary or inline definitions
- Abbreviations must have an expanded form at first occurrence

#### Predictable
- Navigation is consistent throughout the application
- Components that have the same functionality are identified consistently
- Changes in context only occur when initiated by the user

#### Input Assistance
- Error identification is clear and descriptive
- Labels and instructions are provided for all form elements
- Error suggestions are provided when possible
- Error prevention for important data submissions (confirmation before deletion)

### 2.4 Robust

#### Compatible
- Markup is valid and well-formed
- Name, role, and value of UI components are programmatically determinable
- Status messages are programmatically determinable without receiving focus

## 3. App-Specific Accessibility Considerations

### 3.1 Task Status and Time Visualization

#### Overdue Task Indicators
- Overdue tasks must be identified by:
  - Text color (meeting 4.5:1 contrast ratio)
  - Distinct icon (!)
  - Border on task card
  - Screen reader announcement of overdue status

#### Time Since Last Completion
- Time elapsed must be presented clearly with both visual and textual indicators
- Screen readers must announce the elapsed time in a meaningful way
- Consider adding a descriptive scale (e.g., "Recent", "Overdue") in addition to exact time

#### Time Commitment Indicators
- The circle-based time commitment system must have:
  - Text alternatives (e.g., "15 minutes", "1 hour")
  - Sufficient visual distinction between different time levels
  - Programmatically determinable values for assistive technologies

### 3.2 Task Management Interface

#### Task Completion Actions
- "Just Done" checkbox must be:
  - Large enough for users with motor impairments (minimum 44px × 44px)
  - Keyboard accessible (Tab to focus, Space to activate)
  - Voice-command compatible
  - Have clear visible focus states

#### Swipe Gestures
- Alternative methods must exist for all swipe gestures:
  - Swipe right to complete → Alternative checkbox or button
  - Swipe left to edit → Alternative edit button
  - Touch targets should be generous and forgiving

#### Form Interactions
- All form elements must have descriptive labels
- Form validation errors must be clearly indicated visually and announced by screen readers
- Group related form elements with fieldset and legend when appropriate

### 3.3 View Switching

#### Category vs. Time View
- View switching controls must be:
  - Keyboard accessible
  - Clearly labeled
  - Current view must be programmatically determinable
  - View change must be announced to screen readers

#### Status Persistence
- The application must remember the user's preferred view
- Focus position should be maintained when switching views when possible

### 3.4 UI and Visual Design

#### Color Independence
- All information conveyed with color must also be available without color
- Category color coding must have additional visual or textual differentiation
- Status indicators must use icons, text, and position in addition to color

#### Typography and Readability
- Font size must be adjustable through browser controls
- Line height should be at least 1.5 times the font size
- Paragraph spacing should be at least 2 times the font size
- Text spacing should be adjustable without breaking layout
- Avoid justified text alignment

#### Visual Clutter
- Interface should prioritize essential information
- Visual noise should be minimized
- Allow users to control density of information display

### 3.5 Mobile Accessibility

#### Touch Targets
- All interactive elements must have touch targets of at least 44px × 44px
- Sufficient spacing between touch targets to prevent accidental activation
- Touch targets should expand to fill their container when possible

#### Gestures
- Complex gestures must have simpler alternatives
- Custom gestures must be documented and have standard alternatives
- Allow for reduced motion preferences

#### Screen Reader Compatibility
- Test with VoiceOver (iOS) and TalkBack (Android)
- Ensure custom components have appropriate ARIA roles and states
- Test navigation flow with screen reader enabled

## 4. Testing Methodology and Success Criteria

### 4.1 Automated Testing

#### Tools
- **axe-core**: Integrate into CI/CD pipeline
- **Lighthouse**: Regular automated checks for accessibility scores
- **WAVE**: Periodic manual checks with WAVE browser extension
- **ESLint a11y plugin**: Catch accessibility issues during development

#### Success Criteria
- Zero critical or serious accessibility violations in automated tests
- Achieve minimum 90/100 accessibility score in Lighthouse
- All custom components pass axe-core tests

### 4.2 Manual Testing

#### Keyboard Navigation Testing
- Test all functionality using only keyboard
- Verify logical tab order
- Ensure all interactive elements have visible focus states
- Verify that all actions can be performed with keyboard alone

#### Screen Reader Testing
- Test with NVDA and JAWS on Windows
- Test with VoiceOver on macOS/iOS
- Test with TalkBack on Android
- Verify all content is announced correctly
- Verify dynamic updates are announced appropriately

#### Visual Testing
- Test with high contrast mode enabled
- Test with text size increased to 200%
- Test with browser zoom up to 400%
- Test color vision deficiency scenarios using simulation tools

#### Motor Impairment Testing
- Test with voice commands using Voice Control/Voice Access
- Test using keyboard-only navigation
- Verify touch targets are large enough and well-spaced

### 4.3 User Testing

#### Participant Recruitment
- Include users with various disabilities in testing:
  - Visual impairments (low vision, blindness)
  - Motor impairments
  - Cognitive impairments
  - Older adults who may have multiple mild impairments

#### Testing Protocol
- Define specific tasks for users to complete
- Measure task completion rates, times, and error rates
- Collect qualitative feedback on usability and accessibility
- Identify pain points and areas for improvement

#### Success Criteria
- 90% task completion rate for all user groups
- Similar task completion times across user groups (accounting for assistive technology usage)
- Positive qualitative feedback regarding accessibility

### 4.4 Ongoing Accessibility Monitoring

#### Regular Audits
- Conduct full accessibility audits quarterly
- Include accessibility testing in all QA processes
- Monitor user feedback for accessibility issues

#### Regression Testing
- Include accessibility checks in regression test suite
- Verify new features meet accessibility requirements before release
- Maintain a library of accessibility test cases

#### Documentation
- Maintain accessibility statement
- Document known limitations and workarounds
- Provide accessibility-specific user documentation

## 5. Implementation Timeline and Prioritization

### 5.1 Phase 1: Foundation (MVP)
- Basic keyboard navigation
- Proper semantic HTML structure
- Color contrast compliance
- Screen reader compatibility for core functionality
- Touch target sizing

### 5.2 Phase 2: Enhanced Accessibility
- Advanced ARIA implementations
- Additional non-visual indicators
- Keyboard shortcuts
- Complete screen reader optimization
- Form error handling improvements

### 5.3 Phase 3: Accessibility Excellence
- User customization options (text size, spacing, etc.)
- Advanced gesture alternatives
- Comprehensive user testing with diverse disabilities
- Refined focus management
- Performance optimization for assistive technologies

## 6. Responsibility and Governance

### 6.1 Team Roles
- **Accessibility Champion**: Designated team member responsible for advocating for accessibility
- **Developers**: Implement accessible code and test with assistive technologies
- **Designers**: Create accessible visual designs and interactions
- **QA**: Include accessibility testing in all test plans

### 6.2 Training Requirements
- All team members to complete basic web accessibility training
- Developers to receive specialized training on ARIA and JavaScript accessibility
- Designers to receive training on accessible design principles

### 6.3 Documentation Requirements
- Maintain accessibility conformance report
- Document accessibility features for end users
- Create developer documentation for maintaining accessibility

## 7. Conclusion

This accessibility requirements document establishes the standards and processes necessary to create an inclusive "How Long Since" application. By adhering to these requirements, we will create a product that can be used effectively by all users, regardless of ability.

The focus on household task management with time-based indicators presents unique accessibility challenges that we have addressed through specific requirements around time visualization, task status indicators, and interaction patterns.

Regular testing and continuous improvement will ensure that accessibility remains a core aspect of the product throughout its development lifecycle.