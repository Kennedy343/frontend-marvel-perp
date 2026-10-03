# Marvel ERP - Frontend Project

## Project Overview
**Marvel** is a high-fidelity, enterprise-grade Resource Planning (ERP) platform. This frontend is built with a focus on data density, financial accuracy, and a minimalist, modern aesthetic.

## AI Interaction Mandates (CRITICAL)
1.  **Explanation First:** Always provide a brief explanation of the intent and specific commands BEFORE execution.
2.  **User Knowledge Exception:** If the user indicates familiarity (e.g., "Ya sé"), proceed directly after brief confirmation.
3.  **Command Transparency:** Always display the exact shell commands intended to run.
4.  **Conventional Commits:** All commits must follow the Conventional Commits standard (e.g., `feat(module): description`, `fix(scope): description`).

## Tech Stack
- **Framework:** React 19 (TypeScript)
- **Navigation:** React Router Dom v7
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (Custom theme tokens)
- **State Management:** Zustand
- **HTTP Client:** Axios (with interceptors for 401 handling)
- **Package Manager:** `pnpm`
- **Typography:** Sora (headings/display), DM Sans (body/data)

## Architecture & Conventions
- `src/app/`: App entry point (main.tsx, App.tsx with router, routes, providers).
- `src/modules/`: Feature-based modules. **Each module is self-contained** and mirrors the structure of `src/modules/crm/` as its reference pattern:
  ```
  src/modules/<feature>/
  ├── pages/      # Route-level components (e.g. ClientsPage)
  ├── components/ # Feature-scoped UI components
  ├── hooks/      # Feature-scoped logic hooks (e.g. useClients)
  ├── services/   # HTTP calls (e.g. clientService)
  └── types/      # Feature-scoped TypeScript types (e.g. client.ts)
  ```
  Not every module needs every folder — only add the ones the feature actually uses.
  - `auth/`: Authentication (LoginPage, ProtectedRoute).
  - `administracion/`: Users, Roles, Branches CRUD.
  - `dashboard/`: Main dashboard with KPIs.
  - `crm/`: Clients module (reference pattern for module structure).
- `src/components/layout/`: Global structure (Sidebar, Header, MainLayout).
- `src/components/common/`: Atomic UI components (KPICard, DeleteConfirmationModal).
- `src/lib/`: Utilities, configuration (navigation.tsx, axios.ts instance).
- `src/store/`: Zustand stores (authStore with login, logout, checkSession).
- `src/hooks/`: Global reusable hooks.
- `src/styles/`: Global CSS, Tailwind theme tokens.
- `src/types/`: Global type definitions shared across modules (User, Role, Sucursal, NavItem). Feature-scoped types belong inside the module (`src/modules/<feature>/types/`), not here.

## Coordinación & Documentos Externos
- Leer ANTES de conectar una pantalla al backend:
  - `C:\Users\PC\Desktop\Instruction\Instruction\context.md` (Windows) o `~/Escritorio/Instruction/context.md` (Linux) → contratos de API (auth, clientes, sectores, categorías).
  - `C:\Users\PC\Desktop\Instruction\Instruction\instruccion.md` (Windows) o `~/Escritorio/Instruction/instruccion.md` (Linux) → flujo de trabajo del frontend.
  - `C:\Users\PC\Desktop\Instruction\Instruction\simultaneo.md` (Windows) o `~/Escritorio/Instruction/simultaneo.md` (Linux) → reglas de coordinación back/front.
- Los 3 md los actualiza la terminal de backend; AGENTS.md solo los referencia, no los duplica.
- Fuente oficial del contrato: **Swagger UI** en `http://localhost:3000/api/docs` (spec JSON siempre disponible en `/api/docs-json`). Ante cualquier diferencia, **prevalece Swagger**.

### Cómo indagar el backend desde Swagger
- **Requisito:** backend corriendo (`pnpm start:dev` en `~/Escritorio/backend-marvel/backend-marvel`).
- **UI interactiva** (`http://localhost:3000/api/docs`, solo en desarrollo por `SWAGGER_ENABLED`):
  1. `POST /api/auth/login` → **Try it out** → **Execute** → copiar el `accessToken`.
  2. Botón **Authorize** → pegar `Bearer <accessToken>` → **Authorize**.
  3. Probar el endpoint deseado (método, ruta, body, parámetros, respuestas).
- **Spec JSON** (`http://localhost:3000/api/docs-json`): siempre disponible en cualquier entorno; lee el contrato sin login y programáticamente, p. ej.:
  ```bash
  curl -s http://localhost:3000/api/docs-json | python3 -c \
    "import sys,json; d=json.load(sys.stdin); \
     [print(p, list(m)) for p,m in d['paths'].items() if 'compra' in p.lower()]"
  ```
