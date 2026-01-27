
# Plan: Corregir Página de Detalles de Factura de Tarjeta de Crédito

## Problemas Identificados

Analizando el archivo `CreditCardInvoice.tsx`, encontré los siguientes problemas:

1. **Filtros no funcionan**: La página tiene un `FilterPopover` que usa el `FilterContext`, pero el filtrado de transacciones (líneas 534-543) solo filtra por búsqueda de texto (`searchQuery`). No está leyendo los filtros globales del contexto (categoría, responsable, estado de pago, etc.).

2. **Tabla en portugués**: Múltiples textos están en portugués:
   - Encabezados: "Responsável", "Descrição", "Valor", "Categoria", "Parcela", "Data Compra", "Fixo/Variável"
   - Mensajes: "Nenhuma transação encontrada", "Não há transações para exibir"
   - Status cards: "Status da Fatura", "Valor da fatura", "Datas da fatura", "Fechamento", "Vencimento"
   - Botones: "Voltar", "Atualizar", "Limpar filtro"
   - Panel lateral: "Detalhes", "Cartão", "Bandeira", "Conta", "Limite", "Despesas"
   - Diálogo: "Personalize sua visualização", "Colunas visíveis", "Salvar Preferências"
   - Datos mock: "João", "Maria", "Eletrônicos", "Mercado", "Fixo", "Variável"

3. **Columna de acción sin menú**: El botón de engranaje (líneas 825-828) es solo un botón sin funcionalidad, no tiene menú de "Editar" y "Eliminar".

4. **Datos mock con IDs numéricos**: Similar al problema de AccountReport, las transacciones usan IDs numéricos simples (1, 2, 3...) que causarán errores al intentar editar/eliminar en Supabase.

---

## Solución Propuesta

### 1. Conectar con Datos Reales y FilterContext

Importar y usar:
- `useTransactions()` del TransactionsContext
- `useFilters()` del FilterContext

Modificar la lógica de `filteredTransactions` para aplicar todos los filtros:
- `filters.category` - Filtrar por categoría
- `filters.paymentStatus` - Filtrar por estado de pago
- `filters.responsible` - Filtrar por responsable
- `filters.transactionType` - Filtrar por tipo fijo/variable
- `searchQuery` - Búsqueda de texto

### 2. Traducir Todo a Español

```text
Traducciones principales:
├── Encabezados de tabla
│   ├── "Responsável" → "Responsable"
│   ├── "Descrição" → "Descripción"
│   ├── "Valor" → "Importe"
│   ├── "Categoria" → "Categoría"
│   ├── "Parcela" → "Cuota"
│   ├── "Data Compra" → "Fecha Compra"
│   └── "Fixo/Variável" → "Fijo/Variable"
├── Cards de estado
│   ├── "Status da Fatura" → "Estado de la Factura"
│   ├── "Valor da fatura" → "Importe de la factura"
│   ├── "Datas da fatura" → "Fechas de la factura"
│   ├── "Fechamento" → "Cierre"
│   └── "Vencimento" → "Vencimiento"
├── Botones
│   ├── "Voltar" → "Volver"
│   ├── "Atualizar" → "Actualizar"
│   └── "Limpar filtro" → "Limpiar filtro"
├── Panel lateral
│   ├── "Detalhes" → "Detalles"
│   ├── "Cartão" → "Tarjeta"
│   ├── "Bandeira" → "Marca"
│   ├── "Conta" → "Cuenta"
│   └── "Limite" → "Límite"
├── Mensajes
│   ├── "Nenhuma transação encontrada" → "No se encontraron transacciones"
│   └── "Não há transações..." → "No hay transacciones..."
└── Diálogo de configuración
    ├── "Personalize sua visualização" → "Personaliza tu visualización"
    ├── "Colunas visíveis" → "Columnas visibles"
    └── "Salvar Preferências" → "Guardar Preferencias"
```

