# Checklist UI/UX Lead — Next.js 15 / Tailwind / Shadcn

## 1. Feedback y Estados de Interacción

- [ ] **Feedback de Acción** (Score: 1-3)
  ¿Hay respuesta visual inmediata (Toast, cambio de color, animación) tras una acción del usuario?
  - 3: Feedback inmediato y semánticamente correcto (color + icono + mensaje)
  - 2: Hay feedback pero es incompleto (solo color, o solo texto)
  - 1: Sin feedback visual — el usuario no sabe si la acción tuvo efecto

- [ ] **Estados de Carga** (Score: 1-3)
  ¿Se usan Skeletons o Spinners coherentes mientras se procesan datos?
  - 3: Skeleton que replica la forma del contenido real; sin layout shift
  - 2: Spinner genérico o texto "Cargando…" sin forma visual
  - 1: Sin estado de carga — la UI parece rota o no responde

- [ ] **Empty States** (Score: 1-3)
  ¿Las pantallas sin datos son informativas y sugieren una acción al usuario?
  - 3: Ilustración/icono + mensaje explicativo + CTA claro
  - 2: Solo texto informativo, sin CTA
  - 1: Pantalla en blanco o sin ningún mensaje

## 2. Jerarquía y Composición Visual

- [ ] **Consistencia de Espaciado** (Score: 1-3)
  ¿Se respeta la cuadrícula de Tailwind y los márgenes son uniformes?
  - 3: Espaciado consistente con escala Tailwind (4px base); sin valores arbitrarios
  - 2: Algún valor arbitrario o inconsistencia menor entre componentes
  - 1: Espaciado irregular o hardcodeado en px fuera de la escala

- [ ] **Contraste y Color** (Score: 1-3)
  ¿Los colores semánticos (Éxito, Error, Alerta) cumplen WCAG AA (ratio ≥ 4.5:1 texto normal)?
  - 3: Todos los textos cumplen WCAG AA; colores semánticos coherentes en el sistema
  - 2: La mayoría cumple; algún texto secundario queda por debajo del ratio
  - 1: Colores decorativos sin semántica; texto con bajo contraste generalizado

- [ ] **Tipografía** (Score: 1-3)
  ¿Existe clara distinción visual entre títulos, cuerpos de texto y metadatos?
  - 3: Jerarquía de 3+ niveles clara (título / body / meta); tamaños y pesos diferenciados
  - 2: 2 niveles distinguibles; falta diferenciación en metadatos o etiquetas
  - 1: Texto monocromo y monoescala; el usuario no sabe qué leer primero

## 3. Usabilidad y Accesibilidad

- [ ] **Navegabilidad por teclado** (Score: 1-3)
  ¿Es posible usar las funciones principales solo con el teclado?
  - 3: Todos los controles son alcanzables con Tab; orden lógico; focus ring visible
  - 2: La mayoría es navegable; algún control sin focus ring o con orden extraño
  - 1: Componente no navegable por teclado; sin atributos ARIA relevantes

- [ ] **Affordance — Claridad de Control** (Score: 1-3)
  ¿Los elementos clickeables parecen clickeables?
  - 3: Botones con apariencia clara, cursor correcto, hover/active states visibles
  - 2: Algunos controles parecen texto plano o carecen de hover state
  - 1: Controles invisibles o que se confunden con contenido no interactivo

- [ ] **Carga Cognitiva** (Score: 1-3)
  ¿La información está dosificada o el componente abruma al usuario?
  - 3: Información progresiva; solo lo esencial es visible; detalles bajo demanda
  - 2: Algo de información secundaria visible que podría ocultarse
  - 1: Demasiada información simultánea; sin jerarquía de importancia clara

---

## Cálculo del UX Global Score

```
UX Global Score = round((suma_de_9_items / 27) * 10, 1)
```

| Rango | Interpretación |
|---|---|
| 9-10 | Diseño ejemplar, listo para producción |
| 7-8  | Bueno, con mejoras menores |
| 5-6  | Cumple parcialmente, refactor recomendado |
| 3-4  | Problemas importantes de UX |
| 1-2  | Rediseño necesario |
