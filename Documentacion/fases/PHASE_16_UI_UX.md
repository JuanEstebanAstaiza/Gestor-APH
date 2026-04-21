# Phase 16 — UI/UX Refinement

## Estado: PENDIENTE

## Objetivo
Refactorizar la UI para tener tema visual consistente, formularios completos, navegación real y responsive design.

## Contexto
Actualmente los componentes tienen inline styles temporarios. Esta fase los refactoriza con un tema CSS completo.

## Deliverables

### Theme system
- `frontend/src/styles/theme.css` — CSS variables para todo el sistema de diseño
- Colors: primary, secondary, accent, success, warning, error, neutral
- Typography: font sizes, line heights, weights
- Spacing: consistent padding/margin scale
- Shadows: elevation system
- Borders: border-radius scale
- Dark mode support (optional)

### Navigation
- Sidebar con navegación real por módulo
- Active state highlighting
- Collapsible sidebar
- Mobile hamburger menu

### Forms
- Formularios completos con validación para todos los módulos
- Error messages consistentes
- Loading states en submit
- Success feedback
- Input validation (required, patterns, ranges)

### DataTable improvements
- Pagination UI real (client-side)
- Sort indicators
- Column resize
- Row hover states
- Empty states

### Component library
- Button variants (primary, secondary, ghost, danger)
- Input components (text, select, date, textarea)
- Modal/Dialog component
- Toast notification component
- Badge/Status component
- Empty state component

### Responsive design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Sidebar collapse on mobile
- Table responsive (scroll or card layout)
- Form stacking on mobile

## Decisiones técnicas
- **CSS variables** — no CSS-in-JS, no styled-components
- **Mobile-first** — responsive desde base
- **No inline styles** — eliminar todos los inline styles temporarios
- **Consistent spacing** — usar scale de 4px (4, 8, 12, 16, 24, 32, 48, 64)

## Checklist
- [ ] Crear `theme.css` completo con CSS variables
- [ ] Refactorizar Sidebar con navegación real
- [ ] Refactorizar Header con responsive design
- [ ] Refactorizar DataTable con pagination UI
- [ ] Crear Button component library
- [ ] Crear Input component library
- [ ] Crear Modal component
- [ ] Crear Toast component
- [ ] Refactorizar formularios con validación
- [ ] Implementar mobile responsive
- [ ] Eliminar todos los inline styles temporarios
- [ ] Actualizar `GuiaDeContinuidad.md` con estado de Fase 16
