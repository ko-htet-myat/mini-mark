# Code Standards � Mini Market Myanmar

## Language & Runtime

- **Language**: TypeScript (strict mode via `tsconfig.json`)
- **Runtime**: Node.js (Next.js App Router)
- **Package manager**: `pnpm` (workspaces enabled via `pnpm-workspace.yaml`)
- **Node types target**: `@types/node ^20`

---

## File & Folder Naming

| Item             | Convention                         | Example                                             |
| ---------------- | ---------------------------------- | --------------------------------------------------- |
| Files            | kebab-case                         | `product-form.tsx`, `get-session.ts`                |
| Folders          | kebab-case                         | `features/products/`, `components/layout/`          |
| React components | PascalCase export, kebab-case file | `export function ProductCard` in `product-card.tsx` |
| Server actions   | camelCase function                 | `createProduct`, `updateBrand`                      |
| Zod schemas      | camelCase + `Schema` suffix        | `createProductSchema`                               |
| Types/interfaces | PascalCase                         | `ProductWithDetails`                                |

---

## Path Aliases

All imports use `@/` prefix (configured in `tsconfig.json`):

```ts
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createProduct } from "@/features/products/actions";
```

Never use relative imports that cross feature boundaries.

---

## React Patterns

### Server vs Client Components

- **Default to Server Components** � no `"use client"` unless the component uses hooks, event handlers, or browser APIs
- Mark files with `"use client"` only when necessary (interactivity, `useState`, `useEffect`, etc.)
- Mark server action files with `"use server"` at the top

### Server Actions

- All mutations are implemented as **next-safe-action** server actions
- Use the correct client from the hierarchy:
  - `actionClient` � unauthenticated, public mutations
  - `authClient` � requires authentication
  - `shopOwnerActionClient` � requires auth + shop ownership (always bind shop slug as first bind arg)
- Input is validated with Zod schemas defined in the feature's `validations/` folder
- Always call `revalidatePath()` after mutations that affect cached server component data
- Wrap Prisma calls in try/catch; map Prisma error codes (`P2002`  slug conflict, `P2025`  not found) to user-friendly messages

### Forms

- Use **react-hook-form** with `@hookform/resolvers/zod` for validation
- Pair with `@next-safe-action/adapter-react-hook-form` (`useHookFormAction`)
- Never manage form state manually with `useState` for multi-field forms

### Data Fetching

- Read queries live in `features/<name>/data/` as plain async functions using the Prisma client
- Call them directly in Server Components (no API round-trip needed)
- For client-side data that needs real-time updates, use **TanStack Query** (`@tanstack/react-query`)

---

## Validation (Zod)

- Use **Zod v4** (`zod ^4`)
- Define schemas in `features/<name>/validations/index.ts` (or split per-entity)
- Re-use schemas between server actions and react-hook-form resolvers
- Prefer `.trim()` on string fields, `.optional()` vs `.nullable()` deliberately

---

## Prisma Conventions

- Client singleton in `src/lib/prisma.ts`
- All generated types come from `@/generated/prisma/client` � never from `@prisma/client` directly
- Use transactions (`prisma.$transaction`) when multiple writes must be atomic
- Always scope reads to `shopId` � never query across shops
- Use `@unique([shopId, slug])` for all slug fields to prevent collisions within a shop

---

## Styling

- Use `cn()` (`clsx` + `tailwind-merge`) for conditional classnames � never string concatenation
- Use Tailwind tokens that map to CSS custom properties � never hardcoded colours
- Prefer responsive classes (`sm:`, `md:`, `lg:`) over inline media queries
- Keep component-level styles in the component file, not in globals.css
- `globals.css` is only for: base layer resets, CSS variable definitions, and `@utility` overrides

---

## Internationalisation

- All user-facing strings must use `next-intl` � no hardcoded strings in components
- Server components: `getTranslations()` from `next-intl/server`
- Client components: `useTranslations()` hook
- Translation keys live in `messages/en.json` and `messages/mm.json`
- Add keys to **both** files simultaneously

---

## Error Handling

- Server actions catch Prisma errors and throw human-readable `Error` messages
- `handleServerError` in `actionClient` surfaces the `error.message` to the client
- Never expose raw Prisma error messages or stack traces to the client
- Use `sonner` toasts to display action success/error feedback to the user

---

## Image Uploads

- Use the `useCloudinary` hook (`src/features/cloudinary/use-cloudinary.ts`) for client-side uploads
- Signed upload params are fetched from `/api/sign-cloudinary-params`
- Use `ImageUploadField` component (`src/features/cloudinary/image-upload-field.tsx`) for forms
- Always store only the Cloudinary public URL string in the DB, not the file

---

## Testing

- Test runner: **Vitest** with `jsdom` environment
- Testing Library: `@testing-library/react` + `@testing-library/dom`
- Test files go in `src/tests/` or colocated as `*.test.ts(x)` next to the file
- Run tests: `pnpm test`
- **Never mark a task complete without running its associated tests**

---

## Code Quality

- **Linter**: ESLint v9 with `eslint-config-next`
- **Formatter**: Prettier v3
- **Pre-commit**: Husky + lint-staged
  - `*.{js,jsx,ts,tsx}`  `eslint` + `prettier --write`
  - `*.{json,md,css}`  `prettier --write`
- Run lint: `pnpm lint`

---

## Commit Discipline

- Do not commit generated files from `src/generated/prisma/` unless intentional
- `.env` is gitignored � never commit secrets
- Migration files in `prisma/migrations/` are committed and treated as the migration history
