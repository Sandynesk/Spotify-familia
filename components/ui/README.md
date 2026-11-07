# components/ui

All exports are available from `@/components/ui` and keep their implementation modules importable by name.

## Arquivos entregues

- `app/globals.css` — tokens e utilitários v2, foco e motion reduzido, mantendo os tokens `sp-*`.
- `app/(dashboard)/layout.tsx` — sessão, métricas do plano e casca do app.
- `app/(dashboard)/kit/page.tsx` and `KitShowcase.tsx` — vitrine interativa do design system.
- `components/layout/Sidebar.tsx`, `BottomNav.tsx`, and `Header.tsx` — navegação desktop/mobile e adaptador legado; `FAB.tsx` foi removido.
- `components/ui/**` — componentes, primitives de motion/haptics, barrel export e este contrato de API.

| Component | Public API |
|---|---|
| `Button` | `variant`, `size`, `loading`, `icon`, native button props, and children. |
| `IconButton` | Required `aria-label` and `icon`, with `default`, `ghost`, `glass`, or `danger` variants. |
| `Card` | Native div props plus `default`, `interactive`, or `hero` variant and `none`/`sm`/`md`/`lg` padding. |
| `Sheet` | `open`, `onClose`, `title`, optional `description` and `className`, plus children. |
| `SegmentedControl` | Typed `options`, current `value`, `onChange`, and required `aria-label`. |
| `ProgressRing` | `value` from 0–100, optional `size`, `strokeWidth`, center `label`/`caption`, and color. |
| `NumberTicker` | Numeric `value` with optional formatter, decimal count, duration, prefix, suffix, and class. |
| `Badge` / `StatusBadge` | `status` (`pago`, `pendente`, `atrasado`), optional label and class. |
| `Avatar` | `nome`, optional `cor`, `size`, `status` ring, and class; `AvatarStack` takes `avatars`, `max`, and `size`. |
| `ListGroup` | Children with optional section `title`, `footer`, and class. |
| `ListRow` | `title`, optional description/icon/value/trailing content, and optional `href` or `onClick`. |
| `SwipeRow` | Children, `actionLabel`, `onAction`, and optional `actionIcon` or classes. |
| `EmptyState` | Required `title`, optional description/action/icon, and class. |
| `Skeleton` | Utility `className` plus `rounded` or `text`/`circle`/`rect` variant. |
| `ToastProvider` / `useToast` | Legacy `toast`/`success`/`error`/`warning` plus `show({ message, type, action, duration })`. |
| `PageHeader` | Required `title`, optional subtitle/eyebrow/actions/back behavior, compact mode, and class. |
| `SectionHeader` | Required section `title`, optional description, action label/link/callback/custom action, and class. |
| `SlotsRing` | `occupied`, `paid`, `total`, `size`, optional accessible label and class. |
| `Confetti` / `fireConfetti` | Increment the component `trigger` prop or pass a canvas to the imperative helper. |
| `Kbd` | Keyboard label as children plus native keycap props. |
| `Input` / `Textarea` | Native field props plus required label, optional error/hint; `Input` also accepts a prefix. |
| `SpotifyLogo` | Existing `size`, `color`, and `className` API retained for auth screens. |
| `haptic` | `haptic('light' | 'success' | 'warning')`, safely no-op without vibration support. |
| `springs` | `snappy`, `soft`, and `bouncy` shared Framer Motion transitions. |

`app-glass`, `app-aurora`, `app-noise`, and `tabular` are the shared CSS utilities. `Header` in `components/layout` remains a compact adapter for legacy pages; new pages should use `PageHeader`.

## Implementation notes

- Payment status badges pair an icon with text; the avatar stack uses the shared initials avatar and status ring.
- Interactive motion uses the shared springs or reduced-motion-aware Framer Motion hooks; CSS motion stops for reduced-motion users.
- The native `dialog` remains the Sheet primitive to preserve the existing public API and browser focus handling.
- Sidebar plan usage is computed server-side from active members and settings, then passed as serializable props.
- The app shell signs out through a POST form to `/sair`; no Supabase client is used in navigation components.

## Verification

- `npx tsc --noEmit`: passed with no output.
- `npx eslint app/globals.css components/ui components/layout "app/(dashboard)/layout.tsx" "app/(dashboard)/kit"`: passed with no errors; ESLint reports that CSS has no matching configuration and ignores that file.
- `npm run build`: passed; Next.js reports `Compiled successfully` and includes `/kit` as a dynamic route.
- Smoke at port 3201: `/` and `/login` returned 200; `/kit` returned 307 to `/login`, as the layout requires a session.

## Pendências para o CEO

- The shell is wired to routes delivered by other workers: `/cobrar`, `/mais`, `/agenda`, `/retrospectiva`, and POST `/sair`.
- The current worktree does not include the `/demo` route, so `/kit` remains session-protected by the existing dashboard layout during local browser review.
