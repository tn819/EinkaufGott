---
name: "EinkaufGott Premium Organic"
version: "2.0.0"
description: "A high-end, mindful design system using earthy tones, diffuse depth, and organic shapes."

colors:
  # Light Mode (Sage & Bone)
  bg: "#FCFBF7"
  card: "#FFFFFF"
  text: "#1A1C18"
  text-secondary: "#43493E"
  muted: "#8E9286"
  border: "#E2E3D8"
  primary: "#3E5A30"
  primary-light: "#F1F4EE"
  secondary: "#D4A373"
  protein: "#BC4749"
  carbs: "#A3B18A"
  fat: "#606C38"

  # Dark Mode (Deep Moss)
  dark-bg: "#0F110A"
  dark-card: "#1A1D12"
  dark-text: "#E1E3DB"
  dark-text-secondary: "#C5C8BA"
  dark-primary: "#81A670"

typography:
  h1:
    fontSize: "28px"
    fontWeight: "800"
    lineHeight: "34px"
  h2:
    fontSize: "22px"
    fontWeight: "800"
  body:
    fontSize: "15px"
    fontWeight: "500"
    lineHeight: "24px"
  macro-value:
    fontSize: "16px"
    fontWeight: "800"
  macro-label:
    fontSize: "9px"
    fontWeight: "800"
    letterSpacing: "0.5px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"

rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "24px"

shadows:
  soft:
    shadowColor: "{colors.primary}"
    shadowOpacity: 0.06
    shadowRadius: 12
    elevation: 2
  medium:
    shadowColor: "{colors.primary}"
    shadowOpacity: 0.08
    shadowRadius: 20
    elevation: 4
---

## Overview
The **Premium Organic** refresh transforms EinkaufGott from a utilitarian tool into a mindful meal companion. The aesthetic is inspired by high-end editorial food magazines, emphasizing warmth, whitespace, and soft, natural depth.

## Colors
The palette shifts from standard Material Green to a **Sage & Forest** spectrum. 
- **Bone Background**: The primary background (`#FCFBF7`) provides a warmer, more premium feel than pure white.
- **Earthy Macros**: Protein, Carbs, and Fats use desaturated, earthy tones (Terra, Herb, Olive) to maintain information hierarchy without visual harshness.

## Typography
Uses a high-contrast weight system.
- **Bold Headers**: Primary titles use an extra-bold weight (`800`) to create strong focal points.
- **Humanist Body**: Text uses medium weight with increased line-height (`1.6x`) for maximum legibility during cooking.

## Elevation & Depth
The system eliminates 1px borders in favor of **Diffuse Shadows**.
- **Natural Lift**: Cards appear to float slightly above the surface with soft, primary-tinted shadows.
- **Interactive States**: Pressable elements use a 2% scale-down with haptic feedback to provide a tactile, responsive feel.

## Shapes
- **Organic Radii**: Large 24px corners on primary cards create a soft, inviting interface.
- **Dashboard Widgets**: The Macro Rings are treated as floating dials, using gradients and glow effects to signal progress.

## Components
- **Living Meal Cards**: Borderless containers with vertical macro stacks and glassmorphism tags.
- **Tactile Inputs**: Settings inputs use large touch targets and spring-physics steppers.
- **Synchronized Lists**: Shopping items use custom checkbox states that blend into the primary-light background when completed.
