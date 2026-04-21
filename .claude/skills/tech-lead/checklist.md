# Checklist SOLID — TypeScript / Next.js 15

## S — Single Responsibility

- [ ] El componente solo renderiza UI (no hace fetch, no contiene lógica de negocio)
- [ ] Los hooks solo manejan un aspecto del estado (no mezclan DnD + auth + data fetching)
- [ ] Las Server Actions realizan una sola mutación
- [ ] Las funciones tienen menos de 20 líneas efectivas
- [ ] Los archivos tienen menos de 150 líneas (señal de múltiples responsabilidades)
- [ ] Separación clara: `lib/` para utilidades puras, `actions/` para mutaciones, `hooks/` para estado
- [ ] No hay `console.log` de debug en producción

## O — Open/Closed

- [ ] Los componentes aceptan `className` o slots para extensión sin modificación
- [ ] Las variantes de UI usan `cva` (class-variance-authority), no if-else en cascada
- [ ] Los tipos usan `discriminated unions` en lugar de flags booleanos acumulados
- [ ] Las funciones usan callbacks/strategy pattern en lugar de switch por tipo
- [ ] Los hooks exponen configuración por parámetros, no hardcodean valores internos
- [ ] Se pueden agregar nuevos `TaskStatus` o `TaskPriority` sin tocar componentes existentes

## L — Liskov Substitution

- [ ] Los componentes con la misma interfaz son intercambiables (e.g., `TaskCard` vs `SortableTaskCard`)
- [ ] Los wrappers no reducen las garantías del componente envuelto
- [ ] Las implementaciones de interfaces no lanzan excepciones inesperadas
- [ ] Un componente hijo no rompe el layout del padre
- [ ] Los tipos narrowing no eliminan propiedades que el consumidor espera

## I — Interface Segregation

- [ ] Las props interfaces tienen ≤ 7 propiedades (señal de over-coupling)
- [ ] No hay props opcionales que nunca se usan juntas (candidatas a interfaces separadas)
- [ ] Los hooks no retornan más de lo que el consumidor necesita
- [ ] Las Server Actions no reciben `FormData` completo cuando solo necesitan 2 campos
- [ ] Los tipos importados son los mínimos necesarios (evitar `import *`)
- [ ] Las interfaces de Supabase están tipadas con los campos exactos requeridos

## D — Dependency Inversion

- [ ] Los componentes reciben datos via props, no hacen fetch internamente
- [ ] Los hooks reciben callbacks (e.g., `onMove`) en lugar de importar Server Actions directamente
- [ ] La lógica de negocio no importa implementaciones de UI
- [ ] Los tests pueden reemplazar dependencias sin modificar el código (inyección)
- [ ] `lib/supabase/` se usa como abstracción; los componentes no importan `@supabase/supabase-js` directamente
- [ ] Las Server Actions no están hardcodeadas en los hooks del cliente

## Señales de alerta generales (Next.js 15)

- [ ] No hay `'use client'` innecesario en Server Components
- [ ] No hay `useEffect` para data fetching (usar Server Components)
- [ ] No hay `any` en TypeScript
- [ ] No hay imports circulares entre `app/`, `components/`, `hooks/`, `actions/`
- [ ] Los `dynamic()` con `ssr: false` están en Client Components, no en Server Components
- [ ] Las variables de entorno privadas no se exponen al cliente