- **Código fuente del backend:** para ver respuestas anidadas completas (relaciones), leer el controlador, DTOs y servicio del módulo en `~/Escritorio/backend-marvel/backend-marvel/src/<modulo>`.
- **Prevalencia:** ante cualquier diferencia entre Swagger y los md, **prevalece Swagger**.
- No inventar endpoints ni estructuras de respuesta. Mantener la misma nomenclatura del backend.

## Custom Theme (Tailwind v4)
Defined in `src/styles/index.css` via `@theme`:
- **Fonts:** `font-sora` (headings), `font-dm-sans` (body/data)
- **Colors:** `primary-blue` (#2563EB), `primary-blue-light` (#60A5FA), `navy-950` (#0B1B3B), `error-red` (#DC2626), `bg-gray` (#F9FAFB)
- **Border radius:** `rounded-lg` (8px)
- **Shadows:** `shadow-soft`, `shadow-card`
- **Motion:** `animate-rise` (use with `motion-safe:`)

## User Type Convention (CRITICAL)
The `User` interface in `src/types/user.ts` uses descriptive field names:
- `nombreCompleto` (not `nombre`)
- `correoElectronico` (not `correo`)
- `rolAsignado` (not `rol`)
- `id: number | string`

When mapping backend responses (`BackendUser`: `nombreUsuario`, `correoUsuario`, `idRol`, `rol.nombreRol`), map to the User fields in the service layer.

## API Request Rules (frontend)
- Usar la instancia de axios de `src/lib/axios.ts` (ya configura `withCredentials` y el interceptor de `401` → `/auth/refresh` una vez y reintentar).
- El `accessToken` va en el header `Authorization: Bearer <token>` (el interceptor lo añade).
- Credenciales: `withCredentials` / `credentials: 'include'` (cookie `refresh_token` HttpOnly; el front NO la guarda manualmente).
- Los permisos/rol se validan contra la BD en cada petición (un cambio de rol/permiso se refleja sin esperar a que expire el `accessToken`).
- Ante `401` en llamada autenticada → refrescar una vez y reintentar; si falla, redirigir a login.
- **Scope por sucursal:** un rol no-admin ve/crea clientes solo en sus sucursales (`idSucursal` ajeno → `403`/`404` o lista vacía). El admin ve todo.
- Soft Delete: las acciones destructivas usan eliminación lógica.
- Confirmar método, ruta, entrada y respuesta con Swagger/`context.md` ANTES de implementar; usar datos simulados solo si el endpoint aún no existe.

## Development Standards
1.  **Performance:**
    *   Use functional updates for state: `setState(prev => ...)` to avoid stale closures.
    *   Use `useRef` for values that don't affect rendering (e.g., IDs for deletion).
    *   Group related states or use `useReducer` for complex pages.
    *   Run independent async calls together with `await Promise.all(items.map(...))`; never `await` inside a loop when iterations are independent (no `async-await-in-loop`).
    *   Combine chained iterations (`filter().map()`, `map().filter()`) into a single `.reduce()` or `for...of` loop; prefer `.flatMap()` only for change-and-drop in one pass. Do not chain `map/filter/forEach/flatMap`.
    *   Hoist pure functions and static values that use no local state to module scope (outside the component) so they are not rebuilt on every render (`prefer-module-scope-pure-function`, `prefer-module-scope-static-value`).
    *   Read "latest" callbacks inside an effect with `useEffectEvent` instead of adding recreated values to the dependency array or writing to a ref during render.
    *   Split components over ~300 lines into focused subcomponents with a single responsibility (`no-giant-component`).
2.  **Modern Tailwind:**
    *   Use shorthand `size-N` for square elements (e.g., `size-10` instead of `w-10 h-10`).
3.  **Accessibility (A11y):**
    *   Always associate `<label>` with `<input>` using `htmlFor` and `id`, or nest the control inside the label (`label-has-associated-control`). For group titles that label no single control, use `<p>` instead of `<label>`.
    *   Give static elements with click handlers an interactive `role` (e.g. `role="button"`) plus `tabIndex` and keyboard handlers, or use a native `<button>`/`<a>` (`no-static-element-interactions`).
    *   Use the native `<dialog>` (opened with `showModal()`) for modals instead of hand-rolled `role="dialog"` wrappers, to get focus trapping, `Escape` and `::backdrop` for free (`prefer-html-dialog`).
    *   Ensure high contrast for text (e.g., use `text-blue-700` over `bg-blue-50` instead of `text-blue-400`).
4.  **UX / UI:**
    *   Use typographic ellipsis «…» instead of three periods «...».
    *   Headings `<h3>` should use `font-semibold` instead of `font-bold` for better rendering.
    *   Action buttons in tables must be permanently visible.
    *   Dashboard KPI cards use distinct accent colors: blue (users), emerald (sucursales), violet (roles).

## Data Policies
1.  **Soft Delete:** Destructive actions must use logical deletion (Soft Delete) to preserve financial history.
2.  **CRUD Flow:** Use the notification system for all asynchronous operations (Save, Update, Delete).
3.  **Confirmations:** Use the shared `DeleteConfirmationModal` (built on the native `<dialog>`) instead of native `window.confirm`.

## Code Quality Rules
Apply these conventions when writing/refactoring code:
- **`async-await-in-loop`** — Collect independent calls and run them together: `await Promise.all(items.map(...))`. Keep sequential `for...of` only for ordered side effects, authorization gates, transactions, or cumulative state.
- **`js-flatmap-filter`** — Replace `.map().filter(Boolean)` with `.flatMap(item => condition ? [item] : [])`.
- **`js-combine-iterations`** — Fuse chained `.filter().map()`/`.map().filter()` into one pass with `.reduce()` or a `for...of` loop (prefer `.reduce()` for inline mappings).
- **`prefer-module-scope-pure-function` / `prefer-module-scope-static-value`** — Move pure functions and constant arrays/objects to module scope (outside the component) so they are not rebuilt on every render.
- **`no-giant-component`** — Split components over ~300 lines into focused subcomponents (e.g. `EditarClientesHeader`, `ClienteGrid`, `ClienteList`, `ClientesPagination`) with a single responsibility.
- **`prefer-html-dialog`** — Modals use the native `<dialog>` opened with `showModal()` (see `DeleteConfirmationModal`); handle backdrop clicks with `event.target === dialog` and close on the native `cancel` event.
- **`label-has-associated-control`** — Every `<label>` must have `htmlFor` or wrap its control. Group headings that don't label a single control are `<p>`, not `<label>`.
- **`no-static-element-interactions`** — Clickable static elements must have `role`, `tabIndex` and keyboard handlers, or be a native `<button>`/`<a>`. When a div is kept, gate keydown to `event.target === event.currentTarget` to avoid bubbling from nested controls.
- **`no-set-state-after-await-in-effect`** — In a `useEffect` whose dependencies can change, guard every setter that runs after an `await` behind a dominating cancellation flag: `let ignore = false` → `if (ignore) return` before the setters → `finally { if (!ignore) … }` → cleanup `ignore = true; controller.abort()`. A combined guard (`!ignore && …`) may not be detected; prefer an early `if (ignore) return`.
- **`no-array-index-as-key`** — Never use `key={index}` from the `map` index; use a business id (`item.id`, `item.slug`) or a stable composite (`item.dataKey ?? nameKey`). Index keys break when the list reorders or filters.
- **`no-adjust-state-on-prop-change`** — Do not reset state inside an effect when a prop changes; mount conditionally or reset with `key` (see `QuickCreate*Modal`). Do not use an effect to "synchronize" state with props.
- **Modal toasts (top-layer)** — Inside a native `<dialog>`, mount `<Toaster id="…" position="top-center" />` **inside the dialog** and emit `toast.warning(msg, { toasterId })` (the global `<Toaster>` would render behind the backdrop). API errors stay inline via `feedbackError`.
- **`deslop/unused-file`** — Delete source files not reachable from any entry point; no dead exports (e.g. removed `administracion/lib/modulos.ts`).
- **`require-pnpm-hardening`** — `pnpm-workspace.yaml` keeps `minimumReleaseAge: 10080` and `blockExoticSubdeps: true`. Do **not** set `trustPolicy: no-downgrade` — it breaks installs on the existing Babel→`semver@6.3.1` lockfile dependency (see `ERR_PNPM_TRUST_DOWNGRADE`).

## Current Branches
- `development`: Integration branch (all features merged here).
- `feature/login`: Authentication with Zustand, ProtectedRoute, axios interceptors.
- `feature/dashboard`: KPI dashboard (merged into development).
- `feature/eliminar-usuario`: User deletion (merged).
- `feature/editar-usuario`: User editing (merged).
- `feature/react-optimize`: Performance optimizations (merged).
- `refactor/estructura`: Project restructuring (app/, styles/, lib/) (merged).