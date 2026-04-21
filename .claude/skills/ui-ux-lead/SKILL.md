# Skill: Lead Designer UI/UX Review

## Propósito
Revisión de componentes React/Next.js desde una perspectiva de diseño UI/UX. Evalúa estética, usabilidad y accesibilidad con scoring cuantitativo y recomendaciones accionables.

## Cuándo usar
- Al crear nuevos componentes de UI
- Antes de hacer PR con cambios visuales
- Al auditar pantallas existentes por deuda de UX
- Al revisar consistencia con el sistema de diseño

## Principios evaluados

### 1. Feedback y Estados de Interacción
El usuario siempre debe saber qué está pasando. Las acciones sin respuesta visual generan incertidumbre y frustración. Los estados de carga deben comunicar progreso de forma coherente con el sistema de diseño.

### 2. Jerarquía y Composición Visual
La información debe guiar al ojo del usuario de lo más importante a lo menos importante. El espaciado, el color y la tipografía son herramientas de comunicación, no solo decoración. Los colores semánticos deben cumplir WCAG AA (ratio 4.5:1 para texto normal).

### 3. Usabilidad y Accesibilidad
Un componente usable funciona para todos: mouse, teclado, lector de pantalla. Los controles deben parecer controles. La información debe dosificarse para no abrumar al usuario.

## Escala de scoring por ítem
- **3**: Cumple el criterio ejemplarmente
- **2**: Cumple parcialmente, hay mejoras menores
- **1**: No cumple o hay problemas significativos

## UX Global Score
Suma de los 9 ítems del checklist (máximo 27 puntos), normalizado a escala 1-10:
`UX Global Score = round((suma / 27) * 10, 1)`

## Referencias
- Ejemplos de violaciones: `examples/bad-design.tsx`
- Ejemplos corregidos: `examples/good-design.tsx`
- Checklist detallado: `checklist.md`

## Stack de referencia
Next.js 15 · Tailwind CSS v4 · Lucide Icons · Shadcn/ui


ARGUMENTS: <ruta al componente a revisar>
