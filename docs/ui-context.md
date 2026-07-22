# UI Context � Mini Market Myanmar

## Design System Overview

The UI is built on **shadcn/ui** (Radix-based primitives, `radix-vega` style variant) with **Tailwind CSS v4** for utility classes. The design uses OKLCH colour values for perceptual uniformity in both light and dark modes.

---

## Typography

| Variable            | Font                       | Usage                                 |
| ------------------- | -------------------------- | ------------------------------------- |
| `--font-sans`       | **Figtree** (Google Fonts) | Primary body and UI font              |
| `--font-geist-sans` | **Geist Sans**             | Supplemental / code-adjacent text     |
| `--font-geist-mono` | **Geist Mono**             | Monospaced / `--font-mono`            |
| `--font-mm`         | **Noto Sans Myanmar**      | Myanmar locale text (weights 300�700) |

### Base Sizing

- Default: `font-size: 1rem`, `line-height: 1.5`
- Myanmar locale (`lang="mm"`): `font-size: 1.0625rem`, `line-height: 1.7`, `font-size sm: 0.75rem`

### Font Application

- `<html>` applies `font-sans` by default
- When `lang="mm"` is set on `<html>`, Myanmar font is prioritised via `font-family: var(--font-mm), var(--font-sans)`

---

## Colour Palette

Colours are defined as **OKLCH CSS custom properties** and mapped into Tailwind via `@theme inline`. All component colours reference these tokens � never raw hex or rgb.

### Light Mode (`:root`)

| Token                  | OKLCH Value                  | Description             |
| ---------------------- | ---------------------------- | ----------------------- |
| `--background`         | `oklch(1 0 0)`               | Pure white              |
| `--foreground`         | `oklch(0.148 0.004 228.8)`   | Near-black, blue-tinted |
| `--primary`            | `oklch(0.5 0.134 242.749)`   | Mid-blue (brand colour) |
| `--primary-foreground` | `oklch(0.977 0.013 236.62)`  | Near-white              |
| `--secondary`          | `oklch(0.967 0.001 286.375)` | Light grey              |
| `--muted`              | `oklch(0.963 0.002 197.1)`   | Subtle teal-grey        |
| `--muted-foreground`   | `oklch(0.56 0.021 213.5)`    | Medium grey             |
| `--accent`             | `oklch(0.963 0.002 197.1)`   | Same as muted           |
| `--destructive`        | `oklch(0.577 0.245 27.325)`  | Red (errors/delete)     |
| `--border`             | `oklch(0.925 0.005 214.3)`   | Subtle border           |
| `--input`              | `oklch(0.925 0.005 214.3)`   | Input border            |
| `--ring`               | `oklch(0.723 0.014 214.4)`   | Focus ring              |
| `--radius`             | `0.45rem`                    | Base border radius      |

### Dark Mode (`.dark`)

| Token           | OKLCH Value                 | Description                         |
| --------------- | --------------------------- | ----------------------------------- |
| `--background`  | `oklch(0.148 0.004 228.8)`  | Deep navy                           |
| `--foreground`  | `oklch(0.987 0.002 197.1)`  | Near-white                          |
| `--card`        | `oklch(0.218 0.008 223.9)`  | Slightly lighter than background    |
| `--primary`     | `oklch(0.443 0.11 240.79)`  | Darker blue (adjusted for contrast) |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Softer red                          |
| `--border`      | `oklch(1 0 0 / 10%)`        | White at 10% opacity                |
| `--input`       | `oklch(1 0 0 / 15%)`        | White at 15% opacity                |

### Chart Colours (Blue scale, light + dark)

```
chart-1: oklch(0.828 0.111 230.318)  � lightest blue
chart-2: oklch(0.685 0.169 237.323)
chart-3: oklch(0.588 0.158 241.966)
chart-4: oklch(0.5  0.134 242.749)
chart-5: oklch(0.443 0.11 240.79)   � darkest blue
```

### Sidebar Tokens

Sidebar has its own token set:

