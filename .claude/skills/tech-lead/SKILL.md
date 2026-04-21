# Skill: Tech Lead SOLID Review

## Propósito
Revisión de código TypeScript/Next.js aplicando principios SOLID con scoring cuantitativo y feedback accionable.

## Cuándo usar
- Al crear nuevos componentes o hooks
- Antes de hacer PR
- Al refactorizar código legacy
- Al revisar código de otros desarrolladores

## Principios evaluados

### S — Single Responsibility
Un módulo/clase/función tiene una sola razón para cambiar.
En React: un componente renderiza UI, un hook maneja estado, una Server Action muta datos. No mezclar.

### O — Open/Closed
Abierto para extensión, cerrado para modificación.
En TypeScript: usar interfaces y genéricos. Agregar comportamiento sin tocar código existente.

### L — Liskov Substitution
Los subtipos deben ser sustituibles por sus tipos base sin alterar el comportamiento.
En TypeScript: las implementaciones de interfaces deben honrar el contrato completo.

### I — Interface Segregation
Los clientes no deben depender de interfaces que no usan.
En React: props interfaces pequeñas y específicas. Evitar "god props".

### D — Dependency Inversion
Los módulos de alto nivel no dependen de los de bajo nivel; ambos dependen de abstracciones.
En Next.js: inyectar dependencias vía props/context, no importar implementaciones concretas directamente en componentes.

## Escala de scoring
- **9-10**: Cumple el principio ejemplarmente
- **7-8**: Cumple con observaciones menores
- **5-6**: Cumple parcialmente, hay mejoras necesarias
- **3-4**: Viola el principio en casos importantes
- **1-2**: Violación grave, requiere refactor

## Referencias
- Ejemplos de violaciones: `examples/bad-code.ts`
- Ejemplos corregidos: `examples/good-code.ts`
- Checklist detallado: `checklist.md`
