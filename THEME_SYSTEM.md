# Dark Mode & Theme System Documentation

## Overview
The Calculate.ng application features a comprehensive theme system with support for both light/dark mode and calculator-specific color schemes. The system is built using `next-themes` for system-level theme management and a custom implementation for calculator-specific themes.

## Architecture

### Core Components

1. **ThemeProvider** (`src/components/layout/theme-provider.tsx`)
   - Wraps the application with next-themes provider
   - Manages light/dark/system theme preferences
   - Handles theme persistence and system detection

2. **CalculatorThemeProvider** (`src/components/layout/calculator-theme-provider.tsx`)
   - Manages calculator-specific color schemes
   - Automatically applies themes based on calculator type
   - Persists theme preferences to localStorage

3. **ModeToggle** (`src/components/layout/mode-toggle.tsx`)
   - Toggle between light, dark, and system themes
   - Visual feedback showing current theme state
   - Accessible dropdown interface

4. **ThemeSelector** (`src/components/layout/theme-selector.tsx`)
   - Allows manual selection of calculator themes
   - Shows theme previews with icons and descriptions
   - Indicates currently active theme

## Color Schemes

### BMI Calculator - Ocean Theme 🌊
- **Primary**: `oklch(0.55 0.25 220)` - Deep ocean blue
- **Secondary**: `oklch(0.65 0.20 160)` - Seafoam green
- **Accent**: `oklch(0.75 0.15 180)` - Light aqua
- **Use Case**: Health and wellness calculations

### Tax Calculator - Royal Theme 👑
- **Primary**: `oklch(0.50 0.25 280)` - Royal purple
- **Secondary**: `oklch(0.75 0.15 45)` - Gold
- **Accent**: `oklch(0.85 0.10 45)` - Light gold
- **Use Case**: Professional financial calculations

### Inflation Calculator - Sunset Theme 🌅
- **Primary**: `oklch(0.60 0.25 35)` - Warm orange
- **Secondary**: `oklch(0.70 0.20 15)` - Coral
- **Accent**: `oklch(0.80 0.15 25)` - Peach
- **Use Case**: Economic indicators and trends

## Implementation Details

### Automatic Theme Application
When users navigate to calculator pages, the theme automatically switches:
```tsx
// In calculator pages
<ThemedCalculatorPage theme="bmi" title="BMI Calculator">
  <BMICalculator />
</ThemedCalculatorPage>
```

### CSS Custom Properties
Each theme defines CSS custom properties that components can reference:
```css
.bmi-theme {
  --primary: var(--bmi-primary);
  --secondary: var(--bmi-secondary);
  /* ... */
}
```

### Gradient Backgrounds
Each theme includes gradient classes for enhanced visual appeal:
```css
.bmi-gradient {
  background: linear-gradient(135deg, var(--bmi-background) 0%, var(--bmi-accent) 100%);
}
```

### Animated Components
Calculator cards feature smooth hover animations and transitions:
```css
.calculator-card {
  transition: all 0.3s ease;
}

.calculator-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px oklch(from var(--primary) l c h / 0.15);
}
```

## Theme Persistence

### Local Storage
- Calculator theme preferences are saved to localStorage
- System theme preferences are managed by next-themes
- Graceful fallback when localStorage is unavailable

### Theme Storage Service
```typescript
// Save theme preference
ThemeStorage.saveCalculatorTheme("bmi");

// Retrieve saved theme
const savedTheme = ThemeStorage.getCalculatorTheme();
```

## Accessibility Features

1. **High Contrast**: All themes maintain WCAG contrast ratios
2. **System Preference Detection**: Respects user's system dark/light mode
3. **Keyboard Navigation**: All theme controls are keyboard accessible
4. **Screen Reader Support**: Proper ARIA labels and descriptions

## Best Practices

### Adding New Themes
1. Define color variables in `globals.css`
2. Add theme configuration to `theme-config.ts`
3. Create CSS utility classes
4. Update TypeScript types

### Theme Naming Convention
- Use descriptive names that reflect the theme's purpose
- Include both light and dark variants
- Maintain consistent naming patterns

### Performance Considerations
- Themes are applied via CSS custom properties (fast)
- No JavaScript color calculations at runtime
- Minimal bundle size impact

## Browser Support
- Modern browsers with CSS custom properties support
- Graceful degradation for older browsers
- Progressive enhancement approach

## Future Enhancements
- Additional calculator-specific themes
- User-customizable color schemes
- Theme preview animations
- Seasonal theme variations