### 3. Implementar Menú de Acciones

Reemplazar el botón de engranaje estático por un `DropdownMenu` con:
- **Editar**: Abre `EditTransactionDialog`
- **Eliminar**: Abre `DeleteTransactionDialog`

Agregar estados necesarios:
```typescript
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
```

Importar los diálogos:
```typescript
import { EditTransactionDialog } from "@/components/dashboard/EditTransactionDialog";
import { DeleteTransactionDialog } from "@/components/dashboard/DeleteTransactionDialog";
import { Pencil, Trash2 } from "lucide-react";
```

### 4. Conectar con TransactionsContext

Cambiar datos mock por datos reales:
```typescript
const { transactions: allTransactions, getTransactionsByCreditCard } = useTransactions();

// Filtrar transacciones de esta tarjeta de crédito
const cardTransactions = useMemo(() => {
  return allTransactions.filter(t => t.creditCard === card.name);
}, [allTransactions, card.name]);
```

Crear función de conversión para mapear transacciones al formato esperado por la tabla:
```typescript
const convertToTransaction = (t: LocalTransaction): Transaction => ({
  id: t.id,
  type: "gasto",
  description: t.descripcion,
  amount: Math.abs(t.valor),
  category: t.categoria,
  // ... resto de campos
});
```

---

## Archivos a Modificar

```text
src/pages/CreditCardInvoice.tsx
├── Importar: useFilters, useTransactions, EditTransactionDialog, DeleteTransactionDialog
├── Añadir: Estados para diálogos (editDialogOpen, deleteDialogOpen, selectedTransaction)
├── Modificar: filteredTransactions para usar FilterContext
├── Traducir: Todos los textos de portugués a español
├── Reemplazar: Botón de engranaje por DropdownMenu con Editar/Eliminar
├── Añadir: Diálogos EditTransactionDialog y DeleteTransactionDialog al final
└── Actualizar: Datos mock con IDs UUID para compatibilidad con Supabase
```

---

## Detalles Técnicos

### Lógica de Filtrado Corregida:

```typescript
const filteredTransactions = useMemo(() => {
  let result = transactions;

  // Filtro por categoría
  if (filters.category && filters.category !== "todas") {
    result = result.filter((t) => t.categoria === filters.category);
  }

  // Filtro por estado de pago
  if (filters.paymentStatus !== "todos") {
    result = result.filter((t) => {
      if (filters.paymentStatus === "pago") {
        return t.status === "pagado";
      }
      return t.status === "pendiente";
    });
  }

  // Filtro por responsable
  if (filters.responsible) {
    result = result.filter((t) => t.responsavel === filters.responsible);
  }

  // Filtro por tipo (fijo/variable)
  if (filters.transactionType !== "todos") {
    const expectedType = filters.transactionType === "fijas" ? "Fijo" : "Variable";
    result = result.filter((t) => t.fixoVariavel === expectedType);
  }

  // Filtro por búsqueda de texto
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter((t) =>
      t.descripcion.toLowerCase().includes(query) ||
      t.responsavel.toLowerCase().includes(query) ||
      t.categoria.toLowerCase().includes(query)
    );
  }

  return result;
}, [transactions, filters, searchQuery]);
```

### Estructura del Menú de Acciones:

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
      <Settings className="w-3.5 h-3.5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => handleEdit(transaction)}>
      <Pencil className="w-4 h-4 mr-2" />
      Editar
    </DropdownMenuItem>
    <DropdownMenuItem 
      onClick={() => handleDelete(transaction)}
      className="text-destructive"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Eliminar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Resultado Esperado

1. Los filtros del FilterPopover funcionarán correctamente, filtrando la tabla por categoría, estado, responsable, etc.
2. Toda la interfaz estará en español
3. El icono de engranaje mostrará un menú con opciones "Editar" y "Eliminar"
4. Las ediciones y eliminaciones se guardarán correctamente en la base de datos
