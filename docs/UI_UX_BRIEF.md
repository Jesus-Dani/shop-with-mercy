# UI/UX Design Brief — Shop With Mercy
_Version 1.0 — agreed June 2026_

## 1. Design Direction

Elegant, warm, and distinctly characterful. Confident and fun without being loud.
Signature element: full-width split two-panel hero with editorial outfit photographs.

## 2. Colour System

| Token | Hex | Role |
|---|---|---|
| Cornsilk | `#fefae0` | Page background (light mode) |
| Black Forest | `#283618` | Nav background; primary text; filled buttons (light mode) |
| Olive Leaf | `#606c38` | Secondary text; labels; muted UI elements |
| Sunlit Clay | `#dda15e` | Sale badges; accent tags; dark-mode secondary text |
| Copperwood | `#bc6c25` | Hover states; focused input border; dark-mode sale badge |

All five tokens and their derived variants are implemented as CSS custom properties in `src/app.css`.

### Contrast (WCAG AA)
- Black Forest on Cornsilk: ~12:1 ✓
- Cornsilk on Black Forest: ~12:1 ✓
- Olive Leaf on Cornsilk: ~7:1 ✓

## 3. Typography

- **Body / UI:** DM Sans (Google Fonts variable font — one HTTP request)
- **Display:** wordmark font — bold decorative all-caps serif used only for the nav wordmark

| Role | Size | Weight |
|---|---|---|
| Display | 32–40px | 700 |
| H1 | 24px | 600 |
| H2 | 20px | 600 |
| H3 | 16px | 600 |
| Body | 15px | 400 |
| Small / label | 13px | 400–500 |
| Micro | 11px | 500 |

## 4. Spacing System (8px base)

| Token | Value |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 40px |
| 2xl | 64px |

## 5. Layout

- Mobile: 2-column product grid, 16px gutter
- Tablet (≥768px): 3-column product grid, 24px gutter
- Desktop (≥1280px): 4-column product grid, max-width 1280px

## 6. Component Patterns

- **Product card:** image zoom on hover (CSS only), wishlist heart always visible on mobile
- **Primary button:** Black Forest fill, Cornsilk text, hover: Olive Leaf
- **Secondary button:** outlined, hover fills Black Forest
- **Inputs:** 1.5px Olive Leaf border, Copperwood on focus
- **Badges:** sale (Sunlit Clay), sold-out (muted Olive Leaf at 20%)

## 7. Iconography

Inline SVGs from Tabler Icons (outline, 1.5px stroke). 20px in nav, 18px in cards, 16px inline.

## 8. Motion

All transitions wrapped in `@media (prefers-reduced-motion: reduce)` — duration 0ms, transforms removed.

## 9. Mobile-First Principles

- Every layout decision starts at 375px
- Touch targets minimum 44×44px
- No hover-only interactions that hide critical functionality
- No sticky elements other than the nav

## 10. Accessibility (WCAG 2.1 AA)

- Visible focus outlines: 2px Copperwood (light) / Sunlit Clay (dark)
- `<label>` elements always associated with inputs
- `aria-label` on icon-only buttons
- Colour is never the only indicator of status

## 11. Performance Constraints

- No video backgrounds, no autoplay, no motion carousels
- No full-bleed background images on interior pages
- Hover effects CSS-only (zero JS)
- No third-party tracking scripts
- Skeleton loading screens on product grids
