# Copilot Custom Instructions for Nigerian Calculator Site

## Project Context
Building a modern calculator website with Next.js 15, React 19, Tailwind CSS, and shadcn-ui components. The site features three main calculators: BMI Calculator, Nigerian Inflation Calculator (CPI method), and Nigerian Income Tax Calculator.

## Technical Stack Requirements
- **Framework:** Next.js 15 with App Router
- **React:** Version 19 with modern hooks and concurrent features
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** shadcn-ui for consistent, accessible components
- **TypeScript:** Strict mode enabled for type safety
- **State Management:** React hooks and Context API where needed

## Code Standards & Conventions
- Use TypeScript for all components and utilities
- Follow React 19 best practices (use hooks, avoid class components)
- Implement responsive design mobile-first approach
- Use semantic HTML and ARIA attributes for accessibility
- Follow Next.js 15 App Router conventions for file structure
- Use Tailwind utility classes with consistent spacing scale
- Implement proper error handling and loading states

## Component Structure Guidelines
- Create reusable UI components in `/components/ui/`
- Place calculator-specific components in `/components/calculators/`
- Use shadcn-ui components as base, customize with Tailwind
- Implement proper TypeScript interfaces for all props
- Follow composition pattern for complex components

## Calculator-Specific Requirements

### BMI Calculator
- Support both metric (kg/cm) and imperial (lbs/ft-in) units
- Real-time calculation as user types
- Display BMI categories with color-coded results
- Include health recommendations based on BMI range
- Validate inputs and handle edge cases

### Nigerian Inflation Calculator
- Use Consumer Price Index (CPI) methodology
- Allow custom date range selection
- Display results with percentage and monetary impact
- Include data visualization (charts/graphs)
- Source data from reliable Nigerian economic indicators

### Nigerian Income Tax Calculator
- Implement current Nigerian tax brackets (2024/2025)
- Include all applicable allowances and deductions
- Support both annual and monthly salary calculations
- Display detailed tax breakdown
- Consider various income sources and reliefs

## Performance & UX Guidelines
- Implement client-side validation with real-time feedback
- Use React 19 concurrent features for smooth interactions
- Optimize images and assets for fast loading
- Implement proper loading states and error boundaries
- Ensure calculations are accurate and handle edge cases
- Make forms accessible with proper keyboard navigation

## File Organization
```
src/
├── app/
│   ├── bmi-calculator/
│   ├── inflation-calculator/
│   ├── tax-calculator/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn-ui components)
│   ├── calculators/
│   ├── layout/
│   └── common/
├── lib/
│   ├── utils/
│   ├── calculations/
│   └── data/
└── types/
```

## Testing & Quality Assurance
- Write unit tests for calculation functions
- Test form validation and error handling
- Ensure cross-browser compatibility
- Validate accessibility with screen readers
- Test responsive design on various devices

## When Suggesting Code
- Always use TypeScript with proper typing
- Include error handling and validation
- Follow the established component patterns
- Use shadcn-ui components when applicable
- Implement proper loading and error states
- Include comments for complex calculation logic
- Ensure responsive design with Tailwind classes

## Focus Areas by Phase
- **Setup Phase:** Project configuration and tooling
- **Foundation Phase:** Core architecture and routing
- **Calculator Phases:** Accurate calculations and user experience
- **Polish Phase:** Performance, accessibility, and deployment

Remember to prioritize user experience, calculation accuracy, and Nigerian-specific requirements throughout the development process.