- `--sidebar` / `--sidebar-foreground`
- `--sidebar-primary` / `--sidebar-primary-foreground`
- `--sidebar-accent` / `--sidebar-accent-foreground`
- `--sidebar-border` / `--sidebar-ring`

---

## Border Radius Scale

| Tailwind Token | Value                           |
| -------------- | ------------------------------- |
| `rounded-sm`   | `calc(0.45rem * 0.6)` ? 0.27rem |
| `rounded-md`   | `calc(0.45rem * 0.8)` ? 0.36rem |
| `rounded-lg`   | `0.45rem` (base)                |
| `rounded-xl`   | `calc(0.45rem * 1.4)` ? 0.63rem |
| `rounded-2xl`  | `calc(0.45rem * 1.8)` ? 0.81rem |
| `rounded-3xl`  | `calc(0.45rem * 2.2)` ? 0.99rem |
| `rounded-4xl`  | `calc(0.45rem * 2.6)` ? 1.17rem |

---

## Theme

- **Provider**: `next-themes` with `attribute="class"` (adds `dark` class to `<html>`)
- **Default**: `system` (follows OS preference)
- Theme toggled via `ThemeToggle` / `ThemeSwitcher` component
- `disableTransitionOnChange` is enabled to prevent flash on toggle

---

## Component Library

- **Source**: `shadcn/ui` � components are copied into `src/components/ui/`
- **Style variant**: `radix-vega`
- **Icon library**: `@hugeicons/react` (configured in `components.json`)
- **Aliases**:
  - `@/components`  `src/components`
  - `@/components/ui`  `src/components/ui`
  - `@/lib`  `src/lib`
  - `@/hooks`  `src/hooks`

### Available UI Primitives

| Component             | Notes                                                                |
| --------------------- | -------------------------------------------------------------------- |
| `Button`              | CVA variants (primary, secondary, destructive, ghost, outline, link) |
| `Input` / `Textarea`  | Standard form controls                                               |
| `Field`               | Label + input + error wrapper                                        |
| `InputGroup`          | Addons/prefix/suffix for inputs                                      |
| `Select`              | Radix Select primitive                                               |
| `Checkbox` / `Switch` | Toggle controls                                                      |
| `Badge`               | Status labels                                                        |
| `Avatar`              | User avatar with fallback                                            |
| `Breadcrumb`          | Page breadcrumb nav                                                  |
| `Tabs`                | Tab navigation                                                       |
| `Table`               | Data table wrapper                                                   |
| `Dropdown Menu`       | Context menus                                                        |
| `Sheet`               | Slide-over panel                                                     |
| `Alert Dialog`        | Confirmation modals                                                  |
| `Tooltip`             | Hover tooltips                                                       |
| `Skeleton`            | Loading placeholders                                                 |
| `Sonner`              | Toast notifications (`richColors` enabled globally)                  |
| `Sidebar`             | Full sidebar component with sections and collapsible groups          |
| `Collapsible`         | Expandable content                                                   |
| `Separator`           | Visual divider                                                       |

---

## Layout Components

| Component           | Location                                   | Purpose                                       |
| ------------------- | ------------------------------------------ | --------------------------------------------- |
| `DashboardLayout`   | `components/layout/dashboard-layout.tsx`   | Sidebar + content wrapper for dashboard       |
| `DynamicBreadcrumb` | `components/layout/dynamic-breadcrumb.tsx` | Auto-generates breadcrumbs from pathname      |
| `MainHeader`        | `components/layout/main-header.tsx`        | Top-level header for public pages             |
| `PublicFooter`      | `components/layout/public-footer.tsx`      | Footer with links and newsletter (i18n-aware) |
| `SideBar`           | `components/layout/side-bar/`              | Shop dashboard sidebar with nav links         |

---

## Styling Conventions

1. Use `cn()` (`clsx` + `tailwind-merge`) from `@/lib/utils` for conditional class names
2. Never use raw hex/rgb colours � always use Tailwind colour tokens that map to CSS variables
3. Use `@apply` sparingly � only in `globals.css` base layer
4. The `container` utility is defined as a custom `@utility` with `margin-inline: auto` and responsive padding
5. Animations use `tw-animate-css` imported in `globals.css`
