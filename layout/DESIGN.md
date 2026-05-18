---
name: FinTrack Professional
colors:
  surface: '#f8f9ff'
  surface-dim: '#d8dae0'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fa'
  surface-container: '#ecedf4'
  surface-container-high: '#e7e8ef'
  surface-container-highest: '#e1e2e9'
  on-surface: '#191c21'
  on-surface-variant: '#414751'
  inverse-surface: '#2e3036'
  inverse-on-surface: '#eff0f7'
  outline: '#727782'
  outline-variant: '#c1c7d3'
  surface-tint: '#0860aa'
  primary: '#00457f'
  on-primary: '#ffffff'
  primary-container: '#005da7'
  on-primary-container: '#bcd6ff'
  inverse-primary: '#a3c9ff'
  secondary: '#006e1c'
  on-secondary: '#ffffff'
  secondary-container: '#96f592'
  on-secondary-container: '#0a7320'
  tertiary: '#713200'
  on-tertiary: '#ffffff'
  tertiary-container: '#954501'
  on-tertiary-container: '#ffc9ab'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e3ff'
  primary-fixed-dim: '#a3c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#99f894'
  secondary-fixed-dim: '#7edb7b'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005313'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb68b'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#753400'
  background: '#f8f9ff'
  on-background: '#191c21'
  surface-variant: '#e1e2e9'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  h2:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 14px
  label-small:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  nav-mobile:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 4px
  base: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 16px
---

## Brand & Style
FinTrack embodies a **Corporate Modern** aesthetic tailored for the financial technology sector. The visual language is defined by precision, reliability, and functional clarity. It prioritizes information density without sacrificing legibility, utilizing a systematic approach to hierarchy that feels both institutional and accessible.

The design movement is rooted in **Material 3 principles**, featuring a neutral, high-contrast palette and a rigid structural grid. The emotional response is one of controlled efficiency—users should feel that their data is secure and organized within a logical, predictable environment.

## Colors
The palette is built on a foundation of professional blues and high-utility neutrals. 

- **Primary Blue (#005DA7)**: Used for high-emphasis actions and active navigation states.
- **Surface Strategy**: A multi-tiered neutral system (F8F9FF background) uses white (#FFFFFF) for primary content cards to create immediate focus through contrast.
- **Semantic Feedback**: Error states use a high-visibility soft-red container (#FFDAD6) with deep-red text to ensure accessibility and immediate attention.
- **Interaction States**: Subtle gray-washes (Surface Container Low) are utilized for table row hovering and secondary button backgrounds.

## Typography
The system uses **Inter** exclusively to maintain a utilitarian, Swiss-inspired clarity. 

- **Hierarchy**: Bold weights (700) are reserved for primary branding, while Semibold (600) identifies sub-headers and interactive elements.
- **Utility**: Small labels (12px) use a slightly lighter color token (on-surface-variant) to recede visually, while keeping critical data points in the body (14px) at maximum contrast.
- **Rhythm**: Line heights are tight for buttons (1:1 ratio) to ensure vertical centering, while body copy maintains a 1.4x ratio for comfortable reading.

## Layout & Spacing
The layout follows a **12-column fixed grid** with a maximum width of 1280px (7xl), transitioning to a single-column fluid stack on mobile devices.

- **Grid Logic**: On desktop, a 4-8 split is used to separate management controls (Sidebars) from data views (Tables).
- **Vertical Rhythm**: A base-8 system (8px, 16px, 24px) dictates all margins and padding. 
- **Safe Areas**: Page content is inset by 16px (container-padding) to ensure elements don't touch the viewport edge. Top navigation is fixed at 56px (h-14).

## Elevation & Depth
The system uses **Tonal Layers** combined with **Low-contrast Outlines** rather than aggressive shadows.

- **Surfaces**: The primary background is the lowest level (#F8F9FF). Cards and sections sit on the "Surface Container Lowest" (#FFFFFF).
- **Borders**: All containers are defined by a 1px solid border (#C1C7D3).
- **Shadows**: Only two levels are used: `shadow-sm` for standard cards to provide a subtle lift, and `shadow-lg` for fixed navigation elements like the mobile bottom bar to indicate its position on the Z-axis above all other content.

## Shapes
The shape language is **Soft and Systematic**. 

- **Primary Radius**: Standard buttons and input fields use a 0.25rem (4px) radius.
- **Large Components**: Cards and container sections use a more pronounced 0.75rem (12px) radius (rounded-xl) to soften the professional interface and create visual distinction between the grid and its contents.
- **Interactive States**: Hover states for icons and table rows adopt the radius of their parent container or a standard 8px (rounded-lg).

## Components
- **Buttons**: Primary buttons are high-saturation (#005DA7) with 16px horizontal padding and 8px vertical padding. They include 18px icons with a 4px gap.
- **Input Fields**: Default state uses a gray outline (#717783). Focus states transition to the primary color with a 20% opacity ring for accessibility.
- **Tables**: Header rows use a shaded background (#ECEDF5). Body rows feature a `divide-y` separator and a subtle gray hover state.
- **Alerts**: Error banners use an 8px border-radius and a distinctive left-border accent (4px width) in the semantic error color to ensure the message is unavoidable.
- **Navigation**: Desktop uses a bottom-border (2px) active indicator; Mobile uses a vertical stack of 24px icons and 10px text labels.