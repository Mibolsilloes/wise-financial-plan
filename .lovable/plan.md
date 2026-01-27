
# Plan: Corregir Error 404 en Botón "Volver"

## Problema
El botón "Volver" en la página de extracto de cuenta navega a `/cuentas`, pero la ruta configurada en el router es `/contas` (portugués).

## Causa Raíz
Las rutas del router (`App.tsx`) usan nombres en portugués:
- `/contas` - Cuentas bancarias
- `/cartoes` - Tarjetas de crédito
- `/relatorios` - Informes
- `/configuracoes` - Ajustes

Pero la navegación en `AccountReport.tsx` usa `/cuentas` (español).

## Solución
Corregir las rutas de navegación en `AccountReport.tsx` para que usen `/contas` en lugar de `/cuentas`.

---

## Cambios a Realizar

### Archivo: src/pages/AccountReport.tsx

Hay **2 lugares** donde se debe corregir:

1. **Línea 448** - Botón "Volver":
   ```typescript
   // Antes
   onClick={() => navigate("/cuentas")}
   
   // Después
   onClick={() => navigate("/contas")}
   ```

2. **Línea 468** - Botón X en el badge de cuenta:
   ```typescript
   // Antes
   onClick={() => navigate("/cuentas")}
   
   // Después
   onClick={() => navigate("/contas")}
   ```

---

## Resultado Esperado
Al hacer clic en "Volver" o en la X del badge, el usuario regresará correctamente a la página de cuentas bancarias sin ver el error 404.

---

## Nota Adicional
En el futuro, sería bueno considerar estandarizar todas las rutas al español para mantener consistencia con las etiquetas de navegación. Por ahora, la corrección mantiene compatibilidad con el sistema de rutas existente.
