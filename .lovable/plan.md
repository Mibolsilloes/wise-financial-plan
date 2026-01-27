
# Plan: Conectar Extracto de Cuenta con Datos Reales

## Problema Identificado
La página de extracto de cuenta (`AccountReport.tsx`) usa datos mock locales con IDs numéricos simples (1, 2, 3...). Cuando se edita una transacción, el sistema intenta actualizar en Supabase usando estos IDs, pero la base de datos espera UUIDs, causando el error `invalid input syntax for type uuid: "2"`.

## Solución
Conectar la página con las transacciones reales del `TransactionsContext` que ya están sincronizadas con Supabase.

---

## Cambios Requeridos

### 1. Actualizar AccountReport.tsx

**Eliminar datos mock:**
- Remover el array `allTransactions` con datos hardcodeados (líneas 284-296)

**Usar transacciones reales:**
- Importar y usar `useTransactions()` del contexto
- Filtrar transacciones por cuenta usando el nombre de la cuenta

**Ajustar la transformación de datos:**
- Adaptar el mapeo para usar la estructura real de `Transaction`
- Los IDs ya serán UUIDs válidos desde Supabase

### 2. Actualizar la lógica de filtrado

- Modificar `filteredTransactions` para trabajar con el formato `Transaction` real
- Ajustar las propiedades de fecha (`dueDate` en vez de `fechaVencimiento`)
- Mantener la compatibilidad con el sistema de filtros existente

### 3. Simplificar convertToTransaction

- Ya no será necesaria una conversión compleja
- Las transacciones del contexto ya tienen el formato correcto

---

## Código a Modificar

```text
src/pages/AccountReport.tsx
├── Añadir: const { transactions } = useTransactions();
├── Eliminar: array allTransactions mock (líneas 284-296)
├── Modificar: filteredTransactions para usar transactions del contexto
├── Adaptar: propiedades de fecha al formato Transaction real
└── Simplificar: función convertToTransaction
```

---

## Beneficios

1. Las ediciones se guardarán correctamente en Supabase
2. Los datos mostrados serán los datos reales del usuario
3. Los cambios se reflejarán inmediatamente en la UI
4. Consistencia con el resto de la aplicación (dashboard, informes)

---

## Detalles Técnicos

La estructura actual de Transaction en el contexto:
- `id`: UUID (string) - compatible con Supabase
- `type`: "ingreso" | "gasto"
- `dueDate`: Date
- `paymentDate`: Date | undefined
- `competenceDate`: Date
- `status`: "pagado" | "pendiente" | "cobrado" | "por_cobrar"

Esto reemplazará la estructura mock que usaba:
- `id`: número simple (1, 2, 3...)
- `fechaVencimiento`: string
- `fechaPago`: string

