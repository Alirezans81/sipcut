# SipCut UI Design System

## Design Principles

### Core Values

* Fast
* Minimal
* Professional
* Creator-focused
* AI-first

The interface should feel closer to Linear, Vercel and Notion than traditional video editors.

Avoid:

* Heavy gradients
* Excessive shadows
* Skeuomorphic design
* Too many colors

Preferred feeling:

* Clean
* Premium
* Focused
* Modern

---

# Color Palette

## Primary

Used for:

* Main CTA buttons
* Active states
* Progress indicators
* Important links

```css
Primary: #6366F1
Primary Hover: #5558E8
Primary Active: #4F46E5
```

---

## Background

```css
Background: #0F172A
Surface: #111827
Surface Secondary: #1F2937
Surface Hover: #374151
```

---

## Text

```css
Text Primary: #F9FAFB
Text Secondary: #9CA3AF
Text Muted: #6B7280
```

---

## Borders

```css
Border: #374151
Border Strong: #4B5563
```

---

## Status Colors

### Success

```css
#22C55E
```

### Warning

```css
#F59E0B
```

### Error

```css
#EF4444
```

### Info

```css
#3B82F6
```

---

# Typography

## Font

```txt
Inter
```

Fallback:

```txt
Inter, system-ui, sans-serif
```

---

## Font Sizes

### Display

```css
48px
font-weight: 700
```

### H1

```css
36px
font-weight: 700
```

### H2

```css
30px
font-weight: 600
```

### H3

```css
24px
font-weight: 600
```

### Body

```css
16px
font-weight: 400
```

### Small

```css
14px
font-weight: 400
```

### Caption

```css
12px
font-weight: 400
```

---

# Border Radius

```css
Small: 8px
Medium: 12px
Large: 16px
XL: 24px
```

Use:

* Buttons → 12px
* Inputs → 12px
* Cards → 16px
* Modals → 24px

---

# Shadows

### Small

```css
0 1px 2px rgba(0,0,0,0.1)
```

### Medium

```css
0 8px 24px rgba(0,0,0,0.2)
```

### Large

```css
0 20px 40px rgba(0,0,0,0.3)
```

Avoid strong shadows.

---

# Spacing System

Based on 4px grid.

```css
4
8
12
16
20
24
32
40
48
64
```

Never use random spacing values.

---

# Buttons

## Primary Button

Purpose:
Main CTA

Style:

```css
Background: Primary
Text: White
Radius: 12px
Height: 44px
Padding: 16px
```

Examples:

* Generate Video
* Export
* Upgrade Plan

---

## Secondary Button

Style:

```css
Background: Surface
Border: Border
Text: Primary
```

Examples:

* Cancel
* Back
* Duplicate

---

## Ghost Button

Style:

```css
Background: Transparent
Text: Secondary
```

Examples:

* Skip
* Learn More

````

---

## Danger Button

Style:

```css
Background: Error
Text: White
````

Examples:

* Delete Project
* Remove Asset

---

# Inputs

Height:

```css
44px
```

Style:

```css
Background: Surface
Border: Border
Radius: 12px
```

Focus:

```css
Border: Primary
```

---

# Cards

Used for:

* Projects
* Templates
* Exports
* Assets

Style:

```css
Background: Surface
Border: Border
Radius: 16px
Padding: 20px
```

Hover:

```css
Border: Primary
```

---

# Modals

Width:

```css
480px - 720px
```

Style:

```css
Background: Surface
Radius: 24px
```

Backdrop:

```css
rgba(0,0,0,0.6)
```

---

# Loading States

Use:

* Skeletons
* Progress bars
* Spinner only for very short actions

Never leave empty screens.

---

# Icons

Library:

```txt
Lucide React
```

Default size:

```css
18px
```

Large:

```css
24px
```

---

# Dashboard Layout

Sidebar:

```css
Width: 260px
```

Contains:

* Projects
* Templates
* Assets
* Billing
* Settings

---

Top Navigation:

Contains:

* Search
* Notifications
* User Menu

---

# AI Components

AI actions must always feel special.

Use:

```css
Badge Color:
#8B5CF6
```

Examples:

* AI Generate
* AI Subtitle
* AI Voiceover
* AI Translation

---

# Animations

Duration:

```css
150ms
200ms
250ms
```

Use:

* Fade
* Scale
* Slide

Avoid:

* Bounce
* Spin
* Flash

---

# Accessibility

Minimum contrast ratio:
WCAG AA

Clickable area:

```css
44px × 44px
```

Keyboard navigation must work everywhere.

---

# Empty States

Every empty page should include:

* Illustration
* Short explanation
* Primary CTA

Example:

"No videos yet"

Create your first video and start editing.

[ Create Video ]

---

# Overall Product Feeling

If Vercel + Linear + Notion had a child dedicated to AI video editing, SipCut should look like that.
